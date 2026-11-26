import json
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.db.models import Avg, Count, Q
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib import messages
from django.db import transaction
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .models import CartItem, ProductReview, SellerProduct, UserProfile
from .session_keys import AUTH_SESSION_KEY

PRODUCT_CATEGORIES = (
    'Laptopy',
    'Komputery',
    'Podzespoły',
    'Monitory',
    'Gaming',
    'Akcesoria',
    'Start home',
)

def dashboard(request):
    static_files = (
        settings.BASE_DIR / 'static' / 'js' / 'main.js',
        settings.BASE_DIR / 'static' / 'assets' / 'main.css',
    )
    static_version = '-'.join(str(path.stat().st_mtime_ns) for path in static_files)

    return render(request, 'dashboard.html', {
        'title': 'IT-Logic',
        'vite_server_url': None,
        'static_version': static_version,
    })


def product_detail(request, product_id):
    return dashboard(request)


@require_GET
def api_products(request):
    query = request.GET.get('q', '').strip()
    seller_products = SellerProduct.objects.select_related('seller').annotate(
        average_rating=Avg('reviews__rating'),
        review_count=Count('reviews'),
    )
    if query:
        seller_products = seller_products.filter(
            Q(name__icontains=query) | Q(category__icontains=query)
        )

    profile_id = request.session.get(AUTH_SESSION_KEY)
    user_reviews = {}
    if profile_id is not None:
        if UserProfile.objects.filter(pk=profile_id).exists():
            user_reviews = {
                review.product_id: {
                    'rating': review.rating,
                    'comment': review.comment,
                }
                for review in ProductReview.objects.filter(user_id=profile_id)
            }
        else:
            request.session.pop(AUTH_SESSION_KEY, None)

    products = []
    for product in seller_products:
        product_data = product.to_api_data()
        product_data['myReview'] = user_reviews.get(product.pk)
        products.append(product_data)
    return JsonResponse({'products': products})


def _current_profile(request):
    profile_id = request.session.get(AUTH_SESSION_KEY)
    if profile_id is None:
        return None, JsonResponse({'error': 'Zaloguj się, aby dodać opinię.'}, status=401)

    try:
        profile = UserProfile.objects.get(pk=profile_id)
    except UserProfile.DoesNotExist:
        request.session.pop(AUTH_SESSION_KEY, None)
        return None, JsonResponse({'error': 'Zaloguj się, aby dodać opinię.'}, status=401)

    return profile, None


@require_http_methods(['GET', 'POST'])
def api_product_reviews(request, product_id):
    seller_product_id = product_id - SellerProduct.API_ID_OFFSET
    product = SellerProduct.objects.filter(pk=seller_product_id).first()
    if product is None:
        return JsonResponse({'error': 'Nie znaleziono produktu.'}, status=404)

    if request.method == 'GET':
        profile_id = request.session.get(AUTH_SESSION_KEY)
        profile = UserProfile.objects.filter(pk=profile_id).first() if profile_id else None
        if profile_id and profile is None:
            request.session.pop(AUTH_SESSION_KEY, None)

        reviews = ProductReview.objects.filter(product=product).select_related('user')
        review_data = [
            {
                'rating': review.rating,
                'comment': review.comment,
                'author': review.user.username,
                'createdAt': review.created_at.isoformat(),
            }
            for review in reviews
        ]
        own_review = ProductReview.objects.filter(product=product, user=profile).first() if profile else None
        return JsonResponse({
            'reviews': review_data,
            'review': None if own_review is None else {
                'rating': own_review.rating,
                'comment': own_review.comment,
            },
        })

    profile, error = _current_profile(request)
    if error:
        return error

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'error': 'Nieprawidłowe dane opinii.'}, status=400)
    if not isinstance(data, dict):
        return JsonResponse({'error': 'Nieprawidłowe dane opinii.'}, status=400)

    rating = data.get('rating')
    if isinstance(rating, bool) or not isinstance(rating, int) or not 1 <= rating <= 5:
        return JsonResponse({'error': 'Ocena musi wynosić od 1 do 5 gwiazdek.'}, status=400)

    comment = data.get('comment')
    if not isinstance(comment, str) or not comment.strip():
        return JsonResponse({'error': 'Wpisz treść opinii.'}, status=400)
    comment = comment.strip()
    if len(comment) > 1000:
        return JsonResponse({'error': 'Opinia może mieć maksymalnie 1000 znaków.'}, status=400)

    review, created = ProductReview.objects.update_or_create(
        product=product,
        user=profile,
        defaults={'rating': rating, 'comment': comment},
    )
    product = SellerProduct.objects.annotate(
        average_rating=Avg('reviews__rating'),
        review_count=Count('reviews'),
    ).get(pk=product.pk)
    product_data = product.to_api_data()
    product_data['myReview'] = {'rating': review.rating, 'comment': review.comment}

    return JsonResponse({
        'message': 'Opinia została zapisana.',
        'review': product_data['myReview'],
        'product': product_data,
    }, status=201 if created else 200)


def _current_seller(request):
    profile_id = request.session.get(AUTH_SESSION_KEY)
    if profile_id is None:
        return None, JsonResponse({'error': 'Zaloguj się jako sprzedawca.'}, status=401)

    try:
        seller = UserProfile.objects.get(pk=profile_id)
    except UserProfile.DoesNotExist:
        request.session.pop(AUTH_SESSION_KEY, None)
        return None, JsonResponse({'error': 'Zaloguj się jako sprzedawca.'}, status=401)

    if seller.role != 'seller':
        return None, JsonResponse({'error': 'Brak uprawnień sprzedawcy.'}, status=403)
    return seller, None


@require_http_methods(['GET', 'POST'])
def api_seller_create_product(request):
    seller, error = _current_seller(request)
    if error:
        return error

    if request.method == 'GET':
        products = SellerProduct.objects.filter(seller=seller)
        return JsonResponse({'products': [product.to_api_data() for product in products]})

    name = request.POST.get('name', '').strip()
    category = request.POST.get('category', '').strip()
    raw_price = request.POST.get('price', '').strip()
    description = request.POST.get('description', '').strip()
    raw_discount_percent = request.POST.get('discount_percent', '0').strip()
    image = request.FILES.get('image')

    if not name or len(name) > 120:
        return JsonResponse({'error': 'Nazwa produktu jest wymagana (maks. 120 znaków).'}, status=400)
    if category not in PRODUCT_CATEGORIES:
        return JsonResponse({'error': 'Wybierz prawidłową kategorię.'}, status=400)
    if len(description) > 5000:
        return JsonResponse({'error': 'Opis może mieć maksymalnie 5000 znaków.'}, status=400)
    try:
        price = Decimal(raw_price)
    except InvalidOperation:
        return JsonResponse({'error': 'Podaj prawidłową cenę.'}, status=400)
    if not price.is_finite() or price <= 0 or price > Decimal('99999999.99'):
        return JsonResponse({'error': 'Cena musi być większa od zera.'}, status=400)
    try:
        discount_percent = int(raw_discount_percent)
    except ValueError:
        return JsonResponse({'error': 'Podaj prawidłowy procent promocji.'}, status=400)
    if not 0 <= discount_percent <= 100:
        return JsonResponse({'error': 'Promocja musi wynosić od 0% do 100%.'}, status=400)
    if image is None:
        return JsonResponse({'error': 'Dodaj zdjęcie produktu.'}, status=400)
    if image.size > 5 * 1024 * 1024:
        return JsonResponse({'error': 'Zdjęcie może mieć maksymalnie 5 MB.'}, status=400)

    image_header = image.read(12)
    image.seek(0)
    is_supported_image = (
        image_header.startswith(b'\xff\xd8\xff')
        or image_header.startswith(b'\x89PNG\r\n\x1a\n')
        or image_header.startswith((b'GIF87a', b'GIF89a'))
        or (
            image_header.startswith(b'RIFF')
            and image_header[8:12] == b'WEBP'
        )
    )
    if not is_supported_image:
        return JsonResponse({'error': 'Dozwolone są zdjęcia JPG, PNG, GIF lub WebP.'}, status=400)

    product = SellerProduct.objects.create(
        seller=seller,
        name=name,
        category=category,
        price=price,
        description=description,
        discount_percent=discount_percent,
        image=image,
    )
    return JsonResponse(
        {'message': 'Produkt został dodany.', 'product': product.to_api_data()},
        status=201,
    )


@require_http_methods(['GET'])
def api_product_detail(request, product_id):
    seller_product_id = product_id - SellerProduct.API_ID_OFFSET
    product = SellerProduct.objects.select_related('seller').annotate(
        average_rating=Avg('reviews__rating'),
        review_count=Count('reviews'),
    ).filter(pk=seller_product_id).first()
    if product is None:
        return JsonResponse({'error': 'Nie znaleziono produktu.'}, status=404)
    return JsonResponse({'product': product.to_api_data()})


@require_http_methods(['POST', 'PUT', 'PATCH'])
def api_seller_update_product(request, product_id):
    seller, error = _current_seller(request)
    if error:
        return error

    seller_product_id = product_id - SellerProduct.API_ID_OFFSET
    with transaction.atomic():
        product = SellerProduct.objects.select_for_update().filter(
            pk=seller_product_id,
            seller=seller,
        ).first()
        if product is None:
            return JsonResponse({'error': 'Nie znaleziono Twojego produktu.'}, status=404)

        name = request.POST.get('name', product.name).strip()
        category = request.POST.get('category', product.category).strip()
        description = request.POST.get('description', product.description).strip()
        raw_price = request.POST.get('price', str(product.price)).strip()
        raw_discount_percent = request.POST.get(
            'discount_percent',
            str(product.discount_percent),
        ).strip()

        if not name or len(name) > 120:
            return JsonResponse({'error': 'Nazwa produktu jest wymagana (maks. 120 znaków).'}, status=400)
        if category not in PRODUCT_CATEGORIES:
            return JsonResponse({'error': 'Wybierz prawidłową kategorię.'}, status=400)
        if len(description) > 5000:
            return JsonResponse({'error': 'Opis może mieć maksymalnie 5000 znaków.'}, status=400)
        try:
            price = Decimal(raw_price)
        except InvalidOperation:
            return JsonResponse({'error': 'Podaj prawidłową cenę.'}, status=400)
        if not price.is_finite() or price <= 0 or price > Decimal('99999999.99'):
            return JsonResponse({'error': 'Cena musi być większa od zera.'}, status=400)
        try:
            discount_percent = int(raw_discount_percent)
        except ValueError:
            return JsonResponse({'error': 'Podaj prawidłowy procent promocji.'}, status=400)
        if not 0 <= discount_percent <= 100:
            return JsonResponse({'error': 'Promocja musi wynosić od 0% do 100%.'}, status=400)

        image = request.FILES.get('image')
        old_image_name = None
        if image is not None:
            if image.size > 5 * 1024 * 1024:
                return JsonResponse({'error': 'Zdjęcie może mieć maksymalnie 5 MB.'}, status=400)
            image_header = image.read(12)
            image.seek(0)
            supported = image_header.startswith(b'\xff\xd8\xff') or image_header.startswith(b'\x89PNG\r\n\x1a\n') or image_header.startswith((b'GIF87a', b'GIF89a')) or (image_header.startswith(b'RIFF') and image_header[8:12] == b'WEBP')
            if not supported:
                return JsonResponse({'error': 'Dozwolone są zdjęcia JPG, PNG, GIF lub WebP.'}, status=400)
            old_image_name = product.image.name

        product.name = name
        product.category = category
        product.price = price
        product.description = description
        product.discount_percent = discount_percent
        if image is not None:
            product.image = image
        product.save()

        if old_image_name:
            product.image.storage.delete(old_image_name)
        return JsonResponse({'message': 'Produkt został zaktualizowany.', 'product': product.to_api_data()})

@require_http_methods(['DELETE'])
def api_seller_delete_product(request, product_id):
    seller, error = _current_seller(request)
    if error:
        return error

    seller_product_id = product_id - SellerProduct.API_ID_OFFSET
    with transaction.atomic():
        product = SellerProduct.objects.select_for_update().filter(
            pk=seller_product_id,
            seller=seller,
        ).first()
        if product is None:
            return JsonResponse({'error': 'Nie znaleziono Twojego produktu.'}, status=404)

        image_storage = product.image.storage
        image_name = product.image.name
        CartItem.objects.filter(product_id=product.pk).delete()
        product.delete()

    if image_name:
        image_storage.delete(image_name)
    return JsonResponse({'message': 'Produkt został usunięty.'})


def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

    if password != confirm_password:
        messages.error("Hasła się nie zgadzają!")
        return redirect('register')
    if User.objects.filter(username=username).exists():
        messages.error('Nazwa jest już zajęta')
        return redirect('register')
    if User.objects.filter(email=email).exists():
        messages.error('Adres email jest już zajęty')
        return redirect('register')
    if User.objects.filter(phone=phone).exists():
        messages.error('Numer telefonu jest już zajęty')
        return redirect('register')

    UserProfile.objects.create(
        username=username,
        email=email,
        phon=phone,
        password=make_password(password),
        created_at=timezone.now()
    )

    return render(request, 'frontend/src/App.jsx')

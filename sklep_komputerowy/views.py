from decimal import Decimal, InvalidOperation

from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib import messages
from django.views.decorators.http import require_GET, require_POST

from .models import SellerProduct, UserProfile
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
    return render(request, 'dashboard.html', {
        'title': 'IT-Logic',
        'vite_server_url': None,
    })


@require_GET
def api_products(request):
    seller_products = SellerProduct.objects.all()
    products = [product.to_api_data() for product in seller_products]
    return JsonResponse({'products': products})


@require_POST
def api_seller_create_product(request):
    profile_id = request.session.get(AUTH_SESSION_KEY)
    if profile_id is None:
        return JsonResponse({'error': 'Zaloguj się jako sprzedawca.'}, status=401)

    try:
        seller = UserProfile.objects.get(pk=profile_id)
    except UserProfile.DoesNotExist:
        request.session.pop(AUTH_SESSION_KEY, None)
        return JsonResponse({'error': 'Zaloguj się jako sprzedawca.'}, status=401)

    if seller.role != 'seller':
        return JsonResponse({'error': 'Brak uprawnień sprzedawcy.'}, status=403)

    name = request.POST.get('name', '').strip()
    category = request.POST.get('category', '').strip()
    raw_price = request.POST.get('price', '').strip()
    image = request.FILES.get('image')

    if not name or len(name) > 120:
        return JsonResponse({'error': 'Nazwa produktu jest wymagana (maks. 120 znaków).'}, status=400)
    if category not in PRODUCT_CATEGORIES:
        return JsonResponse({'error': 'Wybierz prawidłową kategorię.'}, status=400)
    try:
        price = Decimal(raw_price)
    except InvalidOperation:
        return JsonResponse({'error': 'Podaj prawidłową cenę.'}, status=400)
    if not price.is_finite() or price <= 0 or price > Decimal('99999999.99'):
        return JsonResponse({'error': 'Cena musi być większa od zera.'}, status=400)
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
        image=image,
    )
    return JsonResponse(
        {'message': 'Produkt został dodany.', 'product': product.to_api_data()},
        status=201,
    )

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
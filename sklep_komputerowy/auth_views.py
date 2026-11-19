import json

from django.contrib.auth.hashers import check_password, make_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST, require_http_methods

from .models import Cart, CartItem, UserProfile
from .session_keys import AUTH_SESSION_KEY


def _read_json(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    return data if isinstance(data, dict) else None


def _user_data(user):
    role = user.role or 'customer'
    labels = {
        'customer': 'Klient',
        'seller': 'Sprzedawca',
        'admin': 'Administrator',
    }
    return {'email': user.email, 'role': role, 'label': labels.get(role, 'Użytkownik')}


def _admin_profile(request):
    profile_id = request.session.get(AUTH_SESSION_KEY)
    if profile_id is None:
        return None, JsonResponse({'error': 'Zaloguj się jako administrator.'}, status=401)

    try:
        user = UserProfile.objects.get(pk=profile_id)
    except UserProfile.DoesNotExist:
        request.session.pop(AUTH_SESSION_KEY, None)
        return None, JsonResponse({'error': 'Zaloguj się jako administrator.'}, status=401)

    if user.role != 'admin':
        return None, JsonResponse({'error': 'Brak uprawnień administratora.'}, status=403)
    return user, None


def _seller_data(seller):
    return {
        'id': seller.pk,
        'username': seller.username,
        'email': seller.email,
        'phone': seller.phone or '',
    }


@require_GET
@ensure_csrf_cookie
def api_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})


@require_GET
def api_current_user(request):
    profile_id = request.session.get(AUTH_SESSION_KEY)
    if profile_id is None:
        return JsonResponse({'error': 'Nie jesteś zalogowany.'}, status=401)

    try:
        user = UserProfile.objects.get(pk=profile_id)
    except UserProfile.DoesNotExist:
        request.session.pop(AUTH_SESSION_KEY, None)
        return JsonResponse({'error': 'Nie jesteś zalogowany.'}, status=401)

    return JsonResponse({'user': _user_data(user)})


@require_POST
def api_register(request):
    data = _read_json(request)
    if data is None:
        return JsonResponse({'error': 'Nieprawidłowe dane.'}, status=400)

    username = data.get('username')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    required_fields = (username, email, phone, password)
    if not all(isinstance(value, str) and value.strip() for value in required_fields):
        return JsonResponse({'error': 'Wszystkie pola są wymagane.'}, status=400)

    username = username.strip()
    email = email.strip()
    phone = phone.strip()

    if len(username) > 50:
        return JsonResponse({'error': 'Nazwa użytkownika może mieć maksymalnie 50 znaków.'}, status=400)
    if len(email) > 100:
        return JsonResponse({'error': 'Email może mieć maksymalnie 100 znaków.'}, status=400)
    if len(phone) > 20:
        return JsonResponse({'error': 'Numer telefonu może mieć maksymalnie 20 znaków.'}, status=400)
    if len(password) < 8:
        return JsonResponse({'error': 'Hasło musi mieć co najmniej 8 znaków.'}, status=400)
    if confirm_password != password:
        return JsonResponse({'error': 'Hasła się nie zgadzają.'}, status=400)

    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse({'error': 'Podaj prawidłowy adres email.'}, status=400)

    if UserProfile.objects.filter(username__iexact=username).exists():
        return JsonResponse({'error': 'Ta nazwa użytkownika jest już zajęta.'}, status=400)
    if UserProfile.objects.filter(email__iexact=email).exists():
        return JsonResponse({'error': 'Ten adres email jest już zajęty.'}, status=400)

    try:
        with transaction.atomic():
            UserProfile.objects.create(
                username=username,
                email=email,
                phone=phone,
                password=make_password(password),
            )
    except IntegrityError:
        return JsonResponse(
            {'error': 'Użytkownik o tej nazwie lub adresie email już istnieje.'},
            status=400,
        )

    return JsonResponse({'message': 'Konto zostało utworzone.'}, status=201)


@require_POST
def api_login(request):
    data = _read_json(request)
    if data is None:
        return JsonResponse({'error': 'Nieprawidłowe dane.'}, status=400)

    email = data.get('email')
    password = data.get('password')
    if not isinstance(email, str) or not isinstance(password, str) or not email or not password:
        return JsonResponse({'error': 'Email i hasło są wymagane.'}, status=400)

    user = UserProfile.objects.filter(email__iexact=email.strip()).first()
    if user is None or not check_password(password, user.password):
        return JsonResponse({'error': 'Nieprawidłowy email lub hasło.'}, status=401)

    request.session.cycle_key()
    request.session[AUTH_SESSION_KEY] = user.pk
    from .cart_views import merge_guest_cart

    merge_guest_cart(request, user)
    return JsonResponse({'user': _user_data(user)})


@require_POST
def api_logout(request):
    request.session.flush()
    return JsonResponse({'message': 'Wylogowano.'})


@require_GET
def api_admin_sellers(request):
    _, error = _admin_profile(request)
    if error:
        return error

    sellers = UserProfile.objects.filter(role='seller').order_by('username')
    return JsonResponse({'sellers': [_seller_data(seller) for seller in sellers]})


@require_POST
def api_admin_create_seller(request):
    _, error = _admin_profile(request)
    if error:
        return error

    data = _read_json(request)
    if data is None:
        return JsonResponse({'error': 'Nieprawidłowe dane.'}, status=400)

    username = data.get('username')
    email = data.get('email')
    phone = data.get('phone', '')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if not all(isinstance(value, str) for value in (username, email, phone, password)):
        return JsonResponse({'error': 'Nieprawidłowe dane sprzedawcy.'}, status=400)

    username = username.strip()
    email = email.strip()
    phone = phone.strip()
    if not username or not email or not password:
        return JsonResponse({'error': 'Nazwa, email i hasło są wymagane.'}, status=400)
    if len(username) > 50 or len(email) > 100 or len(phone) > 20:
        return JsonResponse({'error': 'Jedno z pól przekracza dozwoloną długość.'}, status=400)
    if len(password) < 8:
        return JsonResponse({'error': 'Hasło musi mieć co najmniej 8 znaków.'}, status=400)
    if confirm_password != password:
        return JsonResponse({'error': 'Hasła się nie zgadzają.'}, status=400)

    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse({'error': 'Podaj prawidłowy adres email.'}, status=400)

    if UserProfile.objects.filter(username__iexact=username).exists():
        return JsonResponse({'error': 'Ta nazwa użytkownika jest już zajęta.'}, status=400)
    if UserProfile.objects.filter(email__iexact=email).exists():
        return JsonResponse({'error': 'Ten adres email jest już zajęty.'}, status=400)

    try:
        with transaction.atomic():
            seller = UserProfile.objects.create(
                username=username,
                email=email,
                phone=phone or None,
                password=make_password(password),
                role='seller',
            )
    except IntegrityError:
        return JsonResponse(
            {'error': 'Użytkownik o tej nazwie lub adresie email już istnieje.'},
            status=400,
        )

    return JsonResponse(
        {'message': 'Konto sprzedawcy zostało utworzone.', 'seller': _seller_data(seller)},
        status=201,
    )


@require_http_methods(['DELETE'])
def api_admin_delete_seller(request, seller_id):
    _, error = _admin_profile(request)
    if error:
        return error

    with transaction.atomic():
        seller = UserProfile.objects.select_for_update().filter(
            pk=seller_id,
            role='seller',
        ).first()
        if seller is None:
            return JsonResponse({'error': 'Nie znaleziono sprzedawcy.'}, status=404)

        cart = Cart.objects.filter(user=seller).first()
        if cart is not None:
            CartItem.objects.filter(cart=cart).delete()
            cart.delete()
        seller.delete()

    return JsonResponse({'message': 'Konto sprzedawcy zostało usunięte.'})

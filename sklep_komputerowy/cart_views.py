import json

from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST, require_http_methods

from .models import Cart, CartItem, SellerProduct, UserProfile
from .session_keys import AUTH_SESSION_KEY, GUEST_CART_SESSION_KEY


def _seller_products_by_ids(product_ids):
    product_ids = {
        product_id for product_id in product_ids
        if product_id >= SellerProduct.API_ID_OFFSET
    }
    seller_ids = {
        product_id - SellerProduct.API_ID_OFFSET
        for product_id in product_ids
    }
    products = SellerProduct.objects.filter(pk__in=seller_ids)
    return {product.api_id: product for product in products}


def _current_profile(request):
    profile_id = request.session.get(AUTH_SESSION_KEY)
    if profile_id is None:
        return None

    try:
        return UserProfile.objects.get(pk=profile_id)
    except UserProfile.DoesNotExist:
        request.session.pop(AUTH_SESSION_KEY, None)
        return None


def _get_cart(profile, create=False, lock=False):
    if create:
        cart, _ = Cart.objects.get_or_create(user=profile)
    else:
        cart = Cart.objects.filter(user=profile).first()

    if cart is not None and lock:
        cart = Cart.objects.select_for_update().get(pk=cart.pk)

    return cart


def _cart_data(cart=None, guest_items=None):
    items = []
    if guest_items is not None:
        products = _seller_products_by_ids(guest_items)
        for product_id, quantity in guest_items.items():
            product = products.get(product_id)
            if product is not None:
                items.append({**product.to_api_data(), 'quantity': quantity})
    elif cart is not None:
        cart_items = list(CartItem.objects.filter(cart=cart).order_by('cart_item_id'))
        for item in cart_items:
            items.append({**item.product.to_api_data(), 'quantity': item.quantity})

    return {
        'items': items,
        'totalItems': sum(item['quantity'] for item in items),
    }


def _guest_cart(request):
    stored_items = request.session.get(GUEST_CART_SESSION_KEY, {})
    if not isinstance(stored_items, dict):
        return {}

    items = {}
    for product_id, quantity in stored_items.items():
        try:
            product_id = int(product_id)
        except (TypeError, ValueError):
            continue
        if (
            product_id >= SellerProduct.API_ID_OFFSET
            and isinstance(quantity, int)
            and not isinstance(quantity, bool)
            and quantity > 0
        ):
            items[product_id] = quantity
    return items


def merge_guest_cart(request, profile):
    guest_items = _guest_cart(request)
    if not guest_items:
        request.session.pop(GUEST_CART_SESSION_KEY, None)
        return

    with transaction.atomic():
        cart = _get_cart(profile, create=True, lock=True)
        products = _seller_products_by_ids(guest_items)
        for api_product_id, quantity in guest_items.items():
            product = products.get(api_product_id)
            if product is None:
                continue
            item = CartItem.objects.select_for_update().filter(
                cart=cart,
                product_id=product.pk,
            ).first()
            if item is None:
                CartItem.objects.create(
                    cart=cart,
                    product=product,
                    quantity=quantity,
                )
            else:
                item.quantity += quantity
                item.save(update_fields=['quantity'])

        cart.updated_at = timezone.now()
        cart.save(update_fields=['updated_at'])

    request.session.pop(GUEST_CART_SESSION_KEY, None)


@require_GET
def api_cart(request):
    profile = _current_profile(request)
    if profile is None:
        return JsonResponse(_cart_data(guest_items=_guest_cart(request)))
    cart = _get_cart(profile)
    return JsonResponse(_cart_data(cart))


@require_POST
def api_cart_add(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'error': 'Nieprawidłowe dane.'}, status=400)

    if not isinstance(data, dict):
        return JsonResponse({'error': 'Nieprawidłowe dane.'}, status=400)

    product_id = data.get('product_id')
    if isinstance(product_id, bool) or not isinstance(product_id, int):
        return JsonResponse({'error': 'Nieprawidłowy produkt.'}, status=400)
    product = _seller_products_by_ids([product_id]).get(product_id)
    if product is None:
        return JsonResponse({'error': 'Produkt jest niedostępny.'}, status=404)

    profile = _current_profile(request)
    if profile is None:
        guest_items = _guest_cart(request)
        guest_items[product_id] = guest_items.get(product_id, 0) + 1
        request.session[GUEST_CART_SESSION_KEY] = {
            str(key): quantity for key, quantity in guest_items.items()
        }
        request.session.modified = True
        return JsonResponse(_cart_data(guest_items=guest_items))

    with transaction.atomic():
        cart = _get_cart(profile, create=True, lock=True)
        item = CartItem.objects.select_for_update().filter(
            cart=cart,
            product_id=product.pk,
        ).first()
        if item is None:
            CartItem.objects.create(cart=cart, product=product, quantity=1)
        else:
            item.quantity += 1
            item.save(update_fields=['quantity'])

        cart.updated_at = timezone.now()
        cart.save(update_fields=['updated_at'])

    return JsonResponse(_cart_data(cart))


@require_http_methods(['DELETE'])
def api_cart_remove(request, product_id):
    profile = _current_profile(request)
    if profile is None:
        guest_items = _guest_cart(request)
        if product_id not in guest_items:
            return JsonResponse({'error': 'Produkt nie znajduje się w koszyku.'}, status=404)
        del guest_items[product_id]
        request.session[GUEST_CART_SESSION_KEY] = {
            str(key): quantity for key, quantity in guest_items.items()
        }
        request.session.modified = True
        return JsonResponse(_cart_data(guest_items=guest_items))

    product = _seller_products_by_ids([product_id]).get(product_id)
    if product is None:
        return JsonResponse({'error': 'Produkt nie znajduje się w koszyku.'}, status=404)

    with transaction.atomic():
        cart = _get_cart(profile, lock=True)
        if cart is None:
            return JsonResponse({'error': 'Produkt nie znajduje się w koszyku.'}, status=404)

        deleted, _ = CartItem.objects.filter(cart=cart, product_id=product.pk).delete()
        if not deleted:
            return JsonResponse({'error': 'Produkt nie znajduje się w koszyku.'}, status=404)

        cart.updated_at = timezone.now()
        cart.save(update_fields=['updated_at'])

    return JsonResponse(_cart_data(cart))

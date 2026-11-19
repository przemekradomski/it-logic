"""
URL configuration for itLogic project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.urls import path
from django.conf.urls.static import static
from sklep_komputerowy.cart_views import api_cart, api_cart_add, api_cart_remove
from sklep_komputerowy.views import dashboard, api_products, api_seller_create_product
from sklep_komputerowy.auth_views import (
    api_csrf,
    api_current_user,
    api_login,
    api_logout,
    api_register,
    api_admin_sellers,
    api_admin_create_seller,
    api_admin_delete_seller,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', dashboard, name='home'),
    path('dashboard/', dashboard, name='dashboard'),
    path('api/products/', api_products, name='api_products'),
    path('api/seller/products/', api_seller_create_product, name='api_seller_create_product'),
    path('api/auth/csrf/', api_csrf, name='api_csrf'),
    path('api/auth/me/', api_current_user, name='api_current_user'),
    path('api/auth/register/', api_register, name='api_register'),
    path('api/auth/login/', api_login, name='api_login'),
    path('api/auth/logout/', api_logout, name='api_logout'),
    path('api/admin/sellers/', api_admin_sellers, name='api_admin_sellers'),
    path('api/admin/sellers/create/', api_admin_create_seller, name='api_admin_create_seller'),
    path(
        'api/admin/sellers/<int:seller_id>/delete/',
        api_admin_delete_seller,
        name='api_admin_delete_seller',
    ),
    path('api/cart/', api_cart, name='api_cart'),
    path('api/cart/items/', api_cart_add, name='api_cart_add'),
    path('api/cart/items/<int:product_id>/', api_cart_remove, name='api_cart_remove'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

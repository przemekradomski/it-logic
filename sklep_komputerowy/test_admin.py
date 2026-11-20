import json
import os
import tempfile
from io import StringIO
from unittest.mock import patch

from django.contrib.auth.hashers import check_password
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.db import connection
from django.test import TransactionTestCase, override_settings

from .models import Cart, CartItem, SellerProduct, UserProfile
from .session_keys import AUTH_SESSION_KEY


class AdminSellerApiTests(TransactionTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command('ensure_cart_tables', stdout=StringIO())

    @classmethod
    def tearDownClass(cls):
        with connection.schema_editor() as schema_editor:
            schema_editor.delete_model(CartItem)
            schema_editor.delete_model(Cart)
        super().tearDownClass()

    def setUp(self):
        self.admin = UserProfile.objects.create(
            username='store-admin',
            email='admin@example.com',
            password='unused',
            role='admin',
        )
        self.seller = UserProfile.objects.create(
            username='store-seller',
            email='seller@example.com',
            password='unused',
            role='seller',
        )

    def _login_as(self, profile):
        session = self.client.session
        session[AUTH_SESSION_KEY] = profile.pk
        session.save()

    def _fixture_teardown(self):
        CartItem.objects.all().delete()
        Cart.objects.all().delete()
        super()._fixture_teardown()

    def test_seller_list_requires_admin_role(self):
        self._login_as(self.seller)

        response = self.client.get('/api/admin/sellers/')

        self.assertEqual(response.status_code, 403)

    def test_admin_can_create_and_delete_seller(self):
        self._login_as(self.admin)
        payload = {
            'username': 'new-seller',
            'email': 'new-seller@example.com',
            'phone': '123456789',
            'password': 'seller-password',
            'confirm_password': 'seller-password',
        }

        create_response = self.client.post(
            '/api/admin/sellers/create/',
            data=json.dumps(payload),
            content_type='application/json',
        )

        self.assertEqual(create_response.status_code, 201)
        created_seller = UserProfile.objects.get(username='new-seller')
        self.assertEqual(created_seller.role, 'seller')
        self.assertTrue(check_password('seller-password', created_seller.password))
        cart = Cart.objects.create(user=created_seller)
        cart_item = CartItem.objects.create(cart=cart, product_id=1, quantity=1)

        delete_response = self.client.delete(
            f'/api/admin/sellers/{created_seller.pk}/delete/'
        )

        self.assertEqual(delete_response.status_code, 200)
        self.assertFalse(UserProfile.objects.filter(pk=created_seller.pk).exists())
        self.assertFalse(Cart.objects.filter(pk=cart.pk).exists())
        self.assertFalse(CartItem.objects.filter(pk=cart_item.pk).exists())

    def test_admin_cannot_delete_non_seller_account(self):
        self._login_as(self.admin)
        customer = UserProfile.objects.create(
            username='store-customer',
            email='customer@example.com',
            password='unused',
            role='customer',
        )

        response = self.client.delete(f'/api/admin/sellers/{customer.pk}/delete/')

        self.assertEqual(response.status_code, 404)
        self.assertTrue(UserProfile.objects.filter(pk=customer.pk).exists())

    def test_admin_can_delete_customer_but_not_own_account(self):
        self._login_as(self.admin)
        customer = UserProfile.objects.create(
            username='removable-customer',
            email='removable@example.com',
            password='unused',
            role='customer',
        )

        self_delete_response = self.client.delete(f'/api/admin/users/{self.admin.pk}/')
        delete_response = self.client.delete(f'/api/admin/users/{customer.pk}/')

        self.assertEqual(self_delete_response.status_code, 400)
        self.assertTrue(UserProfile.objects.filter(pk=self.admin.pk).exists())
        self.assertEqual(delete_response.status_code, 200)
        self.assertFalse(UserProfile.objects.filter(pk=customer.pk).exists())

    def test_admin_user_list_includes_roles(self):
        self._login_as(self.admin)

        response = self.client.get('/api/admin/users/')

        self.assertEqual(response.status_code, 200)
        users = response.json()['users']
        self.assertEqual(
            {user['role'] for user in users},
            {'admin', 'seller'},
        )
        self.assertEqual(response.json()['current_user_id'], self.admin.pk)

    def test_create_admin_command_creates_hashed_admin(self):
        with patch(
            'builtins.input',
            side_effect=['new-admin', 'new-admin@example.com'],
        ), patch(
            'sklep_komputerowy.management.commands.create_admin.getpass',
            side_effect=['admin-password', 'admin-password'],
        ):
            call_command('create_admin', stdout=StringIO())

        created_admin = UserProfile.objects.get(username='new-admin')
        self.assertEqual(created_admin.role, 'admin')
        self.assertTrue(check_password('admin-password', created_admin.password))

    def test_seller_can_create_product_with_image(self):
        self._login_as(self.seller)
        with tempfile.TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=media_root):
                response = self.client.post(
                    '/api/seller/products/',
                    {
                        'name': 'Laptop sprzedawcy',
                        'category': 'Laptopy',
                        'price': '2499.99',
                        'image': SimpleUploadedFile(
                            'laptop.jpg',
                            b'\xff\xd8\xff\xdbsample-jpeg',
                            content_type='image/jpeg',
                        ),
                    },
                )

        self.assertEqual(response.status_code, 201)
        product = SellerProduct.objects.get(name='Laptop sprzedawcy')
        self.assertEqual(product.seller, self.seller)
        self.assertEqual(response.json()['product']['id'], 1_000_000 + product.pk)
        product_id = response.json()['product']['id']
        self.assertIn(
            product_id,
            [item['id'] for item in self.client.get('/api/products/').json()['products']],
        )

        cart_response = self.client.post(
            '/api/cart/items/',
            data=json.dumps({'product_id': product_id}),
            content_type='application/json',
        )
        self.assertEqual(cart_response.status_code, 200)
        self.assertEqual(cart_response.json()['items'][0]['id'], product_id)

    def test_only_sellers_can_create_products(self):
        self._login_as(self.admin)

        response = self.client.post(
            '/api/seller/products/',
            {
                'name': 'Laptop',
                'category': 'Laptopy',
                'price': '100',
                'image': SimpleUploadedFile(
                    'laptop.jpg',
                    b'\xff\xd8\xff\xdbsample-jpeg',
                    content_type='image/jpeg',
                ),
            },
        )

        self.assertEqual(response.status_code, 403)
        self.assertFalse(SellerProduct.objects.exists())

    def test_seller_can_delete_only_own_product_and_image(self):
        other_seller = UserProfile.objects.create(
            username='other-seller',
            email='other-seller@example.com',
            password='unused',
            role='seller',
        )
        with tempfile.TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=media_root):
                products = []
                for seller, name in ((self.seller, 'Moje urządzenie'), (other_seller, 'Cudze urządzenie')):
                    product = SellerProduct.objects.create(
                        seller=seller,
                        name=name,
                        category='Laptopy',
                        price='100.00',
                        image=SimpleUploadedFile(
                            f'{name}.jpg',
                            b'\xff\xd8\xff\xdbsample-jpeg',
                            content_type='image/jpeg',
                        ),
                    )
                    products.append(product)

                self._login_as(self.seller)
                other_product_response = self.client.delete(
                    f'/api/seller/products/{products[1].api_id}/'
                )
                self.assertEqual(other_product_response.status_code, 404)

                CartItem.objects.create(
                    cart=Cart.objects.create(user=self.seller),
                    product_id=products[0].api_id,
                    quantity=1,
                )
                image_path = products[0].image.path
                own_product_response = self.client.delete(
                    f'/api/seller/products/{products[0].api_id}/'
                )

                self.assertEqual(own_product_response.status_code, 200)
                self.assertFalse(SellerProduct.objects.filter(pk=products[0].pk).exists())
                self.assertFalse(CartItem.objects.filter(product_id=products[0].api_id).exists())
                self.assertFalse(os.path.exists(image_path))
                self.assertTrue(SellerProduct.objects.filter(pk=products[1].pk).exists())

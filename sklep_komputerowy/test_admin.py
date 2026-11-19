import json
from io import StringIO
from unittest.mock import patch

from django.contrib.auth.hashers import check_password
from django.core.management import call_command
from django.db import connection
from django.test import TransactionTestCase

from .models import Cart, CartItem, UserProfile
from .session_keys import AUTH_SESSION_KEY


class AdminSellerApiTests(TransactionTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        with connection.schema_editor() as schema_editor:
            schema_editor.create_model(UserProfile)
            schema_editor.create_model(Cart)
            schema_editor.create_model(CartItem)

    @classmethod
    def tearDownClass(cls):
        with connection.schema_editor() as schema_editor:
            schema_editor.delete_model(CartItem)
            schema_editor.delete_model(Cart)
            schema_editor.delete_model(UserProfile)
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

import json

from django.test import TestCase

from .models import ProductReview, SellerProduct, UserProfile
from .session_keys import AUTH_SESSION_KEY


class ProductReviewApiTests(TestCase):
    def setUp(self):
        self.seller = UserProfile.objects.create(
            username='review-seller',
            email='review-seller@example.com',
            password='unused',
            role='seller',
        )
        self.customer = UserProfile.objects.create(
            username='review-customer',
            email='review-customer@example.com',
            password='unused',
            role='customer',
        )
        self.other_customer = UserProfile.objects.create(
            username='review-customer-2',
            email='review-customer-2@example.com',
            password='unused',
            role='customer',
        )
        self.product = SellerProduct.objects.create(
            seller=self.seller,
            name='Testowy produkt',
            category='Gaming',
            price='100.00',
            image='seller_products/test.jpg',
        )
        self.review_url = f'/api/products/{self.product.api_id}/reviews/'

    def _login_as(self, profile):
        session = self.client.session
        session[AUTH_SESSION_KEY] = profile.pk
        session.save()

    def _submit_review(self, rating, comment):
        return self.client.post(
            self.review_url,
            data=json.dumps({'rating': rating, 'comment': comment}),
            content_type='application/json',
        )

    def test_product_detail_route_renders_dashboard(self):
        response = self.client.get(f'/produkt/{self.product.api_id}/')

        self.assertEqual(response.status_code, 200)

    def test_reviews_require_login_and_validate_rating(self):
        response = self._submit_review(5, 'Dobra jakość')
        self.assertEqual(response.status_code, 401)

        self._login_as(self.customer)
        response = self._submit_review(6, 'Dobra jakość')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ProductReview.objects.count(), 0)

    def test_product_average_updates_when_users_submit_or_edit_reviews(self):
        self._login_as(self.customer)
        first_response = self._submit_review(5, 'Bardzo dobry produkt')
        self.assertEqual(first_response.status_code, 201)
        self.assertEqual(first_response.json()['product']['averageRating'], 5.0)
        self.assertEqual(first_response.json()['product']['reviewCount'], 1)

        self._login_as(self.other_customer)
        second_response = self._submit_review(3, 'Jest w porządku')
        self.assertEqual(second_response.status_code, 201)
        self.assertEqual(second_response.json()['product']['averageRating'], 4.0)
        self.assertEqual(second_response.json()['product']['reviewCount'], 2)

        self._login_as(self.customer)
        update_response = self._submit_review(1, 'Zmieniłem zdanie')
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()['product']['averageRating'], 2.0)
        self.assertEqual(update_response.json()['product']['reviewCount'], 2)
        self.assertEqual(ProductReview.objects.count(), 2)

        product_response = self.client.get('/api/products/')
        product_data = product_response.json()['products'][0]
        self.assertEqual(product_data['averageRating'], 2.0)
        self.assertEqual(product_data['reviewCount'], 2)
        self.assertEqual(product_data['myReview']['rating'], 1)

    def test_review_endpoint_returns_current_user_review(self):
        self._login_as(self.customer)
        self._submit_review(4, 'Dobry produkt')

        response = self.client.get(self.review_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['review'], {
            'rating': 4,
            'comment': 'Dobry produkt',
        })

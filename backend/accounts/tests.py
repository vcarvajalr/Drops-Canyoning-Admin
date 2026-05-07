from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='SuperSecure123',
            role='admin',
            first_name='Drops',
            last_name='Admin',
        )

    def test_login_returns_user_and_token(self):
        response = self.client.post(
            '/api/auth/token/',
            {'username': 'admin', 'password': 'SuperSecure123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'admin')

    def test_me_endpoint_returns_current_user(self):
        login = self.client.post(
            '/api/auth/token/',
            {'username': 'admin', 'password': 'SuperSecure123'},
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'admin')

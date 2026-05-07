from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from customers.models import Customer
from trips.models import Trip

User = get_user_model()


class ReservationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='manager',
            email='manager@example.com',
            password='SuperSecure123',
            role='manager',
        )
        self.customer = Customer.objects.create(
            first_name='Ana',
            last_name='Rivera',
            email='ana@example.com',
            phone='+50612345678',
        )
        self.trip = Trip.objects.create(
            name='Blue Canyon',
            location='Turrialba',
            difficulty='beginner',
            duration_minutes=180,
            capacity=8,
            price=Decimal('125.00'),
            scheduled_at=timezone.now() + timedelta(days=5),
            status='open',
        )
        token = self.client.post(
            '/api/auth/token/',
            {'username': 'manager', 'password': 'SuperSecure123'},
            format='json',
        ).data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_create_reservation_calculates_total_amount(self):
        response = self.client.post(
            '/api/reservations/',
            {
                'customer_id': self.customer.id,
                'trip_id': self.trip.id,
                'participants': 3,
                'status': 'confirmed',
                'notes': 'Need lunch option',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['total_amount']), Decimal('375.00'))
        self.assertEqual(response.data['created_by']['username'], 'manager')

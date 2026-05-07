from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from customers.models import Customer
from reservations.models import Reservation
from trips.models import Trip
from .models import Payment

User = get_user_model()


class PaymentWebhookTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='staff',
            email='staff@example.com',
            password='SuperSecure123',
            role='staff',
        )
        self.customer = Customer.objects.create(
            first_name='Luis',
            last_name='Perez',
            email='luis@example.com',
            phone='+50699999999',
        )
        self.trip = Trip.objects.create(
            name='Waterfall Rush',
            location='La Fortuna',
            difficulty='intermediate',
            duration_minutes=240,
            capacity=10,
            price=Decimal('150.00'),
            scheduled_at=timezone.now() + timedelta(days=3),
            status='open',
        )
        self.reservation = Reservation.objects.create(
            customer=self.customer,
            trip=self.trip,
            participants=2,
            status='confirmed',
            created_by=self.user,
        )
        self.payment = Payment.objects.create(
            reservation=self.reservation,
            amount=Decimal('300.00'),
            external_order_id='SIM-ORDER-123',
            status='created',
        )

    def test_webhook_marks_payment_completed(self):
        response = self.client.post(
            '/api/paypal/webhook/',
            {
                'event_type': 'PAYMENT.CAPTURE.COMPLETED',
                'resource': {
                    'id': 'CAPTURE-123',
                    'supplementary_data': {'related_ids': {'order_id': 'SIM-ORDER-123'}},
                },
            },
            format='json',
        )
        self.payment.refresh_from_db()
        self.reservation.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.payment.status, 'completed')
        self.assertEqual(self.reservation.payment_status, 'paid')

from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from customers.models import Customer
from payments.models import Payment
from reservations.models import Reservation
from trips.models import Trip

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed demo data for Drops Canyoning Admin.'

    def handle(self, *args, **options):
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@drops.local',
                'first_name': 'Drops',
                'last_name': 'Admin',
                'role': 'admin',
            },
        )
        admin_user.set_password('Admin12345!')
        admin_user.save()

        manager_user, _ = User.objects.get_or_create(
            username='manager',
            defaults={
                'email': 'manager@drops.local',
                'first_name': 'Booking',
                'last_name': 'Manager',
                'role': 'manager',
            },
        )
        manager_user.set_password('Manager12345!')
        manager_user.save()

        customer, _ = Customer.objects.get_or_create(
            email='guest@drops.local',
            defaults={
                'first_name': 'Alicia',
                'last_name': 'Guest',
                'phone': '+50670000000',
                'emergency_contact': 'John Guest',
            },
        )

        trip, _ = Trip.objects.get_or_create(
            slug='rio-claro-demo',
            defaults={
                'name': 'Rio Claro Adventure',
                'location': 'Rio Claro',
                'difficulty': 'beginner',
                'duration_minutes': 210,
                'capacity': 12,
                'price': Decimal('145.00'),
                'scheduled_at': timezone.now() + timedelta(days=7),
                'meeting_point': 'Drops Base Camp',
                'status': 'open',
                'description': 'Guided beginner friendly canyoning tour.',
            },
        )

        reservation, _ = Reservation.objects.get_or_create(
            reservation_code='RESDEMO001',
            defaults={
                'customer': customer,
                'trip': trip,
                'participants': 2,
                'status': 'confirmed',
                'created_by': manager_user,
            },
        )
        if reservation.trip_id != trip.id or reservation.customer_id != customer.id:
            reservation.trip = trip
            reservation.customer = customer
            reservation.participants = 2
            reservation.created_by = manager_user
            reservation.save()

        Payment.objects.get_or_create(
            external_order_id='SIM-DEMO-ORDER',
            defaults={
                'reservation': reservation,
                'amount': reservation.total_amount,
                'status': 'completed',
                'paid_at': timezone.now(),
            },
        )
        reservation.sync_payment_status()
        self.stdout.write(self.style.SUCCESS('Seed data created.'))

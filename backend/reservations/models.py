from decimal import Decimal
import uuid

from django.conf import settings
from django.db import models

from customers.models import Customer
from trips.models import Trip


class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    class PaymentStatus(models.TextChoices):
        UNPAID = 'unpaid', 'Unpaid'
        PARTIAL = 'partial', 'Partial'
        PAID = 'paid', 'Paid'
        REFUNDED = 'refunded', 'Refunded'

    reservation_code = models.CharField(max_length=12, unique=True, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='reservations')
    trip = models.ForeignKey(Trip, on_delete=models.PROTECT, related_name='reservations')
    participants = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_reservations',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.reservation_code:
            self.reservation_code = f'RES{uuid.uuid4().hex[:9].upper()}'
        if self.trip_id:
            self.total_amount = Decimal(self.trip.price) * self.participants
        super().save(*args, **kwargs)

    def sync_payment_status(self):
        completed_total = sum(
            payment.amount for payment in self.payments.filter(status='completed')
        )
        refunded_exists = self.payments.filter(status='refunded').exists()
        if refunded_exists:
            next_status = self.PaymentStatus.REFUNDED
        elif completed_total <= 0:
            next_status = self.PaymentStatus.UNPAID
        elif completed_total < self.total_amount:
            next_status = self.PaymentStatus.PARTIAL
        else:
            next_status = self.PaymentStatus.PAID
        if self.payment_status != next_status:
            self.payment_status = next_status
            self.save(update_fields=['payment_status', 'updated_at'])

    def __str__(self):
        return self.reservation_code

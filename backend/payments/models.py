from django.db import models
from django.utils import timezone

from reservations.models import Reservation


class Payment(models.Model):
    class Provider(models.TextChoices):
        PAYPAL = 'paypal', 'PayPal'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        CREATED = 'created', 'Created'
        APPROVED = 'approved', 'Approved'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='payments')
    provider = models.CharField(max_length=20, choices=Provider.choices, default=Provider.PAYPAL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default='USD')
    external_order_id = models.CharField(max_length=120, unique=True, null=True, blank=True)
    capture_id = models.CharField(max_length=120, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.amount == 0 and self.reservation_id:
            self.amount = self.reservation.total_amount
        if self.status == self.Status.COMPLETED and not self.paid_at:
            self.paid_at = timezone.now()
        super().save(*args, **kwargs)
        self.reservation.sync_payment_status()

    def __str__(self):
        return f'{self.provider}:{self.external_order_id or self.id}'

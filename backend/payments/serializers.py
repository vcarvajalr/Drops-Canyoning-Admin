from rest_framework import serializers

from reservations.models import Reservation
from reservations.serializers import ReservationSerializer

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    reservation = ReservationSerializer(read_only=True)
    reservation_id = serializers.PrimaryKeyRelatedField(queryset=Reservation.objects.all(), source='reservation', write_only=True)

    class Meta:
        model = Payment
        fields = (
            'id',
            'reservation',
            'reservation_id',
            'provider',
            'status',
            'amount',
            'currency',
            'external_order_id',
            'capture_id',
            'metadata',
            'paid_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'external_order_id', 'capture_id', 'metadata', 'paid_at', 'created_at', 'updated_at')


class CreatePayPalOrderSerializer(serializers.Serializer):
    reservation_id = serializers.PrimaryKeyRelatedField(queryset=Reservation.objects.all())
    currency = serializers.CharField(max_length=10, default='USD', required=False)

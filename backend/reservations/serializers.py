from decimal import Decimal

from rest_framework import serializers

from accounts.serializers import UserSerializer
from customers.models import Customer
from customers.serializers import CustomerSerializer
from trips.models import Trip
from trips.serializers import TripSerializer

from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    trip = TripSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all(), source='customer', write_only=True)
    trip_id = serializers.PrimaryKeyRelatedField(queryset=Trip.objects.all(), source='trip', write_only=True)
    payment_summary = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = (
            'id',
            'reservation_code',
            'customer',
            'customer_id',
            'trip',
            'trip_id',
            'participants',
            'status',
            'payment_status',
            'total_amount',
            'notes',
            'created_by',
            'created_at',
            'updated_at',
            'payment_summary',
        )
        read_only_fields = (
            'id',
            'reservation_code',
            'payment_status',
            'total_amount',
            'created_by',
            'created_at',
            'updated_at',
            'payment_summary',
        )

    def validate(self, attrs):
        trip = attrs.get('trip') or getattr(self.instance, 'trip', None)
        participants = attrs.get('participants', getattr(self.instance, 'participants', 1))
        if trip and participants > trip.capacity:
            raise serializers.ValidationError({'participants': 'Participants cannot exceed trip capacity.'})
        return attrs

    def get_payment_summary(self, obj):
        total_paid = sum(payment.amount for payment in obj.payments.filter(status='completed'))
        balance_due = Decimal(obj.total_amount) - total_paid
        return {
            'total_paid': f'{total_paid:.2f}',
            'balance_due': f'{balance_due:.2f}',
            'status': obj.payment_status,
        }

from rest_framework import viewsets

from config.permissions import IsOperationsUser

from .models import Reservation
from .serializers import ReservationSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related('customer', 'trip', 'created_by').prefetch_related('payments')
    serializer_class = ReservationSerializer
    permission_classes = [IsOperationsUser]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

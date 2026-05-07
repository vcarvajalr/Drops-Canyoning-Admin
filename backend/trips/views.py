from rest_framework import viewsets

from config.permissions import IsOperationsUser

from .models import Trip
from .serializers import TripSerializer


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsOperationsUser]

from rest_framework.routers import DefaultRouter

from accounts.views import UserViewSet
from customers.views import CustomerViewSet
from payments.views import PaymentViewSet
from reservations.views import ReservationViewSet
from trips.views import TripViewSet

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')
router.register('customers', CustomerViewSet, basename='customer')
router.register('trips', TripViewSet, basename='trip')
router.register('reservations', ReservationViewSet, basename='reservation')
router.register('payments', PaymentViewSet, basename='payment')

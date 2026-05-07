from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import IsOperationsUser

from .models import Payment
from .serializers import CreatePayPalOrderSerializer, PaymentSerializer
from .services import PayPalService


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('reservation', 'reservation__customer', 'reservation__trip')
    serializer_class = PaymentSerializer
    permission_classes = [IsOperationsUser]

    @action(detail=False, methods=['post'], url_path='create-paypal-order')
    def create_paypal_order(self, request):
        serializer = CreatePayPalOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservation = serializer.validated_data['reservation_id']
        currency = serializer.validated_data.get('currency', 'USD')
        payment = Payment.objects.create(
            reservation=reservation,
            amount=reservation.total_amount,
            currency=currency,
            provider=Payment.Provider.PAYPAL,
            status=Payment.Status.DRAFT,
        )
        paypal_order = PayPalService().create_order(payment)
        return Response(
            {'payment': PaymentSerializer(payment).data, 'paypal': paypal_order},
            status=status.HTTP_201_CREATED,
        )


class PayPalWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        service = PayPalService()
        if not service.verify_webhook(request.headers, request.data):
            return Response({'detail': 'Invalid PayPal webhook signature.'}, status=status.HTTP_400_BAD_REQUEST)
        result = service.handle_webhook(request.data)
        return Response(result, status=status.HTTP_200_OK)

import os
import uuid

import requests
from django.utils import timezone
from rest_framework import exceptions

from .models import Payment


class PayPalService:
    def __init__(self):
        self.mode = os.getenv('PAYPAL_MODE', 'sandbox')
        self.client_id = os.getenv('PAYPAL_CLIENT_ID', '')
        self.client_secret = os.getenv('PAYPAL_CLIENT_SECRET', '')
        self.webhook_id = os.getenv('PAYPAL_WEBHOOK_ID', '')
        self.base_url = (
            'https://api-m.paypal.com'
            if self.mode == 'live'
            else 'https://api-m.sandbox.paypal.com'
        )

    def _request_token(self):
        if not self.client_id or not self.client_secret:
            return None
        response = requests.post(
            f'{self.base_url}/v1/oauth2/token',
            auth=(self.client_id, self.client_secret),
            data={'grant_type': 'client_credentials'},
            timeout=20,
        )
        response.raise_for_status()
        return response.json()['access_token']

    def create_order(self, payment: Payment) -> dict:
        token = self._request_token()
        if token is None:
            simulated_id = f'SIM-{uuid.uuid4().hex[:14].upper()}'
            payment.external_order_id = simulated_id
            payment.status = Payment.Status.CREATED
            payment.metadata = {
                'approval_url': f'https://www.sandbox.paypal.com/checkoutnow?token={simulated_id}',
                'mode': 'simulated',
            }
            payment.save()
            return payment.metadata | {'id': simulated_id, 'status': payment.status}

        payload = {
            'intent': 'CAPTURE',
            'purchase_units': [
                {
                    'reference_id': str(payment.reservation_id),
                    'amount': {
                        'currency_code': payment.currency,
                        'value': f'{payment.amount:.2f}',
                    },
                }
            ],
            'application_context': {
                'brand_name': 'Drops Canyoning Admin',
                'shipping_preference': 'NO_SHIPPING',
                'user_action': 'PAY_NOW',
            },
        }
        response = requests.post(
            f'{self.base_url}/v2/checkout/orders',
            headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
            json=payload,
            timeout=20,
        )
        response.raise_for_status()
        order = response.json()
        approval_url = next((link['href'] for link in order.get('links', []) if link.get('rel') == 'approve'), '')
        payment.external_order_id = order['id']
        payment.status = Payment.Status.CREATED
        payment.metadata = {'approval_url': approval_url, 'mode': self.mode}
        payment.save()
        return {'id': order['id'], 'approval_url': approval_url, 'status': payment.status}

    def verify_webhook(self, headers: dict, body: dict) -> bool:
        if not self.client_id or not self.client_secret or not self.webhook_id:
            return True
        token = self._request_token()
        if token is None:
            return False
        payload = {
            'transmission_id': headers.get('Paypal-Transmission-Id', ''),
            'transmission_time': headers.get('Paypal-Transmission-Time', ''),
            'cert_url': headers.get('Paypal-Cert-Url', ''),
            'auth_algo': headers.get('Paypal-Auth-Algo', ''),
            'transmission_sig': headers.get('Paypal-Transmission-Sig', ''),
            'webhook_id': self.webhook_id,
            'webhook_event': body,
        }
        response = requests.post(
            f'{self.base_url}/v1/notifications/verify-webhook-signature',
            headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
            json=payload,
            timeout=20,
        )
        response.raise_for_status()
        return response.json().get('verification_status') == 'SUCCESS'

    def handle_webhook(self, payload: dict) -> dict:
        resource = payload.get('resource', {})
        related = resource.get('supplementary_data', {}).get('related_ids', {})
        order_id = related.get('order_id') or resource.get('id')
        if not order_id:
            raise exceptions.ValidationError('No PayPal order id found in webhook payload.')

        payment = Payment.objects.filter(external_order_id=order_id).first()
        if not payment:
            return {'updated': False, 'reason': 'Payment not found'}

        event_type = payload.get('event_type', '').upper()
        status_map = {
            'CHECKOUT.ORDER.APPROVED': Payment.Status.APPROVED,
            'PAYMENT.CAPTURE.COMPLETED': Payment.Status.COMPLETED,
            'PAYMENT.CAPTURE.DENIED': Payment.Status.FAILED,
            'PAYMENT.CAPTURE.REFUNDED': Payment.Status.REFUNDED,
        }
        next_status = status_map.get(event_type)
        if next_status:
            payment.status = next_status
        capture_id = resource.get('id')
        if event_type.startswith('PAYMENT.CAPTURE') and capture_id:
            payment.capture_id = capture_id
        payment.metadata = {**payment.metadata, 'last_webhook': payload}
        if payment.status == Payment.Status.COMPLETED:
            payment.paid_at = timezone.now()
        payment.save()
        return {'updated': True, 'status': payment.status}

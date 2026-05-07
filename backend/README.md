# Backend - Drops Canyoning Admin

Django REST backend for the Drops reservation admin system.

## Features
- JWT authentication
- User, customer, trip, reservation, and payment CRUD APIs
- PayPal order creation endpoint and webhook processing
- Swagger/OpenAPI docs
- Seed command for demo data

## Setup
```bash
cd /home/runner/work/Drops-Canyoning-Admin/Drops-Canyoning-Admin/backend
python3 -m pip install -r requirements.txt
cp .env.example .env
python3 manage.py migrate
python3 manage.py seed_data
python3 manage.py runserver
```

## Useful endpoints
- `POST /api/auth/token/`
- `GET /api/auth/me/`
- `GET /api/docs/`
- `POST /api/payments/create-paypal-order/`
- `POST /api/paypal/webhook/`

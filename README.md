# Drops Canyoning Admin

Drops Canyoning Admin is a full-stack reservation back office for managing canyoning trips, staff users, reservations, and PayPal payment tracking.

## Stack
- **Backend:** Django, Django REST Framework, JWT auth, PyMySQL/MySQL, drf-spectacular
- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
- **Infra:** Docker, docker-compose, GitHub Actions CI

## MVP scope
- Staff login with JWT
- Trip CRUD
- Customer and reservation management
- PayPal order creation plus webhook-based payment updates
- User administration for admin/manager roles

## Local development

### 1. Backend
```bash
cd /home/runner/work/Drops-Canyoning-Admin/Drops-Canyoning-Admin/backend
python3 -m pip install -r requirements.txt
cp .env.example .env
python3 manage.py migrate
python3 manage.py seed_data
python3 manage.py runserver
```

### 2. Frontend
```bash
cd /home/runner/work/Drops-Canyoning-Admin/Drops-Canyoning-Admin/frontend
npm install
cp .env.example .env
npm run dev
```

The frontend expects the API at `http://localhost:8000` by default.

## Demo users
The seed command creates these users:
- `admin` / `Admin12345!`
- `manager` / `Manager12345!`

## API docs
After starting the backend, open:
- Swagger UI: `http://localhost:8000/api/docs/`
- OpenAPI schema: `http://localhost:8000/api/schema/`

## Docker
```bash
cd /home/runner/work/Drops-Canyoning-Admin/Drops-Canyoning-Admin
cp .env.example .env
docker compose up --build
```

## Tests and quality checks
```bash
cd /home/runner/work/Drops-Canyoning-Admin/Drops-Canyoning-Admin/backend
python3 manage.py test

cd /home/runner/work/Drops-Canyoning-Admin/Drops-Canyoning-Admin/frontend
npm run lint
npm run test
npm run build
```

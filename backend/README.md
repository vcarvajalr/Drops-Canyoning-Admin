# Backend - Drops Canyoning Admin

Este es el backend desarrollado en Python Django para el sistema de administración de reservas para Drops Canyoning.

### Tecnologías usadas:
- Django REST framework
- MySQL
- Autenticación con JWT
- Integración con la API de PayPal

### Pasos iniciales:
1. Instalar dependencias:
   ```sh
   pip install -r requirements.txt
   ```
2. Configurar las variables de entorno para conectar con la base de datos.
3. Migrar las bases de datos:
   ```sh
   python manage.py migrate
   ```
4. Ejecutar el servidor de desarrollo:
   ```sh
   python manage.py runserver
   ```
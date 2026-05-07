from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        MANAGER = 'manager', 'Manager'
        STAFF = 'staff', 'Staff'

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STAFF)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.Role.ADMIN
            self.is_staff = True
        elif self.role in {self.Role.ADMIN, self.Role.MANAGER, self.Role.STAFF}:
            self.is_staff = True
        super().save(*args, **kwargs)

    @property
    def display_name(self):
        full_name = self.get_full_name().strip()
        return full_name or self.username

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class DropsUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Drops Roles', {'fields': ('role',)}),
    )
    list_display = ('username', 'email', 'role', 'is_active', 'is_staff')

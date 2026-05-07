from rest_framework.permissions import BasePermission

from accounts.models import User


class IsOperationsUser(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_superuser or user.role in {User.Role.ADMIN, User.Role.MANAGER, User.Role.STAFF})
        )


class IsAdminManagerUser(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_superuser or user.role in {User.Role.ADMIN, User.Role.MANAGER})
        )

from django.contrib.auth import get_user_model
from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from config.permissions import IsAdminManagerUser

from .serializers import CustomTokenObtainPairSerializer, UserSerializer, UserWriteSerializer

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.order_by('username')
    permission_classes = [IsAdminManagerUser]

    def get_serializer_class(self):
        if self.action in {'create', 'update', 'partial_update'}:
            return UserWriteSerializer
        return UserSerializer

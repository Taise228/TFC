from django.shortcuts import render
from rest_framework import viewsets
from .models import User
from .serializer import UserSerializer
from rest_framework.generics import CreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password

# Create your views here.
class CreateUserView(CreateAPIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        #print("request = ", request)
        return self.create(request, *args, **kwargs)

class UserView(RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # confine queries to this user's row
        # print(self.request.user)
        email = self.request.user.email
        return User.objects.filter(email=email)

    def get_object(self):
        # tokenの情報からそのuserの情報を割り出して取得する
        return get_object_or_404(User, email=self.request.user.email)
    
    def patch(self, request, *args, **kwargs):
        if 'password' in request.data:
            request.data['password'] = make_password(request.data['password'])
        return super().patch(request, *args, **kwargs)
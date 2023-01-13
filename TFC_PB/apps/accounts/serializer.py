from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone_number", "avatar", "password", 'is_staff']
        read_only_fields = ["id",]
        extra_kwargs = {"password": {"write_only": True},}
    
    def create(self, validated_data):
        # hash password
        password = validated_data.pop("password")
        validated_data["password"] = make_password(password)
        return super().create(validated_data)
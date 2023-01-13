from rest_framework import serializers
from .models import Class, ClassList, Enroll

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ["id", "studio", "name", "description", "coach", "keywords", "capacity", "startDate", "startTime", "endTime", "endDate"]
        read_only_fields = ["id",]

class ClassListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassList
        fields = ["id", "studio", "name", "startTime", "endTime", "cancelled", "coach"]
        read_only_fields = ["id",]

class EnrollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enroll
        fields = ["id", "user", "to_class"]
        read_only_fields = ["id",]
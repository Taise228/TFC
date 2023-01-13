from rest_framework import serializers
from .models import Studio, StudioImages, Amenities

class StudioImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioImages
        fields = "__all__"

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenities
        fields = "__all__"

class StudioSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    amenities = serializers.SerializerMethodField()
    class Meta:
        model = Studio
        fields = ["id", "name", "address", "latitude", "longitude", "postal_code", "phone_number", "images", "amenities"]
        read_only_fields = ["id"]
    
    def get_images(self, obj):
        im = StudioImagesSerializer(StudioImages.objects.all().filter(studio=Studio.objects.get(name=obj.name)), many=True).data
        return im
    
    def get_amenities(self, obj):
        am = AmenitySerializer(Amenities.objects.all().filter(studio=Studio.objects.get(name=obj.name)), many=True).data
        return am

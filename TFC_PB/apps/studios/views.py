from django.shortcuts import render
from rest_framework import viewsets
from .models import Studio, StudioImages, Amenities
from .serializer import StudioSerializer, StudioImagesSerializer, AmenitySerializer
from rest_framework.permissions import IsAdminUser, BasePermission
from geopy.distance import geodesic
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
import re

class StudioPagination(PageNumberPagination):
    page_size = 1
    max_page_size = 50

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method.lower() == "get":
            return True
        else:
            return request.user.is_staff

# Create your views here.
class StudioView(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly,]
    queryset = Studio.objects.all()
    pagination_class = StudioPagination

    def filter_queryset(self, queryset):
        latitude = self.request.GET.get("latitude", None)
        longitude = self.request.GET.get("longitude", None)
        if latitude is None or longitude is None:
            # when user doesn't provide location, present it in the original order
            return super().filter_queryset(queryset)
        else:
            # when user provide location as request parameters, present queries in the closest order
            return sorted(queryset, key=lambda query: geodesic((latitude, longitude), query.location))
    serializer_class = StudioSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if self.request.GET.get("name"):
            name = self.request.GET.get("name")
            queries = []
            for query in queryset:
                if re.match('.*'+name+'.*', query.name):
                    queries.append(query)
        else:
            queries = queryset
        
        if self.request.GET.get("amenity"):
            new = []
            amenity = self.request.GET.get("amenity")
            for query in queries:
                amenities = query.amenityOf.all()
                for aname in amenities.values_list("type", flat=True):
                    if re.match('.*'+amenity+'.*', aname):
                        new.append(query)
                        break
                #if amenity in amenities.values_list("type", flat=True):
                #    new.append(query)
            queries = new

        if self.request.GET.get("class"):
            new = []
            class_name = self.request.GET.get("class")
            for query in queries:
                held_classes = query.classOf.all()
                for cname in held_classes.values_list("name", flat=True):
                    if re.match('.*'+class_name+'.*', cname):
                        new.append(query)
                        break
                #if class_name in held_classes.values_list("name", flat=True):
                #    new.append(query)
            queries = new
        
        if self.request.GET.get("coach"):
            new = []
            coach_name = self.request.GET.get("coach")
            for query in queries:
                held_classes = query.classOf.all()
                if coach_name in held_classes.values_list("coach", flat=True):
                    new.append(query)
            queries = new

        page = self.paginate_queryset(queries)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(queries, request)
        serializer = self.get_serializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class StudioImageView(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly,]
    queryset = StudioImages.objects.all()
    serializer_class = StudioImagesSerializer

    def filter_queryset(self, queryset):
        if self.request.GET.get("studio"):
            return StudioImages.objects.filter(studio=self.request.GET.get("studio"))
        else:
            return super().filter_queryset(queryset)

class AmenitiesView(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly,]
    queryset = Amenities.objects.all()
    serializer_class = AmenitySerializer

    def filter_queryset(self, queryset):
        if self.request.GET.get("studio"):
            return Amenities.objects.filter(studio=self.request.GET.get("studio"))
        else:
            return super().filter_queryset(queryset)
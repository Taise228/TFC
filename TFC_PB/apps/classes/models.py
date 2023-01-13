from django.db import models
from apps.studios.models import Studio
from apps.accounts.models import User

# Create your models here.

class Class(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, to_field="name", related_name="classOf")
    name = models.CharField(max_length=200, unique=True, blank=False)
    description = models.CharField(max_length=200, blank=False)
    coach = models.CharField(max_length=100, blank=False)
    keywords = models.CharField(max_length=100, blank=True)
    capacity = models.PositiveSmallIntegerField(null=False)
    startDate = models.DateField(auto_now=False, auto_now_add=False, null=False)
    startTime = models.TimeField(null=False)
    endTime = models.TimeField(null=False)
    endDate = models.DateField(null=False)

class ClassList(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, to_field="name")
    name = models.ForeignKey(Class, on_delete=models.CASCADE, to_field="name")
    startTime = models.DateTimeField(null=False)
    endTime = models.DateTimeField(null=False)
    cancelled = models.BooleanField(default=False, null=False)
    coach = models.CharField(max_length=100, blank=False)
    
class Enroll(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    to_class = models.ForeignKey(ClassList, on_delete=models.CASCADE, null=False)

#class Reservation(models.Model):
#    user = models.ForeignKey(User, on_delete=models.CASCADE, to_field="name")
#    class = models.ForeignKey(ClassList, on_delete=models.CASCADE, to_field="id")
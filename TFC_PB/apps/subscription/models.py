from django.db import models
from apps.accounts.models import User

# Create your models here.

class Subscription(models.Model):
    price = models.FloatField(null=False)
    duration = models.CharField(max_length=20, blank=False)

class UserPlan(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    plan = models.ForeignKey(Subscription, on_delete=models.CASCADE, to_field="id")
    card = models.CharField(max_length=19, blank=False)
    expiry_date = models.CharField(max_length=5, blank=False)
    csv = models.CharField(max_length=3, blank=False)

class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, unique=False)
    card = models.CharField(max_length=19, blank=False)
    expiry_date = models.CharField(max_length=5, blank=False)
    csv = models.CharField(max_length=3, blank=False)
    time = models.DateTimeField(null=False)
    price = models.FloatField(null=False)
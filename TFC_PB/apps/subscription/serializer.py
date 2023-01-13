from rest_framework import serializers
from .models import Subscription, UserPlan, Payment

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ["id", "price", "duration"]
        read_only_fields = ["id",]

class UserPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPlan
        fields = ["id", "user", "plan", "card", "expiry_date", "csv"]
        read_only_fields = ["id",]

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "user", "card", "expiry_date", "csv", "time", "price"]
        read_only_fields = ["id",]
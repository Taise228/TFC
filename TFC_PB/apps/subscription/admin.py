from django.contrib import admin
from .models import Subscription, UserPlan, Payment

# Register your models here.
admin.site.register(Subscription)
admin.site.register(UserPlan)
admin.site.register(Payment)
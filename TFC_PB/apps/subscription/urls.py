from django.urls import path, include
from . import views
from rest_framework import routers

defaultRouter = routers.DefaultRouter()
defaultRouter.register("subscription", views.SubscriptionView)

urlpatterns = [
    path("", include(defaultRouter.urls)),
    path("plan/", views.UserPlanView.as_view(), name="user_plan"),
    path("create/", views.UserPlanCreateView.as_view(), name="plan_create"),
    path("payment/", views.PaymentView.as_view(), name="payment"),
]
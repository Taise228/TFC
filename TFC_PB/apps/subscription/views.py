from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import RetrieveUpdateDestroyAPIView, CreateAPIView
from rest_framework.views import APIView
from apps.studios.views import IsAdminOrReadOnly
from .models import Subscription, UserPlan, Payment
from .serializer import SubscriptionSerializer, UserPlanSerializer, PaymentSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.accounts.models import User
import datetime
from dateutil.relativedelta import relativedelta
from apps.classes.models import Enroll

# Create your views here.
class SubscriptionView(ModelViewSet):
    permission_classes = [IsAdminOrReadOnly,]
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

    def create(self, request, *args, **kwargs):
        if request.data.get("duration") not in ["month", "year"]:
            return Response({"duration": "we don't support that duration"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return super().create(request, *args, **kwargs)

class UserPlanView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated,]
    serializer_class = UserPlanSerializer

    def get_queryset(self):
        email = self.request.user.email
        return UserPlan.objects.filter(user=email)
    
    def get_object(self):
        # tokenの情報からそのuserの情報を割り出して取得する
        return get_object_or_404(UserPlan, user=User.objects.get(email=self.request.user.email))
    
    def patch(self, request, *args, **kwargs):
        # modify payment as well
        payments = Payment.objects.filter(user=self.request.user, time__gt=datetime.datetime.now())
        if request.data.get("card"):
            payments.update(card=request.data.get("card"))
        if request.data.get("expiry_date"):
            payments.update(expiry_date=request.data.get("expiry_date"))
        if request.data.get("csv"):
            payments.update(csv=request.data.get("csv"))
        return super().patch(request, *args, **kwargs)
    
    def delete(self, request, *args, **kwargs):
        # delete all future payment
        future_payment = Payment.objects.filter(user=self.request.user, time__gt=datetime.datetime.now())
        future_payment.delete()
        future_class = Enroll.objects.filter(user=self.request.user, to_class__startTime__gt=datetime.datetime.now())
        future_class.delete()
        query = UserPlan.objects.filter(user=self.request.user)
        query.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserPlanCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = UserPlan.objects.all()
    serializer_class = UserPlanSerializer

    def post(self, request, *args, **kwargs):
        data = {"user": self.request.user.id, "plan": request.data.get("plan"), "card": request.data.get("card"), "expiry_date": request.data.get("expiry_date"), "csv": request.data.get("csv")}
        # add first payment
        if not request.data.get("plan"):
            return Response({"plan": "this field is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not Subscription.objects.filter(id=request.data.get("plan")).exists():
            return Response({"plan": "plan does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        plan = Subscription.objects.get(id=request.data.get("plan"))
        data2 = {"user": self.request.user.id, "card": data["card"], "expiry_date": data["expiry_date"], "csv": data["csv"], "time": datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d %H:%M:%S"), "price": plan.price}
        p_serializer = PaymentSerializer(data=data2)
        p_serializer.is_valid(raise_exception=True)
        self.perform_create(p_serializer)
        #Payment.objects.create(user=data["user"].email, card=data["card"], expiry_date=data["expiry_date"], csv=data["csv"], time=datetime.datetime.strftime(datetime.datetime.now(), "%Y-%m-%d %H:%M:%S"))
        serializer = UserPlanSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class PaymentView(APIView):
    permission_classes = [IsAuthenticated,]
    
    def get(self, request, *args, **kwargs):
        # add payment until today
        user = User.objects.get(email=self.request.user.email)
        if not UserPlan.objects.filter(user=self.request.user).exists():
            # currently not in any plan
            queries = Payment.objects.filter(user=user).order_by("time")
            serializer = PaymentSerializer(instance=queries, many=True)
            return Response(serializer.data)
        plan = UserPlan.objects.get(user=self.request.user)
        latest_payment = Payment.objects.filter(user=user.id).order_by("time").last()
        if plan.plan.duration == "month":
            #last_payment_time = datetime.datetime.strptime(latest_payment.time, "%Y-%m-%d %H:%M:%S")
            last_payment_time = latest_payment.time
            if last_payment_time < datetime.datetime.now(last_payment_time.tzinfo):
                while last_payment_time < datetime.datetime.now(last_payment_time.tzinfo):
                    last_payment_time += relativedelta(months=1)
                    add_time = datetime.datetime(year=last_payment_time.year, month=last_payment_time.month, day=1)
                    add_time = datetime.datetime.strftime(add_time, "%Y-%m-%d %H:%M:%S")
                    Payment.objects.create(user=self.request.user, card=plan.card, expiry_date=plan.expiry_date, csv=plan.csv, time=add_time, price=plan.plan.price)
            else:
                Payment.objects.filter(id=latest_payment.id).update(card=plan.card, expiry_date=plan.expiry_date, csv=plan.csv, price=plan.plan.price)
        elif plan.plan.duration == "year":
            last_payment_time = latest_payment.time
            if last_payment_time < datetime.datetime.now(last_payment_time.tzinfo):
                while last_payment_time < datetime.datetime.now(last_payment_time.tzinfo):
                    last_payment_time += relativedelta(years=1)
                    add_time = datetime.datetime(year=last_payment_time.year, month=1, day=1)
                    add_time = datetime.datetime.strftime(add_time, "%Y-%m-%d %H:%M:%S")
                    Payment.objects.create(user=self.request.user, card=plan.card, expiry_date=plan.expiry_date, csv=plan.csv, time=add_time, price=plan.plan.price)
                else:
                    Payment.objects.filter(id=latest_payment.id).update(card=plan.card, expiry_date=plan.expiry_date, csv=plan.csv, price=plan.plan.price)

        queries = Payment.objects.filter(user=user).order_by("time")
        serializer = PaymentSerializer(instance=queries, many=True)
        return Response(serializer.data)
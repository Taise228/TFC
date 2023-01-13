from django.shortcuts import render
from .models import Class, ClassList, Enroll
from apps.subscription.models import UserPlan
from .serializer import ClassSerializer, ClassListSerializer, EnrollSerializer
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, DestroyAPIView, CreateAPIView, ListAPIView
from apps.studios.views import IsAdminOrReadOnly
from rest_framework.response import Response
from datetime import timedelta
from datetime import datetime, date, time
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from apps.studios.models import Studio
from rest_framework.pagination import PageNumberPagination

class ClassPagination(PageNumberPagination):
    page_size = 5
    max_page_size = 50

# Create your views here.
class ClassView(ListCreateAPIView):
    queryset = Class.objects.all()
    permission_classes = [IsAdminOrReadOnly,]
    serializer_class = ClassSerializer
    def get(self, request, *args, **kwargs):
        if self.request.GET.get('name'):
            queries = Class.objects.filter(name=self.request.GET.get('name'))
        else:
            queries = Class.objects.all()
        serializer = ClassSerializer(instance=queries, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        errors = dict()
        payloads = ["startDate", "startTime", "endTime", "studio", "name", "description", "coach", "capacity"]
        for p in payloads:
            if p not in request.data:
                errors[p] = "this field is required."
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        startDate = request.data["startDate"]   # it's string here
        startDate = datetime.strptime(startDate, "%Y-%m-%d")   # string -> datetime
        startDate = date(startDate.year, startDate.month, startDate.day)   # datetime -> date
        if request.data.get("endDate"):
            endDate = request.data.get("endDate")
            endDate = datetime.strptime(endDate, "%Y-%m-%d")   # string -> datetime
            endDate = date(endDate.year, endDate.month, endDate.day)   # datetime -> date
        else:
            # if the user doesn't provide endDate
            endDate = startDate + timedelta(weeks=10)   # save until 10 weeks later
        startTime = request.data["startTime"]   # it's str here
        endTime = request.data["endTime"]   # it's str here
        startTime = datetime.strptime(startTime, "%H:%M:%S")   # str -> datetime
        startTime = time(startTime.hour, startTime.minute, startTime.second)   # datetime -> time
        endTime = datetime.strptime(endTime, "%H:%M:%S")   # str -> datetime
        endTime = time(endTime.hour, endTime.minute, endTime.second)   # datetime -> time
        classdata = request.data.copy()   # originally request.data is immutable, so cannot add key=endDate to request.data. So copy it
        classdata["endDate"] = datetime.strftime(endDate, "%Y-%m-%d")   # add endDate
        serializer = ClassSerializer(data=classdata)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)   # save
        headers = self.get_success_headers(serializer.data)
        while startDate < endDate:
            # add each class that occurs specific datetime to ClassList
            if datetime(year=startDate.year, month=startDate.month, day=startDate.day, hour=startTime.hour, minute=startTime.minute, second=startTime.second) > datetime(year=endDate.year, month=endDate.month, day=endDate.day, hour=endTime.hour, minute=endTime.minute, second=endTime.second):
                startDate += timedelta(days=7)
                continue
            classListData = {
                "studio": request.data["studio"],
                "name": request.data["name"], 
                "startTime": datetime(year=startDate.year, month=startDate.month, day=startDate.day, hour=startTime.hour, minute=startTime.minute), 
                "endTime": datetime(year=startDate.year, month=startDate.month, day=startDate.day, hour=endTime.hour, minute=endTime.minute),
                "coach": request.data["coach"]}
            serializer_list = ClassListSerializer(data=classListData)
            serializer_list.is_valid(raise_exception=True)
            serializer_list.save()
            startDate += timedelta(days=7)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ClassDeleteView(DestroyAPIView):
    permission_classes = [IsAdminOrReadOnly,]
    serializer_class = ClassSerializer
    queryset = Class.objects.all()

    def delete(self, request, *args, **kwargs):
        # bodyのjsonはrequest.dataという変数にQueryDictという型で渡される
        cond = dict()
        if request.data.get("name"):
            cond["name"] = request.data.get("name")
        else:
            return Response({"detail": "please provide class name"}, status=status.HTTP_400_BAD_REQUEST)

        queryset = Class.objects.filter(**cond)
        queryset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ClassListView(RetrieveUpdateDestroyAPIView):
    queryset = ClassList.objects.all()
    permission_classes = [IsAdminOrReadOnly,]
    serializer_class = ClassListSerializer
    lookup_field = "id"
    pagination_class = ClassPagination

    def get(self, request, *args, **kwargs):
        # GETのparamsで指定した条件で検索できるようにする
        # 条件は studio (name), name, coach, startTime, endTime
        filter = dict()
        if self.request.GET.get('id'):
            filter['id'] = self.request.GET.get('id')
        if self.request.GET.get("studio"):
            filter["studio__name__contains"] = self.request.GET.get("studio")
        if self.request.GET.get("name"):
            filter["name__name__contains"] = self.request.GET.get("name")
        if self.request.GET.get("coach"):
            filter["coach__contains"] = self.request.GET.get("coach")
        if self.request.GET.get("startTime"):
            # fetch class instances which start after this startTime
            filter["startTime__gt"] = datetime.strptime(self.request.GET.get("startTime"), "%Y-%m-%d %H:%M:%S")
        if self.request.GET.get("endTime"):
            # fetch class instances which end before this endTime
            filter["endTime__lt"] = datetime.strptime(self.request.GET.get("endTime"), "%Y-%m-%d %H:%M:%S")
        queries = ClassList.objects.filter(**filter).order_by("startTime")
        
        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(queries, request)
        serializer = ClassListSerializer(instance=result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    def delete(self, request, *args, **kwargs):
        # bodyのjsonはrequest.dataという変数にQueryDictという型で渡される
        cond = dict()
        if request.data.get("studio"):
            cond["studio"] = request.data.get("studio")
        if request.data.get("name"):
            cond["name"] = request.data.get("name")
        if request.data.get("startTime"):
            cond["startTime"] = request.data.get("startTime")
        cond["startTime__gt"] = datetime.now()

        queryset = ClassList.objects.filter(**cond)
        queryset.update(cancelled=True)
        serializer = ClassListSerializer(instance=queryset, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, *args, **kwargs):
        if not request.data.get("id"):
            # class id have to be included in payload
            return Response({"id": "please designate the id of class"}, status=status.HTTP_400_BAD_REQUEST)

        if not ClassList.objects.filter(id=request.data.get("id"), cancelled=False).exists():
            # that class id doesn't exist
            return Response({"id": "please enter valid id"}, status=status.HTTP_400_BAD_REQUEST)

        query = ClassList.objects.get(id=request.data.get("id"), cancelled=False)   # only one row
        queries = ClassList.objects.filter(id=request.data.get("id"), cancelled=False)
        updates = dict()   # what to update. Values should be specified in payload.
        if request.data.get("studio"):
            if request.data.get("studio") not in Studio.objects.values_list("name", flat=True):
                # studio is a foreign key
                return Response({"studio": "this studio does not exist"})
            else:
                updates["studio"] = request.data.get("studio")
        if request.data.get("startTime"):
            # end time must not be earlier than start time
            if not request.data.get("endTime"):
                if datetime.strptime(request.data.get("startTime"), "%Y-%m-%d %H:%M:%S").astimezone(query.endTime.tzinfo) > query.endTime:
                    return Response({"startTime": "end time is earlier than your input start time"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                if datetime.strptime(request.data.get("startTime"), "%Y-%m-%d %H:%M:%S") > datetime.strptime(request.data.get("endTime"), "%Y-%m-%d %H:%M:%S"):
                    return Response({"startTime": "end time is earlier than your input start time"}, status=status.HTTP_400_BAD_REQUEST)
            updates["startTime"] = datetime.strptime(request.data.get("startTime"), "%Y-%m-%d %H:%M:%S")
        if request.data.get("endTime"):
            if not request.data.get("startTime"):
                if query.startTime > datetime.strptime(request.data.get("endTime"), "%Y-%m-%d %H:%M:%S").astimezone(query.startTime.tzinfo):
                    return Response({"endTime": "end time is earlier than your input start time"}, status=status.HTTP_400_BAD_REQUEST)
            updates["endTime"] = datetime.strptime(request.data.get("endTime"), "%Y-%m-%d %H:%M:%S")
        queries.update(**updates)
        serializer = ClassListSerializer(instance=queries, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

class OneClassCreateView(CreateAPIView):
    permission_classes = [IsAdminOrReadOnly,]
    serializer_class = ClassListSerializer
    queryset = ClassList.objects.all()

    def post(self, request, *args, **kwargs):
        if request.data.get("startTime") and request.data.get("endTime"):
            if datetime.strptime(request.data.get("startTime"), "%Y-%m-%d %H:%M:%S") > datetime.strptime(request.data.get("endTime"), "%Y-%m-%d %H:%M:%S"):
                return Response({"startTime": "end time is earlier than your start time"}, status=status.HTTP_400_BAD_REQUEST)
        return super().post(request, *args, **kwargs)

class EnrollView(CreateAPIView):
    permission_classes = [IsAuthenticated,]
    serializer_class = EnrollSerializer
    queryset = Enroll.objects.all()

    def post(self, request, *args, **kwargs):
        user = self.request.user
        if UserPlan.objects.filter(user=user).count() == 0:
            return Response({"detail": "you don't have a subscription plan"}, status=status.HTTP_400_BAD_REQUEST)
        # enroll
        if request.data.get("to_class"):
            to_class = request.data.get("to_class")
            if ClassList.objects.get(id=to_class).cancelled:
                return Response({"detail": "this class was cancelled"}, status=status.HTTP_400_BAD_REQUEST)
            class_name = ClassList.objects.get(id=to_class).name.name
            capacity = Class.objects.get(name=class_name).capacity
            count = Enroll.objects.filter(to_class=to_class).count()
            if count >= capacity:
                return Response({"detail": "this class is full"}, status=status.HTTP_400_BAD_REQUEST)
            startTime = ClassList.objects.get(id=to_class).startTime
            if startTime < datetime.now(startTime.tzinfo):
                return Response({"detail": "this class is already done"}, status=status.HTTP_400_BAD_REQUEST)
            enrolled = Enroll.objects.filter(to_class=to_class, user=user)
            if (enrolled.exists()):
                return Response({"detail": "you are already enrolled to this class"}, status=status.HTTP_400_BAD_REQUEST)
            data = {"user": self.request.user.id, "to_class": request.data.get("to_class")}
            serializer = EnrollSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)   # save
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        elif request.data.get("class_name"):
            name = request.data.get("class_name")
            objects = []
            queries = ClassList.objects.filter(name=name)
            for obj in queries:
                # check capacity and date
                to_class = obj.id
                if ClassList.objects.get(id=to_class).cancelled:
                    continue
                class_name = ClassList.objects.get(id=to_class).name.name
                capacity = Class.objects.get(name=class_name).capacity
                count = Enroll.objects.filter(to_class=to_class).count()
                if count >= capacity:
                    continue
                startTime = ClassList.objects.get(id=to_class).startTime
                if startTime < datetime.now(startTime.tzinfo):
                    continue
                objects.append(Enroll(user=self.request.user, to_class=obj))
            enrolled = Enroll.objects.bulk_create(objects)
            serializer = EnrollSerializer(instance=enrolled, many=True)
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({"detail": "please specify class id or class name"}, status=status.HTTP_400_BAD_REQUEST)

class DeleteEnrollView(DestroyAPIView):
    permission_classes = [IsAuthenticated,]
    serializer_class = EnrollSerializer
    queryset = Enroll.objects.all()

    def get_queryset(self):
        return Enroll.object.filter(user=self.request.user)
    
    def get_object(self):
        return get_object_or_404(Enroll, user=self.request.user)
    
    def delete(self, request, *args, **kwargs):
        cond = dict()
        cond["user"] = self.request.user
        if request.data.get("to_class"):
            cond["to_class"] = request.data.get("to_class")
            queryset = Enroll.objects.filter(**cond)
            queryset.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        elif request.data.get("class_name"):
            name = request.data.get("class_name")
            classes = ClassList.objects.filter(name=name).filter(startTime__gt=datetime.now())
            for cl in classes:
                obj = Enroll.objects.filter(to_class=cl.id)
                obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'detail': 'please provide class information'}, status=status.HTTP_400_BAD_REQUEST)

class ListEnrollView(ListAPIView):
    permission_classes = [IsAuthenticated,]
    serializer_class = EnrollSerializer
    queryset = Enroll.objects.all()

    def get_queryset(self):
        return Enroll.objects.filter(user=self.request.user).order_by('to_class__startTime')
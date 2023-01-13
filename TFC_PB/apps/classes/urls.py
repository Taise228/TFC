from django.urls import path, include
from . import views
from rest_framework import routers

defaultRouter = routers.DefaultRouter()

urlpatterns = [
    path("edit/", views.ClassView.as_view(), name="class_edit"),
    path("list/", views.ClassListView.as_view(), name="class_list"),
    path("delete/", views.ClassDeleteView.as_view(), name="class_delete"),
    path("create/", views.OneClassCreateView.as_view(), name="class_create"),
    path("enroll/", views.EnrollView.as_view(), name="enroll"),
    path("enroll/delete/", views.DeleteEnrollView.as_view(), name="enroll_edit"),
    path("enroll/check/", views.ListEnrollView.as_view(), name="list_enroll"),
]

# classes/edit にGET, POST でClass, ClassListが追加。ClassListはstartDateから10週間ぶん、毎週classを開催

# class全体をキャンセルしたいならeditの方に投げて、一つだけならlistの方に投げる
# list ... GET -> paramの方に条件を指定。 DELETE -> payloadの方に条件を指定。
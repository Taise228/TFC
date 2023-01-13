from django.urls import path, include
from . import views
from rest_framework import routers

defaultRouter = routers.DefaultRouter()

defaultRouter.register('studio', views.StudioView)
defaultRouter.register("studioimage", views.StudioImageView)
defaultRouter.register("amenity", views.AmenitiesView)

urlpatterns = [
    path("", include(defaultRouter.urls))
]

# studios/studio -> GETで全て取得, POSTでcreate. GETの際はparameterにlatitude, longitudeを指定すれば近い順に表示される
# studios/studio/(pk) -> GET, PATCH, PUT, DELETE
# studios/studioimage -> GETで全て取得, POSTでcreate
# studios/studioimage/(pk) -> GET, PATCH, PUT, DELETE
# studios/amenity -> GETで全て取得, POSTでcreate
# studios/amenity/(pk) -> GET, PATCH, PUT, DELETE
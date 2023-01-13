from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('signup/', views.CreateUserView.as_view(), name="signup"),
    path('profile/', views.UserView.as_view(), name="profile"),
]

# accounts/api/token/ にPOSTでtokenを取得。emailとpasswordが必要
# accounts/sigup/ にPOSTでuser登録. email, first_name, last_name, password は必須
# accounts/profile/ にPUTでuser情報全体を更新。上記のfieldsが必須。patchで一部の更新 
# accounts/profile/ にDELETEでuser情報を削除
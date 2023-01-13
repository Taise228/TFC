from django.contrib import admin
from .models import Class, ClassList, Enroll

# Register your models here.
admin.site.register(Class)
admin.site.register(ClassList)
admin.site.register(Enroll)
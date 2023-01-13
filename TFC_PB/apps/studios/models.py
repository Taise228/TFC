from django.db import models

# Create your models here.
class Studio(models.Model):
    name = models.CharField(max_length=100, blank=False, unique=True)
    address = models.CharField(max_length=200, blank=False)
    latitude = models.FloatField(null=False)
    longitude = models.FloatField(null=False)
    postal_code = models.CharField(max_length=200, blank=False)
    phone_number = models.CharField(max_length=100, blank=False)

    @property
    def location(self):
        return (self.latitude, self.longitude)

class StudioImages(models.Model):
    image = models.ImageField(upload_to="studios")
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, to_field="name")

class Amenities(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, to_field="name", related_name="amenityOf")
    type = models.CharField(max_length=200, blank=False)
    quantity = models.IntegerField(null=False)
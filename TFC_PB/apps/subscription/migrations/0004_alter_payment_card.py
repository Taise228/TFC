# Generated by Django 4.1 on 2022-12-07 04:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscription', '0003_payment_price'),
    ]

    operations = [
        migrations.AlterField(
            model_name='payment',
            name='card',
            field=models.CharField(max_length=19),
        ),
    ]

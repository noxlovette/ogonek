# Generated by Django 5.1.4 on 2024-12-15 19:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0004_lessons'),
    ]

    operations = [
        migrations.AddField(
            model_name='lessons',
            name='topic',
            field=models.CharField(default='english', max_length=50),
        ),
    ]

# Generated by Django 5.1.3 on 2024-11-09 18:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0004_alter_article_slug'),
    ]

    operations = [
        migrations.RenameField(
            model_name='article',
            old_name='categoty',
            new_name='category',
        ),
        migrations.AddField(
            model_name='article',
            name='difficulty',
            field=models.IntegerField(default=0, help_text='Difficulty level from 0 to 10'),
        ),
    ]

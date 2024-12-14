# Generated by Django 5.1.3 on 2024-11-10 15:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0005_rename_categoty_article_category_article_difficulty'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='published',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='article',
            name='content',
            field=models.TextField(blank=True, help_text='Markdown and LaTeX raw content'),
        ),
        migrations.AlterField(
            model_name='article',
            name='processed_html',
            field=models.TextField(blank=True, help_text='HTML content processed from markdown and LaTeX'),
        ),
        migrations.AlterField(
            model_name='article',
            name='slug',
            field=models.SlugField(blank=True, help_text='URL friendly title', max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name='article',
            name='tags',
            field=models.ManyToManyField(blank=True, null=True, related_name='articles', to='blog.tag'),
        ),
    ]

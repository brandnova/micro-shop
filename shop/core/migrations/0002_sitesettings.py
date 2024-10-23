# Generated by Django 5.0.7 on 2024-10-21 12:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('site_title', models.CharField(default='My E-commerce Site', max_length=200)),
                ('main_color', models.CharField(default='#FF69B4', max_length=7)),
            ],
            options={
                'verbose_name_plural': 'Site Settings',
            },
        ),
    ]
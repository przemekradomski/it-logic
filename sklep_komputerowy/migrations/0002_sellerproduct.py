from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sklep_komputerowy', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SellerProduct',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('category', models.CharField(max_length=40)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('image', models.FileField(upload_to='seller_products/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('seller', models.ForeignKey(limit_choices_to={'role': 'seller'}, on_delete=django.db.models.deletion.CASCADE, related_name='products', to='sklep_komputerowy.userprofile')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]

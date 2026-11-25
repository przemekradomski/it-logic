from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sklep_komputerowy', '0005_productreview'),
    ]

    operations = [
        migrations.AddField(
            model_name='sellerproduct',
            name='description',
            field=models.TextField(blank=True, default='', max_length=5000),
        ),
    ]

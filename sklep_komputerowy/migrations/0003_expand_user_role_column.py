from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sklep_komputerowy', '0002_sellerproduct'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE users MODIFY role VARCHAR(10) NULL DEFAULT 'customer'",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]

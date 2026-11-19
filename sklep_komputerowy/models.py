from django.db import models

# Create your models here.

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('seller', 'Seller'),
        ('admin', 'Administrator'),
    ]

    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='customer',
        null=True,
        blank=True
    )

    phone = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'users'
        managed = True


class SellerProduct(models.Model):
    API_ID_OFFSET = 1_000_000

    seller = models.ForeignKey(
        UserProfile,
        related_name='products',
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'seller'},
    )
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=40)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.FileField(upload_to='seller_products/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def api_id(self):
        return self.API_ID_OFFSET + self.pk

    def to_api_data(self):
        price = float(self.price)
        return {
            'id': self.api_id,
            'name': self.name,
            'category': self.category,
            'price': f'{price:.2f} zł'.replace('.', ','),
            'priceValue': price,
            'image': self.image.url,
            'inStock': True,
        }


class Cart(models.Model):
    cart_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        UserProfile,
        db_column='user_id',
        related_name='cart',
        on_delete=models.DO_NOTHING,
    )
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'carts'
        managed = False


class CartItem(models.Model):
    cart_item_id = models.AutoField(primary_key=True)
    cart = models.ForeignKey(
        Cart,
        db_column='cart_id',
        related_name='items',
        on_delete=models.DO_NOTHING,
    )
    product_id = models.IntegerField()
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'cart_items'
        managed = False
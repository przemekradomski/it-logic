PRODUCTS = [
    {
        'id': 1,
        'name': 'ASUS TUF Gaming A15',
        'category': 'Laptopy',
        'price': '4299,00 zł',
        'priceValue': 4299,
        'image': '/images/laptop.jpg',
        'inStock': True,
    },
    {
        'id': 2,
        'name': 'Gigabyte GeForce RTX 4070',
        'category': 'Podzespoły',
        'price': '2699,00 zł',
        'priceValue': 2699,
        'image': '/images/gpu.jpg',
        'inStock': True,
    },
    {
        'id': 3,
        'name': 'Samsung Odyssey G5 27"',
        'category': 'Monitory',
        'price': '999,00 zł',
        'priceValue': 999,
        'image': '/images/monitor.jpg',
        'inStock': True,
    },
    {
        'id': 4,
        'name': 'Keychron K8 Pro',
        'category': 'Akcesoria',
        'price': '449,00 zł',
        'priceValue': 449,
        'image': '/images/keyboard.jpg',
        'inStock': True,
    },
]

PRODUCTS_BY_ID = {product['id']: product for product in PRODUCTS}

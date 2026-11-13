from django.http import JsonResponse
from django.shortcuts import render


def dashboard(request):
    return render(request, 'dashboard.html', {
        'title': 'IT-Logic',
        'vite_server_url': None,
    })


def api_products(request):
    products = [
        {
            'id': 1,
            'name': 'ASUS TUF Gaming A15',
            'category': 'Laptopy',
            'price': '4299,00 zł',
            'image': '/images/laptop.jpg',
            'inStock': True,
        },
        {
            'id': 2,
            'name': 'Gigabyte GeForce RTX 4070',
            'category': 'Podzespoły',
            'price': '2699,00 zł',
            'image': '/images/gpu.jpg',
            'inStock': True,
        },
        {
            'id': 3,
            'name': 'Samsung Odyssey G5 27"',
            'category': 'Monitory',
            'price': '999,00 zł',
            'image': '/images/monitor.jpg',
            'inStock': True,
        },
        {
            'id': 4,
            'name': 'Keychron K8 Pro',
            'category': 'Akcesoria',
            'price': '449,00 zł',
            'image': '/images/keyboard.jpg',
            'inStock': True,
        },
    ]
    return JsonResponse({'products': products})

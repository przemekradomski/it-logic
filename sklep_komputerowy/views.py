from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib import messages
from .catalog import PRODUCTS
from .models import UserProfile


def dashboard(request):
    return render(request, 'dashboard.html', {
        'title': 'IT-Logic',
        'vite_server_url': None,
    })


def api_products(request):
    return JsonResponse({'products': PRODUCTS})

def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

    if password != confirm_password:
        messages.error("Hasła się nie zgadzają!")
        return redirect('register')
    if User.objects.filter(username=username).exists():
        messages.error('Nazwa jest już zajęta')
        return redirect('register')
    if User.objects.filter(email=email).exists():
        messages.error('Adres email jest już zajęty')
        return redirect('register')
    if User.objects.filter(phone=phone).exists():
        messages.error('Numer telefonu jest już zajęty')
        return redirect('register')

    UserProfile.objects.create(
        username=username,
        email=email,
        phon=phone,
        password=make_password(password),
        created_at=timezone.now()
    )

    return render(request, 'frontend/src/App.jsx')
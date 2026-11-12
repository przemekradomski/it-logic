from django.conf import settings
from django.shortcuts import render


def dashboard(request):
    vite_server_url = 'http://localhost:5173' if settings.DEBUG else ''
    return render(request, 'dashboard.html', {'vite_server_url': vite_server_url})
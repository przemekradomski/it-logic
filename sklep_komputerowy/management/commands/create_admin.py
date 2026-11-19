from getpass import getpass

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand, CommandError
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

from sklep_komputerowy.models import UserProfile


class Command(BaseCommand):
    help = 'Tworzy konto administratora aplikacji.'

    def handle(self, *args, **options):
        username = input('Nazwa użytkownika: ').strip()
        email = input('Email: ').strip()
        password = getpass('Hasło: ')
        confirm_password = getpass('Powtórz hasło: ')

        if not username or len(username) > 50:
            raise CommandError('Nazwa użytkownika jest wymagana i może mieć maksymalnie 50 znaków.')
        if not email or len(email) > 100:
            raise CommandError('Email jest wymagany i może mieć maksymalnie 100 znaków.')
        try:
            validate_email(email)
        except ValidationError as exc:
            raise CommandError('Podaj prawidłowy adres email.') from exc
        if len(password) < 8:
            raise CommandError('Hasło musi mieć co najmniej 8 znaków.')
        if password != confirm_password:
            raise CommandError('Hasła się nie zgadzają.')
        if UserProfile.objects.filter(username__iexact=username).exists():
            raise CommandError('Ta nazwa użytkownika jest już zajęta.')
        if UserProfile.objects.filter(email__iexact=email).exists():
            raise CommandError('Ten adres email jest już zajęty.')

        try:
            with transaction.atomic():
                UserProfile.objects.create(
                    username=username,
                    email=email,
                    password=make_password(password),
                    role='admin',
                )
        except IntegrityError as exc:
            raise CommandError('Użytkownik o tej nazwie lub adresie email już istnieje.') from exc

        self.stdout.write(self.style.SUCCESS(f'Konto administratora {username} zostało utworzone.'))

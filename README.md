# it-logic

it-logic to strona internetowa sklepu komputerowego, przeznaczona do prezentacji i sprzedaży sprzętu komputerowego oraz akcesoriów.

## Status projektu

Strona jest w fazie beta i testowej. Funkcje oraz wygląd mogą ulegać zmianom, a podczas korzystania mogą występować błędy.

## Technologie

- Frontend: React, Vite i Node.js
- Backend: Django i Python 3.15
- Baza danych: MariaDB

## Licencja

Projekt jest udostępniany na licencji MIT. Szczegóły znajdują się w pliku [LICENSE](./LICENSE).

## Uruchomienie w Dockerze

Wymagany jest Docker Desktop z Docker Compose. W PowerShellu, w katalogu projektu, skopiuj przykładową konfigurację:

```powershell
Copy-Item .env.example .env
```

W pliku `.env` ustaw własny `DJANGO_SECRET_KEY`, `MARIADB_PASSWORD` i `MARIADB_ROOT_PASSWORD`. Wartości przykładowe są przeznaczone wyłącznie do lokalnych testów.

Zbuduj obrazy i uruchom aplikację:

```powershell
docker compose up --build
```

Sklep będzie dostępny pod adresem <http://localhost:8000>. Kontener aplikacji zawiera Python 3.15, Django i Node.js 22; MariaDB działa w osobnym kontenerze. Dane bazy oraz przesłane pliki są przechowywane w wolumenach Dockera.

## PWA i tryb offline

Stronę można zainstalować z menu przeglądarki jako aplikację. Po pierwszym pełnym wczytaniu strona główna oraz pliki interfejsu zapisują się na urządzeniu i pozwalają otworzyć sklep bez połączenia z internetem. W trybie offline nie działają dane produktów, logowanie ani koszyk, ponieważ te funkcje wymagają połączenia z serwerem. Instalacja działa przez HTTPS albo na `localhost`.

Aby utworzyć konto administratora aplikacji, w drugim terminalu uruchom:

```powershell
docker compose exec web python manage.py create_admin
```

Zatrzymanie kontenerów bez usuwania danych:

```powershell
docker compose down
```

#!/bin/sh
set -eu

python manage.py migrate --fake-initial --noinput
python manage.py ensure_cart_tables
exec python manage.py runserver 0.0.0.0:8000

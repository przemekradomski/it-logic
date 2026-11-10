import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'itLogic.settings')

import django

django.setup()

from django.db import connections
from django.db.utils import OperationalError


def test_database_connection():
    db_conn = connections['default']
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()[0]
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()

        print("Połączenie z bazą danych poszło pomyślnie")
        print(f"Wersja mysql'a: {version}")

        for table in tables:
            print(table[0])
    except OperationalError as exc:
        print("Błąd połączenia")
        print(exc)


if __name__ == '__main__':
    test_database_connection()
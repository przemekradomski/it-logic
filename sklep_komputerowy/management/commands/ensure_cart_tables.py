from django.core.management.base import BaseCommand
from django.db import connection

from sklep_komputerowy.models import Cart, CartItem


class Command(BaseCommand):
    help = 'Tworzy brakujące tabele koszyka dla nowej bazy.'

    def handle(self, *args, **options):
        models = (Cart, CartItem)
        existing_tables = set(connection.introspection.table_names())

        with connection.schema_editor() as schema_editor:
            for model in models:
                table_name = model._meta.db_table
                if table_name not in existing_tables:
                    schema_editor.create_model(model)
                    existing_tables.add(table_name)
                    self.stdout.write(f'Utworzono tabelę {table_name}.')

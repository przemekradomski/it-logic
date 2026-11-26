from django.core.management.base import BaseCommand
from django.db import connection, transaction

from sklep_komputerowy.models import Cart, CartItem, SellerProduct


def _upgrade_existing_cart_item_fk():
    """Point an existing MySQL cart FK at SellerProduct without losing rows."""
    table = CartItem._meta.db_table
    if table not in connection.introspection.table_names():
        return

    with connection.cursor() as cursor:
        constraints = connection.introspection.get_constraints(cursor, table)
        product_fks = {
            name: details
            for name, details in constraints.items()
            if 'product_id' in details.get('columns', []) and details.get('foreign_key')
        }
        target_table = SellerProduct._meta.db_table
        wrong_fks = {
            name: details
            for name, details in product_fks.items()
            if details['foreign_key'][0] != target_table
        }
        has_target_fk = any(
            details['foreign_key'][0] == target_table
            for details in product_fks.values()
        )

        if connection.vendor != 'mysql':
            if wrong_fks:
                raise RuntimeError(
                    'cart_items.product_id has an unexpected foreign key. '
                    'Automatic conversion is supported only for MySQL.'
                )
            return

        cursor.execute(f'SELECT DISTINCT product_id FROM {connection.ops.quote_name(table)}')
        stored_ids = {row[0] for row in cursor.fetchall()}
        seller_ids = set(SellerProduct.objects.values_list('pk', flat=True))
        public_to_db = {
            SellerProduct.API_ID_OFFSET + seller_id: seller_id
            for seller_id in seller_ids
        }
        converted = {}
        invalid = []
        for stored_id in stored_ids:
            if stored_id in seller_ids:
                continue
            if stored_id in public_to_db:
                converted[stored_id] = public_to_db[stored_id]
            else:
                invalid.append(stored_id)
        if invalid:
            raise RuntimeError(
                'Cannot update cart_items safely: these product_id values do not '
                f'match seller products: {invalid[:10]}. No schema changes were made.'
            )

        quote = connection.ops.quote_name
        with transaction.atomic():
            for name in wrong_fks:
                cursor.execute(
                    f'ALTER TABLE {quote(table)} DROP FOREIGN KEY {quote(name)}'
                )
            for public_id, seller_id in converted.items():
                cursor.execute(
                    f'UPDATE {quote(table)} SET {quote("product_id")} = %s '
                    f'WHERE {quote("product_id")} = %s',
                    [seller_id, public_id],
                )
            if not has_target_fk:
                product_field = CartItem._meta.get_field('product')
                product_column_type = product_field.db_type(connection)
                null_sql = 'NULL' if product_field.null else 'NOT NULL'
                cursor.execute(
                    f'ALTER TABLE {quote(table)} MODIFY COLUMN '
                    f'{quote("product_id")} {product_column_type} {null_sql}'
                )
                cursor.execute(
                    f'ALTER TABLE {quote(table)} ADD CONSTRAINT '
                    f'{quote("fk_cart_items_seller_product")} '
                    f'FOREIGN KEY ({quote("product_id")}) '
                    f'REFERENCES {quote(target_table)} ({quote(SellerProduct._meta.pk.column)})'
                )


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

        _upgrade_existing_cart_item_fk()

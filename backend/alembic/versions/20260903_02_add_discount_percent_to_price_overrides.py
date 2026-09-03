"""add discount_percent to property_price_overrides

Revision ID: 20260903_02_discount_percent
Revises: 20260903_01_local_rec
Create Date: 2026-09-03

"""
from alembic import op
import sqlalchemy as sa

revision = '20260903_02_discount_percent'
down_revision = '20260903_01_local_rec'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    cols = [c['name'] for c in inspector.get_columns('property_price_overrides')]
    if 'discount_percent' not in cols:
        op.add_column(
            'property_price_overrides',
            sa.Column('discount_percent', sa.Integer(), nullable=True)
        )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    cols = [c['name'] for c in inspector.get_columns('property_price_overrides')]
    if 'discount_percent' in cols:
        op.drop_column('property_price_overrides', 'discount_percent')

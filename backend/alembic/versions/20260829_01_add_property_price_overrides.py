"""add property_price_overrides table

Revision ID: 20260829_01_price_overrides
Revises: 20260625_01_add_max_pets
Create Date: 2026-08-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '20260829_01_price_overrides'
down_revision = '20260625_01_add_max_pets'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'property_price_overrides',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('price_per_night', sa.Integer(), nullable=False),
        sa.Column('label', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(
        'ix_price_overrides_prop_dates',
        'property_price_overrides',
        ['property_id', 'start_date', 'end_date']
    )


def downgrade() -> None:
    op.drop_index('ix_price_overrides_prop_dates', table_name='property_price_overrides')
    op.drop_table('property_price_overrides')
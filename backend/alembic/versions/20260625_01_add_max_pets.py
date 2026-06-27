"""add max_pets to properties

Revision ID: 20260625_01_add_max_pets
Revises: 20260531_01_production_indexes_user_flags
Create Date: 2026-06-25

"""
from alembic import op
import sqlalchemy as sa

revision = '20260625_01_add_max_pets'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('properties', sa.Column('max_pets', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('properties', 'max_pets')

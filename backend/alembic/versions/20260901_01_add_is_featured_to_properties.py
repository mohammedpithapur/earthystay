"""add is_featured to properties

Revision ID: 20260901_01_is_featured
Revises: 20260829_02_album_and_push
Create Date: 2026-09-01

"""
from alembic import op
import sqlalchemy as sa

revision = '20260901_01_is_featured'
down_revision = '20260829_02_album_and_push'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    prop_cols = [c['name'] for c in inspector.get_columns('properties')]
    if 'is_featured' not in prop_cols:
        op.add_column(
            'properties',
            sa.Column('is_featured', sa.Boolean(), server_default=sa.false(), nullable=False)
        )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    prop_cols = [c['name'] for c in inspector.get_columns('properties')]
    if 'is_featured' in prop_cols:
        op.drop_column('properties', 'is_featured')

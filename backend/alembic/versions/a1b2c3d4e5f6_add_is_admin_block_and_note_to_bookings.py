"""add_is_admin_block_and_note_to_bookings

Revision ID: a1b2c3d4e5f6
Revises: 20260531_01_production_indexes_user_flags
Create Date: 2026-06-12
"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = 'd6b48bdd26c5'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'bookings',
        sa.Column('is_admin_block', sa.Boolean(), server_default='false', nullable=False)
    )
    op.add_column(
        'bookings',
        sa.Column('note', sa.Text(), nullable=True)
    )


def downgrade():
    op.drop_column('bookings', 'note')
    op.drop_column('bookings', 'is_admin_block')

"""create event requests table

Revision ID: d6b48bdd26c5
Revises: e48a7d633e14
Create Date: 2026-06-10 15:30:09.961567

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6b48bdd26c5'
down_revision: Union[str, None] = 'e48a7d633e14'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Safely create enum type only if it doesn't already exist
    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'eventstatus') THEN
                    CREATE TYPE eventstatus AS ENUM ('pending', 'contacted', 'confirmed', 'cancelled');
                END IF;
            END
            $$;
            """
        )
    )

    # Check if table already exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if 'event_requests' not in tables:
        op.create_table(
            'event_requests',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('destination', sa.String(length=100), nullable=False),
            sa.Column('hotel', sa.String(length=100), nullable=False),
            sa.Column('nature_of_event', sa.String(length=100), nullable=False),
            sa.Column('event_start_date', sa.Date(), nullable=False),
            sa.Column('event_end_date', sa.Date(), nullable=False),
            sa.Column('no_of_guests', sa.Integer(), nullable=False),
            sa.Column('requires_rooms', sa.Boolean(), nullable=False),
            sa.Column('no_of_rooms', sa.Integer(), nullable=True),
            sa.Column('additional_details', sa.Text(), nullable=True),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('phone', sa.String(length=50), nullable=False),
            sa.Column('email', sa.String(length=255), nullable=False),
            sa.Column(
                'status',
                sa.Enum(
                    'pending', 'contacted', 'confirmed', 'cancelled',
                    name='eventstatus',
                    create_type=False,
                ),
                nullable=False,
            ),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
        )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if 'event_requests' in tables:
        op.drop_table('event_requests')

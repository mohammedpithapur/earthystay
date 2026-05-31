"""Add production indexes and user status flags

Revision ID: 20260531_01
Revises: 20260524_01
Create Date: 2026-05-31 00:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260531_01"
down_revision = "20260524_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("users", sa.Column("is_email_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("password_reset_token_hash", sa.String(length=64), nullable=True))
    op.add_column("users", sa.Column("password_reset_expires_at", sa.DateTime(), nullable=True))
    op.alter_column("users", "is_active", server_default=None)
    op.alter_column("users", "is_email_verified", server_default=None)
    op.create_index("ix_users_password_reset_token_hash", "users", ["password_reset_token_hash"])

    op.create_index("ix_bookings_property_id", "bookings", ["property_id"])
    op.create_index("ix_bookings_guest_id", "bookings", ["guest_id"])
    op.create_index("ix_bookings_status", "bookings", ["status"])
    op.create_index("ix_bookings_property_dates", "bookings", ["property_id", "check_in", "check_out"])
    op.create_index("ix_properties_is_published", "properties", ["is_published"])
    op.create_index("ix_properties_owner_id", "properties", ["owner_id"])
    op.create_index("ix_properties_is_published_city", "properties", ["is_published", "city"])


def downgrade() -> None:
    op.drop_index("ix_properties_is_published_city", table_name="properties")
    op.drop_index("ix_properties_owner_id", table_name="properties")
    op.drop_index("ix_properties_is_published", table_name="properties")
    op.drop_index("ix_bookings_property_dates", table_name="bookings")
    op.drop_index("ix_bookings_status", table_name="bookings")
    op.drop_index("ix_bookings_guest_id", table_name="bookings")
    op.drop_index("ix_bookings_property_id", table_name="bookings")
    op.drop_index("ix_users_password_reset_token_hash", table_name="users")
    op.drop_column("users", "password_reset_expires_at")
    op.drop_column("users", "password_reset_token_hash")
    op.drop_column("users", "is_email_verified")
    op.drop_column("users", "is_active")

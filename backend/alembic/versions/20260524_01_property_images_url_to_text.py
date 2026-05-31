"""Alter property_images.image_url to Text

Revision ID: 20260524_01
Revises:
Create Date: 2026-05-24 14:30:00
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260524_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "property_images",
        "image_url",
        existing_type=sa.String(length=1000),
        type_=sa.Text(),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "property_images",
        "image_url",
        existing_type=sa.Text(),
        type_=sa.String(length=1000),
        existing_nullable=False,
    )

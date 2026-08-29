"""add album_name to property_images and push_subscriptions

Revision ID: 20260829_02_album_and_push
Revises: 20260829_01_price_overrides
Create Date: 2026-08-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '20260829_02_album_and_push'
down_revision = '20260829_01_price_overrides'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    # 1. Ensure album_name exists on property_images
    image_cols = [c['name'] for c in inspector.get_columns('property_images')]
    if 'album_name' not in image_cols:
        op.add_column(
            'property_images',
            sa.Column('album_name', sa.String(length=100), server_default='General', nullable=False)
        )

    # 2. Ensure push_subscriptions table exists
    tables = inspector.get_table_names()
    if 'push_subscriptions' not in tables:
        op.create_table(
            'push_subscriptions',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
            sa.Column('endpoint', sa.Text(), nullable=False, unique=True),
            sa.Column('p256dh', sa.String(length=512), nullable=False),
            sa.Column('auth', sa.String(length=64), nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        )

    # 3. Ensure any other optional Property columns exist
    prop_cols = [c['name'] for c in inspector.get_columns('properties')]
    optional_columns = [
        ('contact_whatsapp', sa.String(length=50), "''"),
        ('contact_spare_phone', sa.String(length=50), "''"),
        ('booking_email_instructions', sa.Text(), "''"),
        ('base_guests', sa.Integer(), '2'),
        ('extra_guest_charge_per_night', sa.Integer(), '0'),
        ('bathrooms_detail', postgresql.JSONB(), "'[]'::jsonb"),
        ('override_house_rules', sa.Boolean(), 'false'),
        ('override_amenities', sa.Boolean(), 'false'),
        ('override_details', sa.Boolean(), 'false'),
        ('pet_charge_per_night', sa.Integer(), '0'),
    ]
    for col_name, col_type, col_default in optional_columns:
        if col_name not in prop_cols:
            op.add_column(
                'properties',
                sa.Column(col_name, col_type, server_default=sa.text(col_default), nullable=False)
            )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    tables = inspector.get_table_names()
    if 'push_subscriptions' in tables:
        op.drop_table('push_subscriptions')

    image_cols = [c['name'] for c in inspector.get_columns('property_images')]
    if 'album_name' in image_cols:
        op.drop_column('property_images', 'album_name')

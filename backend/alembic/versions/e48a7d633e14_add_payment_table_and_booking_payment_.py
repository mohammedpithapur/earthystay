"""add_payment_table_and_booking_payment_status

Revision ID: e48a7d633e14
Revises: 20260531_01
Create Date: 2026-06-04 13:18:07.293021

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = 'e48a7d633e14'
down_revision: Union[str, None] = '20260531_01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # ── password_reset_tokens ─────────────────────────────────────────────────
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash  VARCHAR(64) NOT NULL,
            expires_at  TIMESTAMP NOT NULL,
            used_at     TIMESTAMP,
            created_at  TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_created_at ON password_reset_tokens(created_at)"))
    conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_password_reset_tokens_token_hash ON password_reset_tokens(token_hash)"))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)"))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_user_id ON password_reset_tokens(user_id)"))

    # ── razorpaypaymentstatus enum ────────────────────────────────────────────
    conn.execute(text("""
        DO $$ BEGIN
            CREATE TYPE razorpaypaymentstatus AS ENUM ('created', 'paid', 'failed', 'refunded');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    # ── payments table ────────────────────────────────────────────────────────
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS payments (
            id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            booking_id           UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
            razorpay_order_id    VARCHAR(100) NOT NULL,
            razorpay_payment_id  VARCHAR(100),
            razorpay_signature   VARCHAR(512),
            amount               INTEGER NOT NULL,
            currency             VARCHAR(10) NOT NULL DEFAULT 'INR',
            status               razorpaypaymentstatus NOT NULL DEFAULT 'created',
            created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at           TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT uq_payments_booking_id       UNIQUE (booking_id),
            CONSTRAINT uq_payments_razorpay_order_id UNIQUE (razorpay_order_id)
        )
    """))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_payments_booking_id ON payments(booking_id)"))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_payments_razorpay_order_id ON payments(razorpay_order_id)"))

    # ── paymentstatus enum ────────────────────────────────────────────────────
    conn.execute(text("""
        DO $$ BEGIN
            CREATE TYPE paymentstatus AS ENUM ('unpaid', 'paid', 'refunded');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    # ── bookings.payment_status ───────────────────────────────────────────────
    conn.execute(text("""
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS payment_status paymentstatus NOT NULL DEFAULT 'unpaid'
    """))

    # ── bookings.is_shadow_block (may already exist) ──────────────────────────
    conn.execute(text("""
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS is_shadow_block BOOLEAN NOT NULL DEFAULT FALSE
    """))

    # ── bookings.parent_booking_id (may already exist) ────────────────────────
    conn.execute(text("""
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS parent_booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE
    """))

    # ── Remove old password reset columns from users (moved to separate table)
    conn.execute(text("""
        ALTER TABLE users
        DROP COLUMN IF EXISTS password_reset_token_hash,
        DROP COLUMN IF EXISTS password_reset_expires_at
    """))


def downgrade() -> None:
    conn = op.get_bind()

    conn.execute(text("ALTER TABLE bookings DROP COLUMN IF EXISTS payment_status"))
    conn.execute(text("DROP TYPE IF EXISTS paymentstatus"))
    conn.execute(text("DROP TABLE IF EXISTS payments"))
    conn.execute(text("DROP TYPE IF EXISTS razorpaypaymentstatus"))
    conn.execute(text("DROP TABLE IF EXISTS password_reset_tokens"))

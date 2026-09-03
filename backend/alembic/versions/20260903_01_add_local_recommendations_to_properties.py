"""add local_recommendations to properties

Revision ID: 20260903_01_local_rec
Revises: 20260901_01_is_featured
Create Date: 2026-09-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '20260903_01_local_rec'
down_revision = '20260901_01_is_featured'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    prop_cols = [c['name'] for c in inspector.get_columns('properties')]
    if 'local_recommendations' not in prop_cols:
        op.add_column(
            'properties',
            sa.Column(
                'local_recommendations',
                postgresql.JSONB(astext_type=sa.Text()),
                server_default=sa.text("'[]'::jsonb"),
                nullable=False,
            )
        )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    prop_cols = [c['name'] for c in inspector.get_columns('properties')]
    if 'local_recommendations' in prop_cols:
        op.drop_column('properties', 'local_recommendations')

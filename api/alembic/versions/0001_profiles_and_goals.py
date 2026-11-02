"""Profils et priorités

Première migration : les tables « profile » et « goal ». Elle est écrite à
la main, en miroir exact de app/models/. Les suivantes pourront être
générées avec « alembic revision --autogenerate -m '…' ».

Revision ID: 0001
Revises:
Create Date: 2026-10-28
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "profile",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("tone", sa.String(20), nullable=False),
    )

    op.create_table(
        "goal",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "profile_id",
            sa.Integer(),
            sa.ForeignKey("profile.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("category", sa.String(20), nullable=False),
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("done_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "category IN ('work', 'learning', 'sport')",
            name="goal_category_valid",
        ),
    )
    op.create_index("ix_goal_profile_id", "goal", ["profile_id"])


def downgrade() -> None:
    # L'ordre inverse de upgrade : goal dépend de profile.
    op.drop_index("ix_goal_profile_id", table_name="goal")
    op.drop_table("goal")
    op.drop_table("profile")

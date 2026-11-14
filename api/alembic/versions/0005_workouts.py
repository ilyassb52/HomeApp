"""Suivi des entraînements

Les tables « workout_session », « workout_exercise » et « workout_set », en
miroir de app/models/workout.py. Chaque niveau est supprimé avec celui
qui le contient (CASCADE).

Revision ID: 0005
Revises: 0004
Create Date: 2026-11-14
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "workout_session",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "profile_id",
            sa.Integer(),
            sa.ForeignKey("profile.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("note", sa.String(200), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_workout_session_profile_id", "workout_session", ["profile_id"])
    op.create_index("ix_workout_session_day", "workout_session", ["day"])

    op.create_table(
        "workout_exercise",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "session_id",
            sa.Integer(),
            sa.ForeignKey("workout_session.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(80), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
    )
    op.create_index(
        "ix_workout_exercise_session_id", "workout_exercise", ["session_id"]
    )

    op.create_table(
        "workout_set",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "exercise_id",
            sa.Integer(),
            sa.ForeignKey("workout_exercise.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("reps", sa.Integer(), nullable=False),
        sa.Column("weight_kg", sa.Numeric(5, 1), nullable=True),
        sa.CheckConstraint("reps > 0", name="workout_set_reps_positive"),
        sa.CheckConstraint(
            "weight_kg IS NULL OR weight_kg >= 0",
            name="workout_set_weight_positive",
        ),
    )
    op.create_index("ix_workout_set_exercise_id", "workout_set", ["exercise_id"])


def downgrade() -> None:
    # Dans l'ordre inverse : d'abord les tables qui pointent vers les autres.
    op.drop_table("workout_set")
    op.drop_table("workout_exercise")
    op.drop_table("workout_session")

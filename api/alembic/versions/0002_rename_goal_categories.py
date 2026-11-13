"""Catégories de priorités renommées

Les catégories deviennent plus générales :
  work     → task     (Tâche : courses, papiers, ménage…)
  learning → project  (Projet : ce qui avance sur plusieurs jours)
  sport    → sport    (inchangée)

La base vérifie elle-même la catégorie (contrainte « goal_category_valid »,
voir 0001). On ne peut pas modifier une contrainte : on la supprime, on
renomme les priorités déjà enregistrées, puis on la recrée avec les
nouveaux noms. Les priorités existantes sont donc conservées.

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-03
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

CONSTRAINT = "goal_category_valid"

# Ancien nom → nouveau nom. sport ne change pas, il n'est pas dans la liste.
RENAMES = {"work": "task", "learning": "project"}


def _rename_categories(renames: dict[str, str], allowed: str) -> None:
    """Supprime la contrainte, renomme les catégories, recrée la contrainte.

    Écrit une fois ici, utilisé dans les deux sens (upgrade et downgrade).
    """
    op.drop_constraint(CONSTRAINT, "goal", type_="check")
    for old, new in renames.items():
        op.execute(f"UPDATE goal SET category = '{new}' WHERE category = '{old}'")
    op.create_check_constraint(CONSTRAINT, "goal", f"category IN {allowed}")


def upgrade() -> None:
    _rename_categories(RENAMES, "('task', 'project', 'sport')")


def downgrade() -> None:
    # Le même dictionnaire, retourné : task → work, project → learning.
    reverse = {new: old for old, new in RENAMES.items()}
    _rename_categories(reverse, "('work', 'learning', 'sport')")

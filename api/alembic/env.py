"""
==========================================================================
alembic/env.py — comment Alembic se connecte à la base

Alembic appelle ce fichier à chaque commande (upgrade, revision…). Il lui
fournit deux choses :

  - la connexion, reprise de l'API (app/core/database.py) ;
  - la description des tables (Base.metadata), qui permet à
    « alembic revision --autogenerate » de comparer les modèles Python à
    la base réelle et d'écrire la migration à notre place.
==========================================================================
"""

from logging.config import fileConfig

from alembic import context

# Importer app.models enregistre tous les modèles dans Base.metadata.
import app.models  # noqa: F401
from app.core.database import Base, engine

if context.config.config_file_name is not None:
    fileConfig(context.config.config_file_name)

with engine.connect() as connection:
    context.configure(connection=connection, target_metadata=Base.metadata)
    with context.begin_transaction():
        context.run_migrations()

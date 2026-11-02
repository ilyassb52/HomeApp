"""
==========================================================================
app/main.py — le point d'entrée de l'API

Il crée l'application et y branche les routeurs, un par ressource
(app/routers/). Il garde lui-même une seule route : /health, qui confirme
que l'API tourne ET qu'elle parle à la base.

La documentation interactive est générée toute seule : http://localhost:8000/docs
==========================================================================
"""

from fastapi import FastAPI
from sqlalchemy import text

from app.core.database import engine
from app.routers import goals

app = FastAPI(title="Magic Mirror API")
app.include_router(goals.router)


@app.get("/health")
def health() -> dict[str, str]:
    # SELECT 1 ne lit rien : il échoue seulement si la base est injoignable.
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok"}

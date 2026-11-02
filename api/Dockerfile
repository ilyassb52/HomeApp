# ==========================================================================
# api/Dockerfile — l'image de l'API
#
# Les dépendances sont installées AVANT de copier le code : Docker garde
# chaque étape en cache, et ne réinstalle donc rien tant que
# requirements.txt ne change pas.
# ==========================================================================

FROM python:3.12-slim

WORKDIR /code

# Pas de fichiers .pyc, et des logs affichés tout de suite.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

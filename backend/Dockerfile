# ── AWS Lambda Container Image ────────────────────────────────────────────────
# Uses the official AWS Lambda Python 3.12 base image.
# This is deployed via AWS ECR → Lambda (container image).
# For local dev, use: docker-compose.yml (which uses the gunicorn CMD instead)

FROM public.ecr.aws/lambda/python:3.12

# Install system deps needed by psycopg2 / asyncpg
RUN dnf install -y libpq gcc && dnf clean all

# Copy & install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./

# AWS Lambda invokes this handler: app/main.py → handler (Mangum instance)
CMD ["app.main.handler"]

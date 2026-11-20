FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.15-slim AS app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        default-libmysqlclient-dev \
        libmariadb3 \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY --from=frontend-build /usr/local/bin/node /usr/local/bin/node
COPY --from=frontend-build /usr/local/bin/npm /usr/local/bin/npm
COPY --from=frontend-build /usr/local/bin/npx /usr/local/bin/npx
COPY --from=frontend-build /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN python --version && node --version && npm --version

COPY requirements.txt ./
RUN python -m pip install --no-cache-dir -r requirements.txt

COPY . ./
COPY --from=frontend-build /app/static ./static
COPY docker/entrypoint.sh /usr/local/bin/container-entrypoint

RUN groupadd --system app \
    && useradd --system --gid app --create-home app \
    && mkdir -p /app/media \
    && chown -R app:app /app/media \
    && chmod +x /usr/local/bin/container-entrypoint

USER app

EXPOSE 8000

ENTRYPOINT ["container-entrypoint"]

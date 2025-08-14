#!/bin/bash

export $(grep -v '^#' backend.env | xargs)

brew services start postgresql

if psql -U "$PGUSER" -d postgres -h "$PGHOST" -p "$PGPORT" -tAc "SELECT 1 FROM pg_database WHERE datname='${PGDATABASE}'" | grep -q 1
then
    echo "Database '$PGDATABASE' already exists."
else
    echo "Database '$PGDATABASE' does not exist. Creating..."
    createdb -U "$PGUSER" -h "$PGHOST" -p "$PGPORT" "$PGDATABASE" \
      && echo "Database created." \
      && psql -U "$PGUSER" -h "$PGHOST" -p "$PGPORT" -d "$PGDATABASE" -f ./src/database/schema.sql
fi

nodemon src/index.js
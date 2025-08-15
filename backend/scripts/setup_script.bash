#!/bin/bash

brew services start postgresql

export $(grep -v '^#' backend.env | xargs)

if psql -U "$PGUSER" -d postgres -h "$PGHOST" -p "$PGPORT" -tAc "SELECT 1 FROM pg_database WHERE datname='${PGDATABASE}'" | grep -q 1
then
    echo "Database '$PGDATABASE' already exists." \
    && psql "$PGDATABASE" "$PGUSER" -f ./src/database/schema.sql \
    && echo "Schema.sql was executed."
else
    echo "Database '$PGDATABASE' does not exist. Creating..."
    createdb "$PGDATABASE" \
      && echo "Database created." \
      && psql "$PGDATABASE" "$PGUSER" -f ./src/database/schema.sql \
      && echo "Schema.sql was executed."
fi
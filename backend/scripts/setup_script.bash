export $(grep -v '^#' backend/backend.env | xargs)

psql $PGUSER $PGDATABASE -f ../src/database/schema.sql
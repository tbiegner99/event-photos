#! /bin/bash

docker run -e PGPASSWORD=event-photos --network=event-photos-local-dev --rm jbergknoff/postgresql-client  psql -h event-photos-db -d event-photos -U event-photos -p 5432 -c "DROP SCHEMA \"event-photos\" CASCADE; "

if [[ $1 = "--disable-seed" ]]
then
  docker run -e PGPASSWORD=event-photos --network=event-photos-local-dev --rm jbergknoff/postgresql-client psql -h event-photos-db -d event-photos -U event-photos -p 5432 -c "CREATE SCHEMA \"event-photos\";"
else
  docker run -v $EVENT_PHOTOS_HOME/local-dev/scripts/seed:/seed -e PGPASSWORD=event-photos --network=event-photos-local-dev --rm jbergknoff/postgresql-client  psql -h event-photos-db -d event-photos -U event-photos -p 5432 -f "/seed/dump-event-photos.sql"
fi

docker run -e PGPASSWORD=event-photos --network=event-photos-local-dev --rm jbergknoff/postgresql-client  psql -h event-photos-db -d event-photos -U event-photos -p 5432 -c "ALTER SCHEMA public RENAME TO \"event-photos\"; "
docker run -v $EVENT_PHOTOS_HOME/database/event-photos:/liquibase/lib --network=event-photos-local-dev liquibase/liquibase liquibase update  --username=event-photos --password=event-photos --url=jdbc:postgresql://event-photos-db:5432/event-photos --changelogFile=changelog-root.xml


docker run -v $EVENT_PHOTOS_HOME/local-dev/scripts/seed:/seed -e PGPASSWORD=event-photos --network=event-photos-local-dev --rm jbergknoff/postgresql-client  psql -h event-photos-db -d event-photos -U event-photos -p 5432 -f "/seed/event-photos.sql"

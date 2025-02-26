#mkdir -p $EVENT_PHOTOS_HOME/local-dev/postgres-data
docker-compose -p event-photos -f $EVENT_PHOTOS_HOME/local-dev/docker-compose.infra.yml up -d
$EVENT_PHOTOS_HOME/local-dev/scripts/services/service-command.sh start $@

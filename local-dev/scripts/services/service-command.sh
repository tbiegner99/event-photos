set -x
CMD=$1
case $CMD in 
    build)
    COMMAND="up -d --build"
    ;;
    start)
    COMMAND="up -d"
    ;;
    stop)
    COMMAND="down"
    ;;
    remove)
    COMMAND="rm"
    ;;
    install)
    COMMAND="run"
    ;;
    clean)
    COMMAND="run"
    ;;
esac

shift
if [ -z "$@" ]; then
    ARGS=$(find $EVENT_PHOTOS_HOME/backend -type f -iname "docker-compose.yml" -exec printf ' -f %s ' '{}' +)

    ARGS="-f $EVENT_PHOTOS_HOME/local-dev/docker-compose.services.yml -f $EVENT_PHOTOS_HOME/ui/docker-compose.yml $ARGS"

    docker-compose -p event-photos $ARGS $COMMAND
else 
    ARGS="-f $EVENT_PHOTOS_HOME/local-dev/docker-compose.services.yml "
    for ALIAS in $@
    do
        SERVICE=$($EVENT_PHOTOS_HOME/local-dev/scripts/alias.sh $ALIAS)
        
        if [ "$SERVICE" = "event-photos-ui" ]; then
            COMPOSE_FILE="-f $EVENT_PHOTOS_HOME/ui/docker-compose.yml"
        else
            COMPOSE_FILE=$(find $EVENT_PHOTOS_HOME/backend/$SERVICE -type f -iname "docker-compose.yml" -exec printf ' -f %s ' '{}' +)
        fi

       
        if [ ! -z "$COMPOSE_FILE" ]; then
            docker stop $SERVICE 
            docker rm $SERVICE
            ARGS="$COMPOSE_FILE $ARGS"
            if [ "install" = "$CMD" ]; then
                COMMAND="$COMMAND --rm -w /srv/package/cmd $SERVICE go install"
            elif [ "clean" = "$CMD" ]; then
                COMMAND="$COMMAND --rm -w /srv/package $SERVICE go clean -modcache"
            fi
        else 
            echo "NO compose file for service $SERVICE. Ignoring..."
        fi
        
    done
    if [ ! -z "$ARGS" ]; then
        docker-compose  $ARGS -p event-photos $COMMAND
    fi
fi

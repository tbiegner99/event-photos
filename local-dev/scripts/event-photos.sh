#!/bin/bash

case $1 in 
    pull-device-db | pddb)
        shift
        $EVENT_PHOTOS_HOME/local-dev/scripts/utils/pull-device-db.sh $@
        ;;
    alias)
        shift
        $EVENT_PHOTOS_HOME/local-dev/scripts/alias.sh $@
        ;;
     sh)
        shift
        SERVICE=$($EVENT_PHOTOS_HOME/local-dev/scripts/alias.sh $1)
        shift
        docker exec -it $SERVICE sh
        ;;

     exec | e)
        shift
        SERVICE=$($EVENT_PHOTOS_HOME/local-dev/scripts/alias.sh $1)
        shift
        docker exec -it $SERVICE $@
        ;;
    clean-install | ci)
        shift
        $EVENT_PHOTOS_HOME/local-dev/scripts/services/install.sh clean $@
        ;;
    install | ci)
        shift
        $EVENT_PHOTOS_HOME/local-dev/scripts/services/install.sh $@
        ;;
    logs | l) 
        shift
        $EVENT_PHOTOS_HOME/local-dev/scripts/utils/log.sh $@
    ;;
    start | s)
        shift
        $EVENT_PHOTOS_HOME/local-dev/scripts/services/start.sh $@
    ;;
    stop | x)
        shift
        $EVENT_PHOTOS_HOME/local-dev/scripts/services/stop.sh $@
    ;;
    rebuild | rb)
        shift
        $EVENT_PHOTOS_HOME/local-dev/scripts/services/rebuild.sh $@
    ;;

    db-reset | reset-db | dbr)
        shift;
        $EVENT_PHOTOS_HOME/local-dev/scripts/setup/reset-db.sh $@
        ;;
    db-migrate | migrate-db | dbm)
        $EVENT_PHOTOS_HOME/local-dev/scripts/setup/update-db.sh
        ;;
    db-update | dbu)
        $EVENT_PHOTOS_HOME/local-dev/scripts/setup/update-db.sh
        ;;

    generate-changeset | dbcs | gcs)
        shift;
        $EVENT_PHOTOS_HOME/local-dev/scripts/utils/generate-changeset.sh $@
        ;;

    restart | r) 
        shift
        $EVENT_PHOTOS_HOME/local-dev/scripts/services/restart.sh $@
    ;;
esac
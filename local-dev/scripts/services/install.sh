
if [ "$1" = "clean" ]; then
    shift
    $EVENT_PHOTOS_HOME/local-dev/scripts/services/service-command.sh clean $@
fi
$EVENT_PHOTOS_HOME/local-dev/scripts/services/service-command.sh install $@
$EVENT_PHOTOS_HOME/local-dev/scripts/services/service-command.sh start $@

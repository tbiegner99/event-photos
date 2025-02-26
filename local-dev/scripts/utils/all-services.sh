
ALL_SERVICES=$(find $EVENT_PHOTOS_HOME/backend/ -maxdepth 1 -mindepth 1 -type d  -exec basename {} \;)

ALL_SERVICES=($ALL_SERVICES "ui")
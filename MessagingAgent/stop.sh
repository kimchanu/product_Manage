#!/bin/sh

######################################## 
#
#  MSG Agent stop shell script
#
######################################## 

MSG_HOME=/var/www/html/MessagingAgent

ps -ef | grep MessagingAgent.jar | grep $LOGNAME | grep $MSG_HOME | grep -v grep | grep -v killsvr | grep -v stop.sh | \
grep -v tail | grep -v vi | awk '{ print $2 }' | \
while read PID
do
    echo kill -9 $PID
    kill -9 $PID
done

exit

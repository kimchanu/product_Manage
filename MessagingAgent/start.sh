#!/bin/sh

export LANG="ko_KR.eucKR"
export SUPPORTED="ko_KR.eucKR:ko_kr:ko"

MSG_HOME=/var/www/html/MessagingAgent

proc=`ps -ef | grep MessagingAgent.jar | grep $LOGNAME | grep $MSG_HOME | grep -v vi | grep -v grep | grep -v sh`

if [ X"$proc" != X"" ]; then
	echo "[$proc] aleady executed.."
else
	java -jar MessagingAgent.jar $MSG_HOME &
fi

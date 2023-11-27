@echo off
call serviceconfig.bat
@echo on

set SVC_HOME=%MSG_HOME%
set ERR_LOG=%MSG_HOME%\log\err.log
set SVC_EXE_JAR=MessagingAgent.jar

copy %MSG_HOME%\JavaService32.exe %MSG_HOME%\%SVC_NAME%.exe

%SVC_HOME%\%SVC_NAME%.exe ^
-install "%SVC_NAME%" "%JVMDLL%" ^
-Djava.class.path="%CLASSPATH%;%SVC_HOME%\%SVC_EXE_JAR%" ^
-start "%SVC_EXE_CLASS%" ^
-params "%MSG_HOME%" ^
-err %ERR_LOG% ^
-current "%SVC_HOME%" ^
-auto ^
-description "%SVC_NAME% Java Service"

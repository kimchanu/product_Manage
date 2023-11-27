@echo off
call serviceconfig.bat
@echo on

REM java -jar MessagingAgent.jar "%MSG_HOME%" msg.cfg
java -classpath %MSG_HOME%\MessagingAgent.jar %SVC_EXE_CLASS% "%MSG_HOME%" msg.cfg

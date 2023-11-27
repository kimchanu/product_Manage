@echo off
REM # JAVA_HOME, MSG_HOME, JVMDLL 만 설정해주세요. 
@echo on

set SVC_NAME=MessagingAgent

REM # set JAVA_HOME=C:\Program Files\Java\jdk1.6.0.25
set JAVA_HOME=C:\Program Files\Java\jre6
set MSG_HOME=D:\MessagingAgent

@echo off
REM #############################################
REM #
REM #  JRE/JDK 는 jvm.dll 설치경로가 다르다. 
REM #  jvm.dll 이 위치한곳에 JVMDLL 경로를 잡는다.
REM #
REM #############################################
@echo on

REM #set JVMDLL=%JAVA_HOME%\jre\bin\server\jvm.dll
set JVMDLL=%JAVA_HOME%\bin\client\jvm.dll

echo off
REM # 아래부분은 수정할 필요없는 공통 변수 모음
set SVC_EXE_CLASS=com.client.messaging.proc.agent.MessagingAgent
set LOG_COM_PREFIX=msg
set LOG_SMS_PREFIX=sms
set LOG_MMS_PREFIX=mms
set LOG_REP_PREFIX=rep
set LOG_ACK_PREFIX=ack
@echo on

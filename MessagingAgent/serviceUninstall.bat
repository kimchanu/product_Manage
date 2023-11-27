@echo off
call serviceconfig.bat
@echo on

%MSG_HOME%\%SVC_NAME%.exe ^
-uninstall "%SVC_NAME%"

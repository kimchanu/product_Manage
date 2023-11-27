[Windows 서비스 등록법]

1. serviceconfig.bat 파일 수정
   : 아래 3개의 변수만 수정한다.

	1.1 JAVA_HOME 설정 	
	set JAVA_HOME=C:\Program Files\Java\jdk1.6.0_25   -> JDK 를 설치했을 경우 
	set JAVA_HOME=C:\Program Files\Java\jre6          -> JRE 를 설치했을 경우
	: 둘중 하나만 설정한다. 
	

	1.2 MSG_HOME 설정 
	set MSG_HOME=d:\msgagent                       -> 메시지 Agent 를 설치한 경로를 설정.

	1.3 JVMDLL 설정 
	set JVMDLL=%JAVA_HOME%\jre\bin\server\jvm.dll  -> JDK 를 설치했을 경우 
	set JVMDLL=%JAVA_HOME%\bin\client\jvm.dll      -> JRE 를 설치했을 경우 
	: 둘중 하나만 설정한다. 	
	

2. serviceInstall32(64).bat 파일을 실행하여 등록합니다.
   Windows7 의 경우는 반드시 관리자 권한으로 실행을 하여야 가능합니다.
   32bit Windows 의 경우는 serviceInstall32.bat 을 실행한다. 
   64bit Windows 의 경우는 serviceInstall64.bat 을 실행한다. 

3. 서비스 등록후 실행시 에러가 발행할때 
	3.1 설치폴더에 err.log 가 생겨있다면, 로그를 확인 후 재설정한다.
	3.2 설치폴더에 err.log 가 없으면 서비스 속성으로 들어가서 System 계정이 
	아니라 .\Administrator 계정으로 시작하도록 설정한다.


[Windows 서비스 삭제]

2. serviceUninstall.bat 파일을 실행하면 자동 서비스 삭제됩니다.


[Linux/UNIX 계열]
1. .bash_profile 수정

export LANG=en_US // export LANG=c  // export LANG=ko_KR.eucKR   -> 이 셋중에 vi 안 깨지는 것으로 설정 
export PATH=/usr/local/jdk1.5.0_22/bin:$PATH    -> 기존패스에 자바 패스 추가


2. start.sh 파일의 수정 
 : start.sh 파일을 열어서 MSG_HOME 부분만 수정한다. 
  MSG_HOME 은 설치경로, 즉 MessagingAgent.jar 파일이 위치한 경로를 명시한다.

  실행은 start.sh 중지는 stop.sh 로 한다. 

% DB2 테이블 스크립트 % 
DB2 사용업체는 sql/db2 폴더내의 테이블 생성스크립트에 테이블 스페이스를 지정한
후 프로스세를 시작하도록 한다. DB2 는 테이블크기 때문에 테이블이 생성 안되는 경우가
발생할수 있기 때문에...


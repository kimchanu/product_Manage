# product_Manage

사업소의 유지관리용 잡자재를 관리하는 사내 웹 애플리케이션입니다. 자재 목록, 입고·출고, 예산, 수불명세서, 전자결재, 게시판과 관리자 기능을 제공합니다.

프런트엔드는 **React**, 백엔드는 **Node.js / Express**, 데이터베이스는 **MySQL**로 구성됩니다. 프런트엔드와 API 서버는 별도 프로세스로 실행합니다. Flask나 Python으로 메인 서버를 실행하는 프로젝트가 아닙니다.

이 문서는 2026-09-28 기준 저장소 코드를 설명합니다. 구현된 기능과 운영 전 보완이 필요한 부분을 구분했으며, 접속 계정·비밀번호·실제 내부 서버 주소는 싣지 않았습니다.

## 목차

- [업무 기준과 주요 기능](#업무-기준과-주요-기능)
- [실행](#실행)
- [환경 변수와 DB 설정](#환경-변수와-db-설정)
- [애플리케이션 시작 흐름](#애플리케이션-시작-흐름)
- [주요 디렉터리 구조](#주요-디렉터리-구조)
- [화면과 URL](#화면과-url)
- [기능별 동작](#기능별-동작)
- [백엔드 API 구성](#백엔드-api-구성)
- [데이터베이스와 초기화](#데이터베이스와-초기화)
- [테스트와 빌드](#테스트와-빌드)
- [설정·운영 데이터·생성 파일](#설정운영-데이터생성-파일)
- [운영 및 보안 주의사항](#운영-및-보안-주의사항)
- [개발 시 변경 위치](#개발-시-변경-위치)
- [문제 해결](#문제-해결)

## 업무 기준과 주요 기능

이 시스템은 제조업의 생산·매출 분석이 아니라, 유지관리 업무에서 사용하는 잡자재의 구매와 사용을 관리합니다.

- **입고 금액**: 예산 사용 현황에서 구매 집행액으로 취급합니다.
- **출고 금액**: 보유 자재가 현장 업무에 사용된 실적입니다. 예산 잔액에서 다시 차감하지 않습니다.
- **잔여 예산**: 연간예산에서 해당 연도 집계 기간의 입고·구매 누계를 뺀 금액입니다.
- **사용률**: 입고·구매 누계 / 연간예산 × 100입니다.
- 입고액과 출고액의 차이인 순유입액은 주요 통계 지표로 사용하지 않습니다.
- 예산 0원, 예산 미등록, 조회 실패는 서로 다른 상태로 표시합니다. 예산 초과를 0원 잔액으로 숨기지 않습니다.

| 기능 | 내용 |
| --- | --- |
| 메인 | 내 정보, 달력, 할 일, 게시글, 결재 문서와 로그인 사업소의 파트별 예산 그래프 |
| 대시보드 | 사업소·연도·부서·집계 기간별 입출고, 전년 비교, 예산 사용률과 잔여 예산 |
| 자재관리 | 자재 목록, CSV·Excel 초기 등록, 수동 입고, 출고, 내역 수정·삭제·분할 |
| 수불명세서 | 월간·전파트 월간·연간 보고서, Excel 내보내기와 인쇄 |
| 전자결재 | 월간보고서 기안, 임시저장, 상신, 결재, 회람과 열람 상태 |
| 예산 | 연도별 사업소·부서 예산 등록·수정, 합계와 사업소별 배분 |
| 게시판 | 글 작성·수정·삭제, 공지, 댓글·반응, 이미지·동영상 |
| 계정·관리자 | 비밀번호 변경, 사용자·게시글·공지·팝업·승인자 관리 |

### 사업소와 부서 표기

| 코드 | 사업소 |
| --- | --- |
| `GK` | GK사업소 |
| `CM` | 천마사업소 |
| `ES` | 을숙도사업소 |
| `KN` | 강남사업소 |
| `SW` | 수원사업소 |

부서 키는 **`ITS`, `시설`, `기전`**입니다. 전기 관련 파트도 현재 데이터 구조에서는 `기전`으로 연결되므로 표시 문구와 DB 키를 임의로 바꾸지 않습니다.

화면의 사업소 선택값·상태·표시명은 위 표의 **전체 사업소 이름**으로 통일합니다. 계정용 선택 항목에는 `본사`도 포함합니다. 사업소를 나타내는 변수는 `businessLocation` 또는 `selectedBusinessLocation`, ITS·시설·기전 파트는 `department`로 구분합니다.

공통 목록과 변환은 [businessLocation.js](src/utils/businessLocation.js)에서 관리합니다.
- `businessLocations`, `accountLocations`: 화면용 선택 목록
- `normalizeLocation()`, `normalizeUserLocation()`: 기존 코드·별칭과 로그인 정보의 화면용 이름 정규화
- `toApprovalLocation()`: 전자결재 API의 기존 코드로 변환
- `reportLocation()`: 보고서·수동 입고 API용 값으로 변환 (GK만 코드, 나머지는 이름)
- `importLocation()`: 최초 업로드와 자재 선택 API의 기존 값으로 변환 (GK·CM·ES 코드)
- `legacyUserLocation()`: 사용자 정보 기반 API의 기존 테이블 키 유지. 화면용 이름과 별도로 보관하며 사용자에게 표시하지 않습니다.

DB 테이블명·저장값·서버 코드·문서번호는 변경하지 않습니다. API별 기존 사업소 값이 다르므로 화면 이름을 그대로 요청하거나 모든 요청을 같은 코드로 변환하지 않습니다. 특히 자재목록의 로그인 초기 조회와 선택 메뉴 변경은 기존 테이블 선택 방식을 유지합니다. 서버 정규화는 [statementApprovalService.js](server/services/statementApprovalService.js)를 참고합니다.

## 실행

### 사전 준비

1. Node.js와 npm, 접속 가능한 MySQL을 준비합니다.
2. 프로젝트 루트와 `server/`의 의존성을 각각 설치합니다.
3. 환경 변수와 DB 연결 설정을 확인합니다.
4. 기존 스키마를 준비하거나 승인된 개발용 DB 백업을 복원합니다. 빈 DB에서 서버만 실행하면 모든 기능이 초기화되는 구조는 아닙니다.

저장소에 Node.js 버전을 고정하는 `engines` 설정은 없습니다. 팀에서 검증한 런타임을 사용하고, 버전 변경 시 설치·빌드·테스트를 확인합니다. 서버 테스트는 `node:test`, 내장 `fetch` 등을 사용하므로 Node.js 18 이상의 API가 필요합니다.

프로젝트 루트에서 설치합니다.

```powershell
npm ci
npm --prefix server ci
```

`npm ci`는 각 디렉터리의 `package-lock.json`을 기준으로 설치합니다. 프런트엔드와 백엔드 의존성을 하나의 패키지로 합쳐 설치하지 않습니다.

### 개발 서버 실행

터미널 1: **프로젝트 루트에서** 백엔드를 실행합니다.

```powershell
node server/server.js
```

터미널 2: **프로젝트 루트에서** 프런트엔드를 실행합니다.

```powershell
npm start
```

| 구분 | 기본 주소 | 설명 |
| --- | --- | --- |
| React 개발 서버 | `http://localhost:3000` | 사용자가 접속하는 웹 화면 |
| Express API | `http://127.0.0.1:5000` | 로컬 API 접속 주소 |
| Express 수신 주소 | `0.0.0.0:5000` | 모든 네트워크 인터페이스에서 요청 수신 |

백엔드 포트 `5000`은 현재 [server.js](server/server.js)에 고정되어 있습니다. `PORT` 환경 변수로 백엔드 포트가 변경되는 구조는 아닙니다.

`server/package.json`에는 실행용 `start` 스크립트가 없고 `main` 값도 실제 서버 진입점과 다릅니다. `npm start`를 `server/`에서 실행하거나 `node index.js`를 사용하지 말고 위 명령을 사용합니다. 백엔드는 자동 재시작 도구가 연결되어 있지 않아 서버 코드 변경 후 재시작해야 합니다.

## 환경 변수와 DB 설정

### 환경 변수

프런트엔드는 루트 `.env`의 `REACT_APP_API_URL`을 사용합니다. 백엔드는 `dotenv.config()`를 호출하므로 **실행 작업 디렉터리의 `.env`**를 읽습니다. 위 실행 예시처럼 루트에서 서버를 시작하면 루트 `.env`를 읽습니다.

아래는 로컬 개발용 형식 예시이며, 실제 비밀키가 아닙니다.

```dotenv
REACT_APP_API_URL=http://127.0.0.1:5000
API_BASE_URL=http://127.0.0.1:5000
JWT_SECRET=replace-with-a-long-random-secret
```

| 이름 | 사용 위치 | 역할 |
| --- | --- | --- |
| `REACT_APP_API_URL` | 프런트엔드 API 호출, 서버 미디어 URL 생성 | 브라우저에서 접근 가능한 API 기본 주소 |
| `API_BASE_URL` | 서버 이미지·동영상 업로드 | `REACT_APP_API_URL`이 없을 때 미디어 URL 생성에 사용 |
| `JWT_SECRET` | 로그인·인증 미들웨어 | JWT 서명과 검증 |

- 다른 PC에서 접속할 때 `127.0.0.1`은 그 PC 자신을 가리킵니다. API 주소는 실제로 접근 가능한 서버 주소로 지정합니다.
- `.env` 변경 후 개발 서버를 재시작합니다. 운영 프런트엔드의 `REACT_APP_*` 값은 빌드에 포함되므로 재빌드해야 합니다.
- `REACT_APP_*`에는 비밀번호나 비밀키를 넣지 않습니다. 프런트엔드 번들에서 확인할 수 있는 값입니다.
- `server/package.json`의 `proxy` 값은 루트 React 개발 서버의 프록시 설정이 아닙니다. 이것만으로 `/api` 요청이 전달된다고 가정하지 않습니다.

### DB 연결 설정

현재 DB 연결은 다음 경로에 나뉘어 있습니다.

| 파일 | 역할 |
| --- | --- |
| [server/db.js](server/db.js) | `mysql2/promise` 연결 풀, 직접 SQL을 사용하는 라우트·서비스 |
| [server/db2.js](server/db2.js) | 별도 Sequelize 연결, 게시판 등 기존 모듈 |
| [server/config/database.js](server/config/database.js) | 공용 Sequelize의 접속 설정 |
| [server/db/sequelize.js](server/db/sequelize.js) | 위 설정으로 Sequelize 생성 및 연결 확인 |

현재 코드의 DB 이름은 `Koinfra_mat`이며, DB 접속값 일부가 소스에 직접 들어 있습니다. **`DB_HOST`, `DB_USER`, `DB_PASSWORD` 같은 환경 변수를 추가하는 것만으로 현재 연결 코드가 바뀌지는 않습니다.** 개발 환경 준비 시 세 설정 경로의 연결 대상을 함께 확인하고, 운영 배포 전에는 비밀정보를 환경 변수나 별도 비밀 저장소로 옮겨야 합니다. 실제 접속값은 README에 추가하지 않습니다.

## 애플리케이션 시작 흐름

```text
브라우저
  -> src/index.js
     -> src/App.js
        -> src/Router.js
           -> PrivateRoute: JWT 존재·만료·관리자 등급 확인
           -> page/: 화면별 진입 컴포넌트
              -> layout/: 공통 레이아웃
              -> component/: 업무 화면과 API 호출
                 -> REACT_APP_API_URL + /api/...

node server/server.js
  -> dotenv: 작업 디렉터리의 .env 로드
  -> Express 앱 생성
  -> CORS, JSON·폼 파서, 일부 요청 타임아웃 설정
  -> routes/: 기능별 API 등록
     -> middleware/: JWT 인증
     -> services/: 업무 규칙·직접 SQL
     -> models/: Sequelize 모델
     -> db.js / db2.js / db/sequelize.js
        -> MySQL
  -> 0.0.0.0:5000 수신 시작
```

Express는 현재 React의 `build/`를 정적 서비스하지 않습니다. React 개발 서버 또는 운영용 정적 웹 서버와 별도로 실행해야 합니다. 시작 시 DB 연결 로그가 출력되더라도 모든 테이블과 기능이 준비되었다는 의미는 아닙니다.

## 주요 디렉터리 구조

아래는 주요 소스 경로입니다. 의존성 내부 파일과 개별 업로드 파일은 생략했습니다.

```text
product_Manage/
├─ README.md
├─ package.json / package-lock.json   # 프런트엔드 의존성·명령
├─ .env                              # 로컬 환경 변수, Git 제외
├─ tailwind.config.js
├─ public/                           # HTML 등 공개 정적 파일
├─ src/
│  ├─ index.js / App.js / Router.js   # React 진입점·라우팅
│  ├─ page/                          # URL별 페이지 조합
│  ├─ layout/                        # Header, Side_Bar, Footer, WorkspaceLayout
│  ├─ image/                         # 화면용 이미지
│  └─ component/
│     ├─ Portal/                     # 메인 개인 포털
│     ├─ Statistics/                 # 그래프·통계 집계·조회 훅·테스트
│     ├─ Budget/                     # 예산 편집 모델·검증 테스트
│     ├─ Approval/                   # 전자결재 문서함·기안·월간보고서
│     ├─ Admin/                      # 관리자 화면
│     ├─ Post/                       # 게시글 목록·본문·작성
│     ├─ Excel/                      # 업로드 및 보고서 Excel 출력
│     ├─ Selector/                   # 기간·사업소 등의 선택 UI
│     ├─ input_manual/               # 수동 입고 입력
│     ├─ input_modify/               # 입고 조회·수정
│     ├─ output_modify/              # 출고 수정·분할
│     └─ *.js                        # 자재·입출고·수불명세서 등
├─ server/
│  ├─ server.js                      # Express 실행 진입점
│  ├─ package.json / package-lock.json
│  ├─ db.js / db2.js                 # 기존 DB 연결
│  ├─ config/database.js
│  ├─ db/sequelize.js
│  ├─ middleware/authMiddleware.js
│  ├─ routes/                        # 기능별 API
│  ├─ services/                      # 자재·예산 검증·결재 업무 규칙
│  ├─ models/                        # 자재·입출고·예측 Sequelize 모델
│  ├─ tests/                         # Node 내장 테스트 러너 기반 테스트
│  ├─ scripts/                       # 예측 테이블 생성·진단 도구
│  ├─ python/generate_predictions.py # 선택적 예측 배치
│  └─ uploads/                       # 게시판 이미지·동영상 실제 파일
├─ build/                            # 프런트엔드 빌드 결과
├─ node_modules/                     # 프런트엔드 의존성
└─ *.js / *.txt                      # 기존 DB 진단·재현 스크립트와 결과
```

## 화면과 URL

실제 라우팅 기준은 [src/Router.js](src/Router.js)입니다. 경로의 대소문자와 기존 이름을 문서 임의로 변경하지 않습니다.

| URL | 화면 | 접근 기준 |
| --- | --- | --- |
| `/Login_page` | 로그인 | 공개 |
| `/` | 메인 개인 포털 | 로그인 |
| `/dashboard` | 상세 통계 대시보드 | 로그인 |
| `/Mat_list_page` | 자재 목록 | 로그인 |
| `/upload` | CSV·Excel 자재 초기 등록 | 로그인 |
| `/Input_manual_page` | 수동 입고 | 로그인 |
| `/input_mod` | 입고 내역 조회·수정 | 로그인 |
| `/Mat_output_page` | 출고 등록 | 로그인 |
| `/Output_Mod` | 출고 내역 조회·수정 | 로그인 |
| `/input_statistics`, `/statistics/input` | 입고 통계 | 로그인 |
| `/Output_Statistics_page`, `/statistics/output` | 출고 통계 | 로그인 |
| `/Statement_page` | 자재수불명세서 | 로그인 |
| `/statement-approvals` | 전자결재 | 로그인 |
| `/PostList_page` | 게시판 | 로그인 |
| `/WritePost`, `/posts/:id/edit` | 글 작성·수정 | 로그인 |
| `/posts/:id` | 글 상세 | 로그인 |
| `/mypage` | 마이페이지 | 로그인 |
| `/Budget` | 예산 관리 | 관리자 등급 1 이상 |
| `/admin` | 관리자 | 관리자 등급 1 이상 |
| `/predictions` | `/dashboard`로 이동 | 예측 화면은 현재 비노출 |

화면 보호는 API 권한 검사를 대신하지 않습니다. 백엔드 인증 상태는 [운영 및 보안 주의사항](#운영-및-보안-주의사항)을 참고합니다.

## 기능별 동작

### 메인과 대시보드

두 화면은 서로 분리되어 있습니다.

- 메인의 [PersonalPortal.js](src/component/Portal/PersonalPortal.js)는 내 정보, 달력, 할 일, 최근 글·내 글, 결재 문서, 팝업 공지와 업무 바로가기를 구성합니다.
- [InventorySummary.js](src/component/Statistics/InventorySummary.js)는 **로그인한 사업소의 ITS·시설·기전 세 파트만** 도넛형 원그래프로 표시합니다. 전체 사업소를 나열하지 않습니다.
- 각 파트별 연간예산, 올해 1월부터 당월까지의 누적 구매액, 잔여 금액과 비율을 표시합니다. 당월 데이터는 집계 중입니다.
- 대시보드는 사업소·연도·부서·종료월 필터, 월별 입출고, 전년 동기간 비교, 누적 보기, 부서별 실적과 예산 표를 제공합니다.
- 대시보드의 초기 집계 종료월은 직전 완료 월입니다. 1월에는 전년도 12월로 시작합니다. 따라서 당월을 포함하는 메인과 기본 잔액이 다를 수 있습니다.
- `/dashboard?site=GK사업소`처럼 전체 이름을 URL 인코딩하여 상세 링크를 만듭니다. 기존 `/dashboard?site=GK` 링크도 계속 지원합니다.

### 입고·출고와 파일 등록

Excel·CSV 파서는 [ExcelUpload.js](src/component/Excel/ExcelUpload.js), 저장 API는 [upload.js](server/routes/upload.js)에 있습니다.

1. 기존 자재대장 형식의 파일을 읽습니다. Excel은 첫 번째 시트를 사용합니다.
2. `자재코드` 헤더와 지정된 열 위치에서 품명·규격·단가·이월·월별 입출고 수량 등을 추출합니다.
3. 파일명과 상단 내용에서 기준 연도를 감지하고, 사용자가 확인한 연도와 데이터를 서버로 전송합니다.
4. 서버는 사업소·부서별 자재·입고·출고 테이블을 생성하고 데이터를 등록합니다.

범용 CSV 자동 매핑 도구가 아니므로 열 순서를 바꾼 파일은 그대로 사용할 수 없습니다. 기준 연도는 2000~2100 범위로 검증합니다. 기존 입고 테이블이 있으면 초기 업로드를 거부하므로, 매월 파일을 반복 누적하는 용도로 사용하지 않습니다. 추가 입고는 수동 입고 등 해당 업무 경로를 사용합니다.

출고 수정에는 일괄 수정·분할 처리 경로가 있습니다. 수량, 자재 식별자와 기간 잠금이 연관되므로 내역 수정 후 자재 목록·수불명세서의 합계를 함께 확인합니다.

### 예산 관리

[Budget.js](src/page/Budget.js)에서 연도 하나를 선택하고 사업소 × 부서 표의 금액을 편집합니다.

- 변경한 칸만 저장하며, 신규 등록과 기존 예산 수정을 같은 표에서 처리합니다.
- 금액은 0 이상의 안전한 정수로 검증합니다. 기존 예산을 빈칸으로 삭제하는 대신 0원으로 수정할 수 있습니다.
- 예산 저장 API는 JWT와 관리자 등급을 확인합니다.
- 클라이언트는 기존 금액인 `expectedAmount`를 보내며, 서버는 현재 금액이 달라졌다면 저장 충돌을 반환합니다.
- 저장은 트랜잭션으로 처리합니다. 다른 연도의 조회 결과를 한꺼번에 다시 저장하지 않습니다.
- `var_budget_amount`는 현재 저장 시 `budget_amount`와 같은 값으로 기록됩니다. 남은 예산의 저장 컬럼으로 해석하지 않습니다. 화면 잔여 예산은 구매 누계로 계산합니다.

### 자재수불명세서와 전자결재

수불명세서는 [Statement.js](src/component/Statement.js), 연간 보고서는 [YearlyStatement.js](src/component/YearlyStatement.js)가 담당합니다. Excel 출력 코드는 `src/component/Excel/`에 있습니다.

전자결재 흐름은 다음과 같습니다.

```text
관리자: 사업소·부서별 승인자 지정
  -> 기안작성: 자재관리 > 자재수불명세서 월간보고서
  -> 보고 연월·부서, 제목·내용·회람자 선택
  -> 자재수불 내역과 예산집행 현황 자동 표시
  -> 임시저장 또는 상신
  -> 지정 결재자의 승인
  -> 완결문서·회람문서에서 확인
```

- 양식 선택의 공통양식은 제거되어 있습니다. 현재 제공하는 기안 양식은 자재수불명세서 월간보고서입니다.
- 문서함은 대문, 미결, 회람, 진행, 부서진행, 완결, 임시저장으로 구분됩니다.
- 승인자 미지정 또는 같은 사업소·부서·월의 기존 상신 문서가 있으면 상신이 제한됩니다.
- 승인 완료 시 해당 사업소·부서의 **승인 월 포함 이전 입출고 기간**에 잠금 규칙을 적용합니다. 관련 로직은 `assertPeriodUnlocked()`를 확인합니다.
- 회람자의 열람 상태를 기록합니다.
- `?compose=1`, `?folder=pending`, `?folder=circulation`, `?document=<id>` 등의 진입 링크를 사용합니다.
- 보고서 화면은 사업소·부서·연월로 현재 통계 API를 다시 조회합니다. 승인 당시 보고서를 PDF나 불변 스냅샷으로 보관하는 기능과는 다릅니다.

### 게시판·계정·관리자

- 게시판은 목록·본문·작성·수정, 공지, 댓글과 반응을 제공합니다. 본문 렌더링은 [PostContent.js](src/component/Post/PostContent.js)에서 처리합니다.
- 이미지와 동영상 업로드는 각각 최대 20MB, 200MB로 설정되어 있습니다. API의 파일 형식 검사도 적용됩니다.
- 마이페이지의 비밀번호 변경은 인증된 사용자 ID를 기준으로 처리합니다.
- 관리자 화면은 사용자, 게시글, 공지, 팝업과 결재 승인자 설정을 관리합니다.
- 메인의 할 일과 팝업의 오늘 보지 않기는 브라우저 `localStorage`에 저장합니다. 다른 PC와 자동 동기화되지 않습니다.

### 예측 기능의 현재 상태

예측 UI 코드는 남아 있지만 메뉴에서 숨겨져 있고 `/predictions`는 대시보드로 이동합니다. **화면 비노출과 API 비활성화는 다릅니다.** `/api/predictions`는 서버에 등록되어 있습니다.

`server/python/generate_predictions.py`는 최근 이력의 가중 평균 등을 이용하는 선택적 예측 배치입니다. 메인 서비스 실행에 Python이 필요하지는 않습니다. 다음 명령은 DB 테이블 생성 또는 예측 결과 저장을 수행하므로 승인된 개발 환경에서만 실행합니다.

```powershell
# 프로젝트 루트에서 실행. 테이블 생성 및 예측 결과 저장 작업입니다.
npm --prefix server run db:create-prediction-tables
npm --prefix server run predict:baseline -- --api-base-url http://127.0.0.1:5000 --sites GK --departments ITS
```

추가 인자는 `--months-back`, `--sites`, `--departments`입니다. Python 배치 자체는 표준 라이브러리를 사용하며 Express API가 먼저 실행되어 있어야 합니다.

## 백엔드 API 구성

정확한 메서드·요청 필드는 각 라우트 파일을 기준으로 합니다. 아래는 `server/server.js`에 등록된 주요 API 묶음입니다.

| API 경로 | 담당 파일 | 역할 |
| --- | --- | --- |
| `/api/login`, `/api/register` | `login.js`, `register.js` | 계정 로그인·등록 |
| `/api/user` | `user.js` | 내 활동, 비밀번호 변경 |
| `/api/upload` | `upload.js` | 초기 자재대장 등록 |
| `/api/materials` | `material.js`, `product_list_edit.js` | 자재 조회·수정 |
| `/api/materials/input` | `input.js` | 입고, 수동 등록과 내역 수정 |
| `/api/materials/output` | `output.js` | 출고, 수정·삭제·분할 |
| `/api/statistics/input` | `inputStatistics.js` | 입고 통계 |
| `/api/statistics/output` | `output_statistics.js` | 출고 통계 |
| `/api/statement` | `statement.js` | 월간 수불, 전파트 월간, 월별 추이 |
| `/api/yearlyStatement` | `yearlyStatement.js` | 연간 수불 보고서 |
| `/api/statement/approval` | `statementApproval.js` | 승인자, 상신·승인·결재 상태 |
| `/api/statement/approval/workspace` | `approvalWorkspace.js` | 문서함·임시저장·회람 |
| `/api/budget` | `budget.js` | 연도별 예산 조회·저장 |
| `/api/posts` | `post.js` 및 하위 라우트 | 글·댓글·반응 |
| `/api/image`, `/api/video` | `imageUpload.js`, `videoUpload.js` | 미디어 업로드·조회 |
| `/api/admin` | `admin.js` | 관리자, 활성 팝업 조회 |
| `/api/predictions` | `prediction.js` | 예측 결과·이력·사용량 |

통계 그래프는 `POST /api/statement/yearly-trend`로 월별 부서 입출고를 조회하고 `GET /api/budget?year=...`로 예산을 조회합니다. 예산 저장은 `POST /api/budget`입니다.

## 데이터베이스와 초기화

| 구분 | 주요 테이블·패턴 | 설명 |
| --- | --- | --- |
| 계정 | `users` | 사용자·소속·관리자 등급 |
| 사업소 자재 | `<사업소>_<부서>_product` | 사업소·부서별 자재 마스터 |
| 입출고 | `<사업소>_<부서>_input`, `_output` | 자재별 수량·날짜·비고 |
| 공통 자재 | `api_main_product` | 별도 공통 자재 등록·조회 경로 |
| 예산 | `budgets` | 사업소·부서·연도별 예산 |
| 결재 | `statement_approval_settings`, `statement_approval_documents` | 승인자와 월별 결재 문서 |
| 결재 작업공간 | `statement_approval_drafts`, `statement_approval_details`, `statement_approval_circulation` | 임시저장·본문·회람 |
| 게시판 미디어 | `post_image`, `post_video` | 업로드 파일 메타데이터 |
| 팝업 | `admin_popup` | 공지 팝업 |
| 예측 | `prediction_result` | 선택적 예측 결과 |

전체 DB를 재현하는 통합 마이그레이션이나 초기 계정 시드 명령은 제공하지 않습니다. 결재·팝업 등 일부 테이블은 요청 처리 과정에서 `CREATE TABLE IF NOT EXISTS`로 생성됩니다. 이것이 기존 테이블의 모든 컬럼을 자동 업그레이드한다는 뜻은 아닙니다.

- 초기 구축 시 승인된 스키마·백업을 준비하고 테이블, 인덱스와 계정을 확인합니다.
- `budgets`에는 사업소·부서·연도 조합의 유일성이 필요합니다. 기존 데이터에 중복이 없는지 확인합니다.
- 일부 모델은 테이블명을 소문자로 만들고, 기존 SQL은 전달된 사업소명을 사용합니다. Windows와 Linux의 MySQL 테이블명 대소문자 차이에 주의합니다.
- 초기 자재 업로드와 결재 테이블 생성 등에는 DDL 권한이 필요할 수 있습니다. 모든 운영 계정에 무조건 높은 권한을 부여하지 말고 초기화 작업과 일반 운영 권한을 구분합니다.
- 수불·통계·예측은 여러 데이터 경로를 사용하므로 한 테이블만 바꿔도 모든 화면에 같은 방식으로 반영된다고 가정하지 않습니다.

## 테스트와 빌드

### 프런트엔드 테스트

프로젝트 루트에서 실행합니다.

```powershell
npm test -- --watchAll=false --runInBand
```

주요 테스트는 예산 입력 모델, 통계 계산, 메인 파트별 예산 표시, 전자결재 보고서에 있습니다. 필요한 파일만 실행할 수도 있습니다.

```powershell
npm test -- --watchAll=false --runInBand --runTestsByPath src/component/Statistics/InventorySummary.test.js src/component/Statistics/statisticsModel.test.js
```

### 백엔드 테스트

`server/package.json`의 `npm test`는 아직 기본 실패 스크립트입니다. 루트에서 Node 테스트 러너를 직접 사용합니다.

```powershell
node --test server/tests/budget.test.js server/tests/approvalWorkspace.test.js server/tests/portalRoutes.test.js
```

이 테스트들은 DB 연결을 대체한 검증으로, 예산 저장·권한·충돌, 기안·회람, 계정·게시판·팝업 동작을 검사합니다. 실제 MySQL 스키마·운영 계정·파일 업로드까지 검증하는 통합 테스트는 아닙니다.

### 프런트엔드 빌드

```powershell
npm run build
```

결과는 기본적으로 `build/`에 생성됩니다. 현재 CRA 관련 의존성, 사용하지 않는 변수, 기존 컴포넌트 명명 등에 따른 경고가 나타날 수 있습니다. 경고 없는 빌드라고 가정하지 말고 실패 여부와 경고 내용을 확인합니다.

운영에서는 별도 정적 서버로 `build/`를 제공하고, React Router의 직접 URL 접근이 `index.html`로 돌아가도록 SPA fallback을 설정합니다. API와 미디어 요청은 Express로 전달합니다. 역방향 프록시의 업로드 크기·타임아웃도 Express 설정과 함께 검토합니다. 저장소에는 완성된 운영 배포 자동화나 프런트·백엔드 통합 실행 명령이 없습니다.

## 설정·운영 데이터·생성 파일

| 경로·저장소 | 성격 | 관리 기준 |
| --- | --- | --- |
| `.env` | 환경 설정·비밀정보 | Git 제외, 공유 시 값 제거 |
| MySQL 데이터 | 업무 원장 | 스키마와 데이터 백업, 복구 검증 |
| `server/uploads/` | 실제 첨부파일 | DB 미디어 메타데이터와 함께 백업 |
| 브라우저 `localStorage` | JWT, 할 일, 팝업 숨김 | 브라우저·사용자 환경별 로컬 상태 |
| `build/` | 생성된 프런트엔드 | 소스가 아닌 재생성 가능한 결과물 |
| `node_modules/`, `server/node_modules/` | 설치된 의존성 | lockfile 기준 재설치 |
| `schema.txt`, `sample_row.txt`, `inspect_output.txt`, `test_output.txt` | 진단 결과 | 운영 데이터 포함 여부 확인 후 공유 |
| 루트 진단 `.js`, `server/scripts/` | DB·API 점검 스크립트 | 연결 대상과 쓰기 동작 확인 후 실행 |

루트의 `inspect_table.js`, `schema_dumper.js`, `reproduce_issue.js`, `test_integration.js` 등은 표준 테스트 명령과 별개인 기존 진단 도구입니다. 이름에 `test`가 있다고 해서 격리된 테스트 DB만 사용한다고 가정하지 않습니다.

현재 `.gitignore`는 `node_modules`, `.env`, 일부 동영상 확장자만 제외합니다. `build/`, 이미지 업로드, 진단 출력물이 자동으로 모두 제외되는 것은 아니므로 커밋 전에 변경 목록을 검토합니다.

## 운영 및 보안 주의사항

아래는 코드에서 확인되는 **현재 제약 및 보완 과제**입니다. README 작성으로 해결된 사항이 아닙니다.

1. **비밀정보 관리**: DB 접속값 일부가 소스에 들어 있습니다. 환경 변수로 이동하고 노출 가능성이 있는 자격증명은 교체해야 합니다.
2. **비밀번호 처리**: 현재 로그인은 평문 문자열 비교를 사용합니다. `bcrypt` 의존성이 있어도 전체 인증 흐름에 해시가 적용된 상태가 아닙니다. 계정 생성·로그인·변경·관리자 수정 경로와 기존 데이터를 함께 이전해야 합니다.
3. **민감한 로그**: 로그인 라우트에 요청 본문을 출력하는 디버그 로그가 있습니다. 운영 전 제거하고 기존 로그에 비밀번호가 포함되었는지 점검해야 합니다.
4. **JWT**: 발급 유효기간은 현재 24시간이며 `localStorage`에 보관합니다. `JWT_SECRET` 미설정 시 코드의 기본값을 사용하므로 운영에서는 반드시 별도 비밀키를 설정합니다. 계정 권한 변경 후 기존 토큰에 이전 정보가 남을 수 있습니다.
5. **API 인증 범위**: 관리자·결재·예산 저장 등에는 인증이 있지만, 모든 자재·입출고·통계·미디어 API에 동일하게 적용된 것은 아닙니다. 프런트엔드 `PrivateRoute`만으로 API가 보호되지는 않습니다.
6. **예측 비공개 범위**: 현재 예측 기능은 화면에서 숨긴 상태입니다. 실제 접근 차단이 필요하면 백엔드 라우트와 권한도 별도로 제한해야 합니다.
7. **네트워크**: 서버는 모든 인터페이스에서 수신하고 `cors()`를 제한 없이 사용합니다. 외부 공개 전 인증, 허용 출처, HTTPS, 방화벽과 업로드 정책을 검토해야 합니다.
8. **변경 이력과 원본 보존**: 보고서 재조회와 결재 기간 잠금은 완전한 감사 로그·불변 문서 보관을 대체하지 않습니다. 직접 DB 수정과 관리자 운영 절차까지 별도로 관리해야 합니다.

운영 DB 연결 상태에서 업로드·수정·삭제·상신·승인·예측 배치를 시험하지 않습니다. 개발용 DB와 테스트 계정을 분리하고 변경 전 백업합니다.

## 개발 시 변경 위치

| 변경 대상 | 우선 확인할 파일·디렉터리 |
| --- | --- |
| URL·접근 화면 | `src/Router.js`, `src/component/PrivateRoute.js` |
| 공통 UI | `src/layout/WorkspaceLayout.*`, `Header.*`, `Side_Bar.*`, `Footer.*` |
| 메인 구성 | `src/component/Portal/PersonalPortal.*` |
| 파트별 예산 원그래프 | `src/component/Statistics/InventorySummary.js`, `Statistics.css` |
| 대시보드·집계 기준 | `src/component/Dashboard.js`, `Statistics/statisticsModel.js`, `useInventoryTrend.js` |
| 예산 편집·저장 | `src/page/Budget.*`, `component/Budget/`, `server/routes/budget.js`, `services/budgetValidation.js` |
| 기안·회람·보고서 | `src/component/Approval/`, `server/routes/approvalWorkspace.js`, `services/approvalWorkspaceService.js` |
| 승인·기간 잠금 | `server/routes/statementApproval.js`, `services/statementApprovalService.js` |
| 입고 파일 열 매핑 | `src/component/Excel/ExcelUpload.js`, `server/routes/upload.js` |
| 게시판 본문·미디어 | `src/component/Post/`, `server/routes/post*.js`, 이미지·동영상 라우트 |
| 관리자 | `src/component/Admin/AdminConsole.js`, `server/routes/admin.js` |

동일 기능의 예전 컴포넌트가 일부 남아 있습니다. 이름이 비슷하다고 바로 수정하지 말고 `Router.js`에서 실제 페이지와 import 경로를 따라가 활성 구현을 확인합니다. 새 공용 UI는 기존 Workspace 스타일을 따르고, 금액 계산은 화면마다 다른 기준으로 복제하지 않습니다.

## 문제 해결

| 증상 | 확인할 내용 |
| --- | --- |
| 프런트는 열리지만 데이터가 안 나옴 | Express 실행 여부, `REACT_APP_API_URL`, 브라우저 Network 탭, 방화벽, DB 연결 |
| 환경 변수를 바꿔도 이전 서버에 접속 | 개발 서버 재시작 또는 운영 프런트 재빌드 |
| `server/`에서 실행 시 인증·URL 설정이 달라짐 | `dotenv`가 읽는 작업 디렉터리의 `.env` 확인, 루트 실행 권장 |
| 예산이 미등록으로 표시 | 선택 연도·사업소 이름·부서 키, 실제 예산 등록 여부 확인. 조회 실패와 구분 |
| 메인과 대시보드의 잔여 예산이 다름 | 메인은 당월 포함, 대시보드는 기본 직전 완료 월. 같은 사업소·부서·종료월로 비교 |
| 메인에 다른 사업소 자료가 보임 | 로그인 JWT의 `business_location`, 사업소 정규화, 재로그인 여부 확인 |
| 보고서 상신 버튼이 비활성 | 지정 승인자, 기존 같은 월 문서, 메타데이터 조회 오류 확인 |
| 이전 입출고를 수정할 수 없음 | 해당 사업소·부서의 최신 승인 완료 월과 기간 잠금 확인 |
| 최초 업로드가 이미 등록되었다고 나옴 | 해당 사업소·부서의 입고 테이블 존재 여부 확인. 재시도 목적으로 운영 테이블을 삭제하지 않음 |
| 이미지·동영상 URL이 다른 PC에서 깨짐 | API 공개 주소, 파일 실재 여부, 프록시 경로·크기 제한 확인 |
| 새로고침 시 특정 화면이 404 | 운영 정적 서버의 React Router SPA fallback 확인 |
| 다른 PC에서 할 일이나 팝업 숨김이 유지되지 않음 | 해당 정보는 현재 브라우저 `localStorage` 저장 방식 |

기능이나 운영 구성이 변경되면 README의 실행 명령, URL, 예산 기준과 보안 주의사항도 함께 갱신합니다.

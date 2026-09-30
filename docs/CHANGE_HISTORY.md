# 개발 변경 이력

master 브랜치의 커밋과 현재 소스를 기준으로 기능이 바뀐 흐름을 정리했습니다. 아래 날짜는 커밋 날짜이며 작업 시작일이나 배포일은 아닙니다. 실제 운영 성과나 사용자 반응은 저장소에서 확인할 수 없어 적지 않았습니다. 파일의 현재 역할은 [주요 파일 안내](FILE_GUIDE.md)를 참고하세요.

## 2026년 1월: 자재수불명세서와 기초 업무 흐름

| 커밋 | 변경 내용 | 주요 파일 |
| --- | --- | --- |
| [69c9cb7](https://github.com/kimchanu/product_Manage/commit/69c9cb7) | React 화면, Express API, 자재·입출고·게시판·계정 관련 기존 작업물을 초기 저장소에 등록. 각 기능의 최초 개발 시점으로 해석하지 않습니다. | src/Router.js, server/server.js |
| [8efd2d0](https://github.com/kimchanu/product_Manage/commit/8efd2d0), [ce806bf](https://github.com/kimchanu/product_Manage/commit/ce806bf) | 월간·연간 수불명세서의 인쇄 화면, 글꼴 강조, 로고와 공통 화면 요소 수정. | src/component/Statement.js, YearlyStatement.js |
| [ab6579e](https://github.com/kimchanu/product_Manage/commit/ab6579e), [6309fb5](https://github.com/kimchanu/product_Manage/commit/6309fb5) | 수동 입고의 공통 자재 저장 경로를 추가하고, 공통 자재가 입출고·통계·명세서에 반영되도록 관련 API를 보강. | server/routes/input.js, server/services/materialService.js, server/routes/statement.js |
| [53c93e5](https://github.com/kimchanu/product_Manage/commit/53c93e5), [b2b0e85](https://github.com/kimchanu/product_Manage/commit/b2b0e85), [ae70a3e](https://github.com/kimchanu/product_Manage/commit/ae70a3e), [710a043](https://github.com/kimchanu/product_Manage/commit/710a043) | 예산집행 표시와 전파트 월간·연간 보고서의 화면 및 조회 경로를 순차적으로 수정. | src/component/Statement.js, YearlyStatement.js, server/routes/yearlyStatement.js |

## 2026년 2~3월: 통계와 화면 사용성

| 커밋 | 변경 내용 | 주요 파일 |
| --- | --- | --- |
| [a63e2b7](https://github.com/kimchanu/product_Manage/commit/a63e2b7), [13b8807](https://github.com/kimchanu/product_Manage/commit/13b8807) | 대시보드 그래프와 화면 구성 수정. | src/component/Dashboard.js |
| [38bc71f](https://github.com/kimchanu/product_Manage/commit/38bc71f) | 수동 입고의 테이블 생성 경로와 사업소 매핑 수정. 초기 파일 업로드와 수동 입고는 서로 다른 저장 경로를 사용합니다. | server/routes/input.js, upload.js, src/component/input_manual/TableCreator.js |
| [cf2397f](https://github.com/kimchanu/product_Manage/commit/cf2397f) | 입출고 통계에서 다른 부서를 선택하여 조회할 수 있도록 화면 수정. | src/component/InputStatistics.js, Output_Statistics.js |
| [354674c](https://github.com/kimchanu/product_Manage/commit/354674c), [16809ea](https://github.com/kimchanu/product_Manage/commit/16809ea), [d1ddc0f](https://github.com/kimchanu/product_Manage/commit/d1ddc0f), [16445a6](https://github.com/kimchanu/product_Manage/commit/16445a6) | 헤더·사이드바, 업무 페이지 여백, 메인 화면의 구성과 스타일을 단계적으로 변경. | src/layout/, src/page/Main_page.js |
| [3acc9ba](https://github.com/kimchanu/product_Manage/commit/3acc9ba) | 대시보드와 입출고·명세서 집계 경로 추가 수정. | src/component/Dashboard.js, server/routes/statement.js |

## 2026년 4~6월: 재고 검증, 예측, 전자결재

| 커밋 | 변경 내용 | 주요 파일 |
| --- | --- | --- |
| [ec2ae7d](https://github.com/kimchanu/product_Manage/commit/ec2ae7d) | 출고일보다 늦은 입고를 해당 출고의 재고 근거로 삼지 않도록 서버 검증과 출고 화면 처리 수정. 과거 일자 내역 수정에도 수량과 날짜의 순서가 영향을 주는 문제를 다뤘습니다. | server/routes/output.js, server/services/materialService.js, src/component/Output_out.js |
| [71f30e8](https://github.com/kimchanu/product_Manage/commit/71f30e8), [e5f79cb](https://github.com/kimchanu/product_Manage/commit/e5f79cb) | 예측 모델·API·Python 배치·화면·진단 도구를 추가하고 계산 및 조회 경로 수정. 현재 화면 URL은 대시보드로 이동하지만 서버 API는 남아 있습니다. | server/routes/prediction.js, server/python/generate_predictions.py, src/component/PredictionCenter.js |
| [0d86d25](https://github.com/kimchanu/product_Manage/commit/0d86d25) | 월간 수불명세서 결재 라우트·서비스·화면과 승인자 설정 추가. 이전 출고 승인 경로를 제거하고 입출고 변경 시 승인 완료 기간 잠금 규칙을 연결. 같은 커밋에서 관리자·로그인·게시판 파일도 변경. | server/routes/statementApproval.js, server/services/statementApprovalService.js, src/component/Admin/AdminConsole.js |

## 2026년 9월: 업로드, 문서함, 예산, 사업소명

| 커밋 | 변경 내용 | 주요 파일 |
| --- | --- | --- |
| [ba70c67](https://github.com/kimchanu/product_Manage/commit/ba70c67) | 기존 자재대장의 Excel·CSV 읽기, 기준 연도 확인, 업로드 화면과 서버 저장 경로를 함께 수정. | src/component/Excel/ExcelUpload.js, src/page/Csv_Upload_page.js, server/routes/upload.js |
| [cfb2a14](https://github.com/kimchanu/product_Manage/commit/cfb2a14) | 결재 문서함·기안·보고서·회람, 예산 편집과 저장 충돌 검증, 메인 포털과 통계 코드 정리, 공통 화면 구성. 프런트엔드·서버 단위 테스트도 추가. | src/component/Approval/, server/routes/approvalWorkspace.js, src/page/Budget.js, server/routes/budget.js, src/component/Statistics/ |
| [dd3d955](https://github.com/kimchanu/product_Manage/commit/dd3d955) | 화면의 사업소명을 통일하고 기존 API·DB에 필요한 사업소 값 변환을 공통 유틸리티로 정리. 결재, 예산, 보고서, 통계, 사용자 정보 등 관련 화면을 함께 수정하고 변환 테스트 추가. | src/utils/businessLocation.js, businessLocation.test.js, src/component/Approval/approvalApi.js |

## 기록 기준

- 생성된 build/보다 같은 커밋의 src/와 server/ 원본 변경을 우선 확인합니다.
- 이력은 구현과 수정 내역입니다. 배포일·사용자 수·처리 속도 개선 효과를 뜻하지 않습니다.
- 다음 변경부터는 날짜와 커밋 링크, 변경 배경, 바뀐 동작, 관련 파일, 확인 방법을 함께 기록합니다.

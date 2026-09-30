# 주요 파일 안내

README가 실행 방법과 전체 기능을 설명한다면, 이 문서는 코드를 읽거나 수정할 때 어디부터 확인할지 안내합니다. 현재 master 브랜치 기준이며, 각 기능이 바뀐 시기는 [개발 변경 이력](CHANGE_HISTORY.md)의 커밋에서 확인할 수 있습니다.

요청 흐름: src/Router.js → src/page/ → src/component/ → server/server.js → server/routes/ → server/services/ 또는 server/models/ → MySQL. 화면에서만 값을 바꾸면 서버의 검증·집계는 바뀌지 않으므로 호출 경로를 함께 확인합니다.

## 화면 진입과 공통 UI

| 파일 | 역할 | 변경 시 함께 확인할 곳 |
| --- | --- | --- |
| [src/Router.js](../src/Router.js) | URL과 페이지 연결. 로그인·관리자 접근 경로와 예측 화면 이동을 정의. | 해당 src/page/ 파일과 src/component/PrivateRoute.js |
| [src/component/PrivateRoute.js](../src/component/PrivateRoute.js) | 브라우저의 토큰과 접근 조건으로 화면 진입 제어. | 백엔드 라우트의 인증 검사. 화면 보호만으로 API 권한이 생기지는 않음 |
| [src/layout/WorkspaceLayout.js](../src/layout/WorkspaceLayout.js), [Header.js](../src/layout/Header.js), [Side_Bar.js](../src/layout/Side_Bar.js) | 여러 업무 페이지가 사용하는 화면 틀과 메뉴. | 연결된 페이지와 CSS |
| [src/page/Main_page.js](../src/page/Main_page.js), [PersonalPortal.js](../src/component/Portal/PersonalPortal.js) | 로그인 후 메인 화면과 개인 정보·할 일·게시글·결재 요약 구성. | 사용자·게시판·결재 API |
| [src/utils/businessLocation.js](../src/utils/businessLocation.js) | 화면용 사업소 이름과 기존 API별 사업소 값 변환. | businessLocation.test.js, 요청 값과 DB 테이블 키 |

## 자재 등록, 입고, 출고

| 파일 | 역할 | 변경 시 함께 확인할 곳 |
| --- | --- | --- |
| [ExcelUpload.js](../src/component/Excel/ExcelUpload.js), [Csv_Upload_page.js](../src/page/Csv_Upload_page.js) | 기존 자재대장의 파일 읽기, 미리보기, 연도 확인과 초기 등록 요청. | [server/routes/upload.js](../server/routes/upload.js)의 열 해석·검증·테이블 생성 |
| [IntegratedInputForm.js](../src/component/input_manual/IntegratedInputForm.js), [useManualInputData.js](../src/component/input_manual/useManualInputData.js) | 수동 입고 입력과 자재 선택 데이터 처리. | [server/routes/input.js](../server/routes/input.js), 공통 자재와 사업소별 입고 테이블 |
| [src/component/input_modify/InputModify.js](../src/component/input_modify/InputModify.js) | 기존 입고 내역 조회·수정. | server/routes/input.js의 수정 처리와 결재 기간 잠금 |
| [Output_out.js](../src/component/Output_out.js), [Output_Modify.js](../src/component/Output_Modify.js) | 출고 등록, 내역 수정·삭제·분할 화면. | [server/routes/output.js](../server/routes/output.js)의 재고·날짜 검증과 output_modify/ 하위 파일 |
| [server/services/materialService.js](../server/services/materialService.js) | 여러 입출고 경로에서 공유하는 자재 식별·수량 계산. | input.js, output.js, 통계와 수불명세서 합계 |

초기 업로드와 반복 수동 입고는 서로 다른 저장 경로입니다. 최초 파일 등록이 이미 존재하는 테이블 때문에 거부될 수 있으므로 업로드 화면만 바꿔서 해결하지 않습니다.

## 통계, 예산, 보고서

| 파일 | 역할 | 변경 시 함께 확인할 곳 |
| --- | --- | --- |
| [Dashboard.js](../src/component/Dashboard.js), [statisticsModel.js](../src/component/Statistics/statisticsModel.js), [useInventoryTrend.js](../src/component/Statistics/useInventoryTrend.js) | 대시보드 화면, 금액·기간 계산, 조회 상태. | server/routes/statement.js, budget.js, statisticsModel.test.js |
| [InventorySummary.js](../src/component/Statistics/InventorySummary.js) | 메인 화면의 로그인 사업소 파트별 예산·구매 누계·잔여 금액. | 당월 포함 기준과 InventorySummary.test.js |
| [src/page/Budget.js](../src/page/Budget.js), [budgetModel.js](../src/component/Budget/budgetModel.js) | 연도별 사업소·부서 예산 편집과 입력 검증. | [server/routes/budget.js](../server/routes/budget.js), [budgetValidation.js](../server/services/budgetValidation.js), 예산 테스트 |
| [Statement.js](../src/component/Statement.js), [YearlyStatement.js](../src/component/YearlyStatement.js) | 월간·전파트·연간 수불명세서 화면. | server/routes/statement.js, yearlyStatement.js, src/component/Excel/ 출력 파일 |
| [inputStatistics.js](../server/routes/inputStatistics.js), [output_statistics.js](../server/routes/output_statistics.js) | 입고·출고 통계 API. | 사업소·부서 필터와 보고서·대시보드의 집계 기준 |

예산 집행액은 입고·구매 누계 기준입니다. 출고를 예산에서 다시 차감하지 않도록 관련 화면의 계산을 함께 확인합니다.

## 전자결재와 관리자

| 파일 | 역할 | 변경 시 함께 확인할 곳 |
| --- | --- | --- |
| [ApprovalWorkspace.js](../src/component/Approval/ApprovalWorkspace.js), [ApprovalComposer.js](../src/component/Approval/ApprovalComposer.js), [ApprovalReport.js](../src/component/Approval/ApprovalReport.js) | 문서함, 기안, 월간보고서 표시. | approvalApi.js, 보고서 테스트 |
| [approvalWorkspace.js](../server/routes/approvalWorkspace.js), [approvalWorkspaceService.js](../server/services/approvalWorkspaceService.js) | 임시저장·문서함·본문·회람 API와 규칙. | server/tests/approvalWorkspace.test.js |
| [statementApproval.js](../server/routes/statementApproval.js), [statementApprovalService.js](../server/services/statementApprovalService.js) | 승인자, 상신·승인 상태, 완료 월의 입출고 기간 잠금. | 입출고 변경 API에서 잠금 규칙을 호출하는지 확인 |
| [AdminConsole.js](../src/component/Admin/AdminConsole.js), [server/routes/admin.js](../server/routes/admin.js) | 사용자·게시글·공지·팝업·승인자 관리. | 관리자 권한 검사와 server/tests/portalRoutes.test.js |

결재 보고서는 화면에서 현재 통계를 다시 조회하는 경로가 있습니다. 승인 당시의 불변 파일을 저장하는 방식으로 해석하지 않습니다.

## 게시판, 인증, 선택 기능과 검증

| 파일 | 역할 | 변경 시 함께 확인할 곳 |
| --- | --- | --- |
| [PostList.js](../src/component/Post/PostList.js), [PostDetail.js](../src/component/Post/PostDetail.js), [WritePost.js](../src/component/Post/WritePost.js) | 글 목록·상세·작성·수정. | PostContent.js, server/routes/postRoutes.js, 댓글·반응 라우트 |
| [imageUpload.js](../server/routes/imageUpload.js), [videoUpload.js](../server/routes/videoUpload.js) | 게시판 이미지·동영상 업로드와 조회. | server/uploads/ 실제 파일과 DB 메타데이터, 크기·형식 제한 |
| [login.js](../server/routes/login.js), [register.js](../server/routes/register.js), [authMiddleware.js](../server/middleware/authMiddleware.js) | 로그인·가입과 JWT 검사. | src/component/Login.js, PrivateRoute.js 및 README의 보안 주의사항 |
| [prediction.js](../server/routes/prediction.js), [generate_predictions.py](../server/python/generate_predictions.py) | 예측 API와 선택적 배치. | 화면 비노출과 API 접근은 별개이며 배치는 DB에 기록 가능 |
| [server/server.js](../server/server.js), [server/db.js](../server/db.js), [server/db2.js](../server/db2.js) | Express 라우트 등록과 직접 SQL·Sequelize 연결. | 새 라우트의 권한, 요청 제한, 실제 DB 연결 대상 |
| src/**/*.test.js, server/tests/*.test.js | 사업소명, 예산, 통계, 결재, 포털 API의 단위 검증. | 기능 수정 시 테스트 입력과 기대값 |

생성된 build/보다 원본 소스를 먼저 검토합니다. 루트의 진단용 JS·TXT 파일은 일반 테스트와 다르므로 연결 대상과 데이터 쓰기 동작을 확인한 뒤 사용합니다.

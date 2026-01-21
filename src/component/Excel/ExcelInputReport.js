import React from "react";
import ExcelJS from "exceljs";

const ExcelInputReport = ({ materials, startDate, endDate }) => {
    const exportToExcel = async () => {
        if (!materials || materials.length === 0) {
            alert("내보낼 데이터가 없습니다.");
            return;
        }

        try {
            const workbook = new ExcelJS.Workbook();

            // 기존 템플릿 파일 읽기
            const response = await fetch("/Excel_template/입고.xlsx");
            const arrayBuffer = await response.arrayBuffer();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet("입고"); // 첫 번째 워크시트
            if (!worksheet) {
                alert("엑셀 시트를 찾을 수 없습니다. 템플릿을 확인하세요.");
                return;
            }

            // 날짜 포맷 함수
            const formatDate = (dateStr) => {
                if (!dateStr) return "";
                return dateStr.slice(0, 10); // YYYY-MM-DD
            };

            // 데이터 추가 (7행부터)
            materials.forEach((item, index) => {
                const rowIndex = 7 + index;
                const price = item.price ?? 0;
                const amount = (item.price && item.input_quantity ? item.price * item.input_quantity : 0);
                const rowData = [
                    index + 1, // 번호
                    item.material_code ?? "", // 자재코드
                    item.location ?? "", // 위치
                    item.big_category ?? "", // 대분류
                    item.category ?? "", // 중분류
                    item.sub_category ?? "", // 소분류
                    item.name ?? "", // 품명
                    item.specification ?? "", // 규격
                    item.manufacturer ?? "", // 제조사
                    item.unit ?? "", // 단위
                    price, // 단가 (숫자)
                    item.input_quantity ?? 0, // L열: 입고수량
                    amount, // 입고 금액 (숫자)
                    item.input_user ?? "", // 담당자
                    item.input_comment ?? "", // O열: 비고
                    formatDate(item.input_date), // P열: 날짜 (YYYY-MM-DD)
                ];
                worksheet.insertRow(rowIndex, rowData);

                // 새로 삽입된 행의 모든 셀에 테두리 강제 적용 및 단가/금액/수량 셀에 숫자 포맷 적용
                const newRow = worksheet.getRow(rowIndex);
                newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    // 단가(11번째), 수량(12번째), 금액(13번째) 셀에 숫자 포맷 적용
                    if (colNumber === 11 || colNumber === 12 || colNumber === 13) {
                        cell.numFmt = '#,##0';
                    }
                });
            });

            // 파일명 생성 (시작일~종료일)
            const fileName = `자재입고_${startDate.replace(/-/g, '')}_${endDate ? endDate.replace(/-/g, '') : '현재'}.xlsx`;

            // 엑셀 저장
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("엑셀 파일 생성 중 오류가 발생했습니다:", error);
            alert("엑셀 파일 생성 중 오류가 발생했습니다.");
        }
    };

    return (
        <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            엑셀로 내보내기
        </button>
    );
};

export default ExcelInputReport; 
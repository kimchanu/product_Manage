import React from "react";
import ExcelJS from "exceljs";

const ExcelMaterialReport = ({ materials, businessLocation, department }) => {
    const exportToExcel = async () => {
        if (!materials || materials.length === 0) {
            alert("내보낼 데이터가 없습니다.");
            return;
        }

        try {
            const workbook = new ExcelJS.Workbook();

            // 기존 템플릿 파일 읽기
            const response = await fetch("/Excel_template/자재현황.xlsx");
            const arrayBuffer = await response.arrayBuffer();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet("자재현황"); // 첫 번째 워크시트
            if (!worksheet) {
                alert("엑셀 시트를 찾을 수 없습니다. 템플릿을 확인하세요.");
                return;
            }

            // 데이터 추가 (8행부터)
            materials.forEach((material, index) => {
                const rowIndex = 8 + index;
                const currentStock = (material?.total_input_quantity || 0) - (material?.total_output_quantity || 0);
                const stockValue = currentStock * (material?.price || 0);
                const appropriate = material?.appropriate || 0;

                const rowData = [
                    index + 1, // A열: 번호 (1,2,3...)
                    material?.material_code ?? "", // B열: 자재코드
                    material?.location ?? "", // C열: 위치
                    material?.big_category ?? "", // D열: 대분류
                    material?.category ?? "", // E열: 중분류
                    material?.sub_category ?? "", // F열: 소분류
                    material?.name ?? "", // G열: 품명
                    material?.specification ?? "", // H열: 규격
                    material?.manufacturer ?? "", // I열: 제조사
                    "", // J열: 비움
                    material?.unit ?? "", // K열: 단위
                    material?.price ?? 0, // L열: 단가
                    currentStock, // M열: 재고수량
                    stockValue, // N열: 재고금액
                    appropriate, // O열: 적정수량
                ];
                worksheet.insertRow(rowIndex, rowData);

                // 새로 삽입된 행의 모든 셀에 테두리 강제 적용 및 숫자 포맷 적용
                const newRow = worksheet.getRow(rowIndex);
                newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    // 단가(12번째), 재고수량(13번째), 재고금액(14번째), 적정수량(15번째) 셀에 숫자 포맷 적용
                    if (colNumber >= 12 && colNumber <= 15) {
                        cell.numFmt = '#,##0';
                    }
                });
            });

            // 파일명 생성 (사업소_부서_날짜)
            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
            const fileName = `자재현황_${businessLocation}_${department}_${dateStr}.xlsx`;

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
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            disabled={!businessLocation || !department}
        >
            엑셀로 내보내기
        </button>
    );
};

export default ExcelMaterialReport; 
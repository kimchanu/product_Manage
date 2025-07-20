import React from "react";
import ExcelJS from "exceljs";

const ExcelStatementReport = ({ stats, categories, year, month, user, budgetAmount, currentMonthAmount, yearTotalInputAmount, remainingAmount }) => {
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();

        const response = await fetch("/Excel_template/자재수불.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.getWorksheet("월간보고서");
        if (!worksheet) {
            alert("엑셀 시트를 찾을 수 없습니다. 템플릿을 확인하세요.");
            return;
        }

        // 상단 정보 입력
        worksheet.getCell("A2").value = `${year}년 ${month}월 잡자재수불명세서대장`;
        worksheet.getCell("M5").value = `GK-${year.toString().slice(2)}-C-003`;
        worksheet.getCell("M6").value = user?.department || "";
        worksheet.getCell("AE5").value = `${year}.${month.toString().padStart(2, "0")}`;
        worksheet.getCell("AE6").value = user?.name || "";

        // 예산 집행현황 값 입력 (A19, D19, M19, AE19)
        worksheet.getCell("A19").value = `${month.toString().padStart(2, "0")}월`;
        worksheet.getCell("D19").value = budgetAmount;
        worksheet.getCell("M19").value = currentMonthAmount;
        worksheet.getCell("V19").value = yearTotalInputAmount;
        worksheet.getCell("AE19").value = remainingAmount;

        // 데이터 입력 (10행부터 시작)
        categories.forEach((cat, index) => {
            const row = stats.byCategory?.[cat] || {
                prevStock: 0,
                input: 0,
                output: 0,
                remaining: 0,
            };
            const excelRow = 10 + index;

            worksheet.getCell(`A${excelRow}`).value = cat;
            worksheet.getCell(`D${excelRow}`).value = row.prevStock;
            worksheet.getCell(`M${excelRow}`).value = row.input;
            worksheet.getCell(`V${excelRow}`).value = row.output;
            worksheet.getCell(`AE${excelRow}`).value = row.remaining;
        });

        // 엑셀 저장
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `자재수불명세서_${year}년${month}월.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={exportToExcel}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
        >
            엑셀 내보내기
        </button>
    );
};

export default ExcelStatementReport;
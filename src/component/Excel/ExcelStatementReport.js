import React from "react";
import ExcelJS from "exceljs";

const ExcelStatementReport = ({ stats, categories, year, month, user, budgetAmount, currentMonthAmount, yearTotalInputAmount, remainingAmount, reportType }) => {
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();

        // 보고서 유형에 따른 템플릿 파일과 시트명 결정
        let templateFile, sheetName, fileName;

        switch (reportType) {
            case "monthly":
                templateFile = "/Excel_template/자재수불.xlsx";
                sheetName = "월간보고서";
                fileName = `자재수불명세서_${year}년${month}월.xlsx`;
                break;
            case "partYearly":
                templateFile = "/Excel_template/연간보고서.xlsx";
                sheetName = "연간보고서";
                fileName = `연간보고서_${year}년_${user?.department}.xlsx`;
                break;
            case "allPartYearly":
                templateFile = "/Excel_template/자재수불.xlsx";
                sheetName = "전파트연간보고서";
                fileName = `전파트연간보고서_${year}년.xlsx`;
                break;
            default:
                templateFile = "/Excel_template/자재수불.xlsx";
                sheetName = "월간보고서";
                fileName = `자재수불명세서_${year}년${month}월.xlsx`;
        }

        const response = await fetch(templateFile);
        const arrayBuffer = await response.arrayBuffer();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.getWorksheet(sheetName);
        if (!worksheet) {
            alert(`${sheetName} 시트를 찾을 수 없습니다. 템플릿을 확인하세요.`);
            return;
        }

        // 보고서 유형에 따른 데이터 입력 로직
        if (reportType === "monthly") {
            // 월간보고서 데이터 입력
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
        } else if (reportType === "partYearly") {
            // 파트별 연간보고서 데이터 입력
            worksheet.getCell("A2").value = `${year}년 ${user?.department} 연간보고서`;
            worksheet.getCell("M5").value = `GK-${year.toString().slice(2)}-C-004`;
            worksheet.getCell("M6").value = user?.department || "";
            worksheet.getCell("AE5").value = `${year}.12`;
            worksheet.getCell("AE6").value = user?.name || "";

            // 연간 데이터 입력 로직 (월별 데이터를 12개월로 확장)
            categories.forEach((cat, index) => {
                const row = stats.byCategory?.[cat] || {
                    prevStock: 0,
                    input: 0,
                    output: 0,
                    remaining: 0,
                };
                const excelRow = 10 + index;

                worksheet.getCell(`A${excelRow}`).value = cat;
                // 연간 합계 데이터 입력
                worksheet.getCell(`D${excelRow}`).value = row.prevStock;
                worksheet.getCell(`M${excelRow}`).value = row.input;
                worksheet.getCell(`V${excelRow}`).value = row.output;
                worksheet.getCell(`AE${excelRow}`).value = row.remaining;
            });
        } else if (reportType === "allPartYearly") {
            // 전파트 연간보고서 데이터 입력
            worksheet.getCell("A2").value = `${year}년 전파트 연간보고서`;
            worksheet.getCell("M5").value = `GK-${year.toString().slice(2)}-C-005`;
            worksheet.getCell("M6").value = "전체";
            worksheet.getCell("AE5").value = `${year}.12`;
            worksheet.getCell("AE6").value = "관리자";

            // 전파트 통합 데이터 입력 로직
            categories.forEach((cat, index) => {
                const row = stats.byCategory?.[cat] || {
                    prevStock: 0,
                    input: 0,
                    output: 0,
                    remaining: 0,
                };
                const excelRow = 10 + index;

                worksheet.getCell(`A${excelRow}`).value = cat;
                // 전파트 합계 데이터 입력
                worksheet.getCell(`D${excelRow}`).value = row.prevStock;
                worksheet.getCell(`M${excelRow}`).value = row.input;
                worksheet.getCell(`V${excelRow}`).value = row.output;
                worksheet.getCell(`AE${excelRow}`).value = row.remaining;
            });
        }

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
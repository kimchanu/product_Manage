import React from "react";
import ExcelJS from "exceljs";

const ExcelYearlyStatementReport = ({ stats, categories, year, month, user, budgetAmount, currentMonthAmount, yearTotalInputAmount, remainingAmount, reportType }) => {
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();

        // 보고서 유형에 따른 템플릿 파일과 시트명 결정
        let templateFile, sheetName, fileName;

        switch (reportType) {
            case "monthly":
                templateFile = "/Excel_template/연간보고서.xlsx";
                sheetName = "월간보고서";
                fileName = `자재수불명세서_${year}년${month}월.xlsx`;
                break;
            case "partYearly":
                templateFile = "/Excel_template/연간보고서.xlsx";
                sheetName = "연간보고서";
                fileName = `연간보고서_${year}년_${user?.department}.xlsx`;
                break;
            case "allPartYearly":
                templateFile = "/Excel_template/연간보고서.xlsx";
                sheetName = "전파트연간보고서";
                fileName = `전파트연간보고서_${year}년.xlsx`;
                break;
            default:
                templateFile = "/Excel_template/연간보고서.xlsx";
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
            // 월간보고서 데이터 입력 (ExcelStatement와 동일)
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

            // 연간 예산집행현황 값 입력 (A19, D19, M19, AE19)
            worksheet.getCell("A19").value = "연간";
            worksheet.getCell("E19").value = budgetAmount;
            worksheet.getCell("M19").value = window.yearlyTotalInput || 0;
            worksheet.getCell("AC19").value = budgetAmount ?
                `${(((window.yearlyTotalInput || 0) / budgetAmount) * 100).toFixed(1)}%` : '0%';
            worksheet.getCell("U19").value = (budgetAmount || 0) - (window.yearlyTotalInput || 0);

            // 1월부터 6월까지의 월별 데이터 입력
            const monthlyData = stats.monthlyData || {};

            // 누적 재고 계산을 위한 변수 (UI와 동일한 방식)
            let cumulativeStock = 0;

            // 전년도 말일까지의 재고 계산 (UI와 동일한 방식)
            if (stats.yearlyTotals) {
                categories.forEach(cat => {
                    if (cat !== "합 계") {
                        const firstMonthData = monthlyData[1]?.[cat] || { input: 0, output: 0, remaining: 0 };
                        const prevYearStock = firstMonthData.remaining - firstMonthData.input;
                        cumulativeStock += prevYearStock;
                    }
                });
            }

            for (let month = 1; month <= 6; month++) {
                let totalInput = 0;
                let totalOutput = 0;

                // 모든 카테고리의 해당 월 데이터 합계
                categories.forEach(cat => {
                    if (cat !== "합 계") {
                        const monthData = monthlyData[month]?.[cat] || { input: 0, output: 0, remaining: 0 };
                        totalInput += monthData.input;
                        totalOutput += monthData.output;
                    }
                });

                // 누적 재고 계산: 이전 재고 + 입고 - 출고 (UI와 동일)
                cumulativeStock = cumulativeStock + totalInput - totalOutput;

                const row = 8 + month; // 9행부터 시작 (month=1일 때 9행)
                worksheet.getCell(`D${row}`).value = totalInput;
                worksheet.getCell(`I${row}`).value = totalOutput;
                worksheet.getCell(`O${row}`).value = cumulativeStock;
            }

            // 7월부터 12월까지의 월별 데이터 입력
            for (let month = 7; month <= 12; month++) {
                let totalInput = 0;
                let totalOutput = 0;

                // 모든 카테고리의 해당 월 데이터 합계
                categories.forEach(cat => {
                    if (cat !== "합 계") {
                        const monthData = monthlyData[month]?.[cat] || { input: 0, output: 0, remaining: 0 };
                        totalInput += monthData.input;
                        totalOutput += monthData.output;
                    }
                });

                // 누적 재고 계산: 이전 재고 + 입고 - 출고 (UI와 동일)
                cumulativeStock = cumulativeStock + totalInput - totalOutput;

                const row = month - 6 + 8; // 9행부터 시작 (month=7일 때 9행)
                worksheet.getCell(`X${row}`).value = totalInput;
                worksheet.getCell(`AC${row}`).value = totalOutput;
                worksheet.getCell(`AI${row}`).value = cumulativeStock;
            }

            // 연간 데이터 입력 로직 제거 - 월별 데이터가 이미 입력되었으므로 덮어쓰지 않음
        } else if (reportType === "allPartYearly") {
            // 전파트 연간보고서 데이터 입력
            worksheet.getCell("A2").value = `${year}년 전파트 연간보고서`;
            worksheet.getCell("M5").value = `GK-${year.toString().slice(2)}-C-005`;
            worksheet.getCell("M6").value = "전체";
            worksheet.getCell("AE5").value = `${year}.12`;
            worksheet.getCell("AE6").value = "관리자";

            // 전파트 연간 예산집행현황 값 입력 (A19, D19, M19, AE19)
            worksheet.getCell("A19").value = "연간";
            worksheet.getCell("D19").value = budgetAmount;
            worksheet.getCell("M19").value = window.yearlyTotalInput || 0;
            worksheet.getCell("V19").value = budgetAmount ?
                `${(((window.yearlyTotalInput || 0) / budgetAmount) * 100).toFixed(1)}%` : '0%';
            worksheet.getCell("AE19").value = (budgetAmount || 0) - (window.yearlyTotalInput || 0);

            // 전파트 통합 데이터 입력 로직 (8~14행 제외, 나머지는 ExcelStatement와 동일)
            categories.forEach((cat, index) => {
                const row = stats.yearlyTotals?.[cat] || {
                    input: 0,
                    output: 0,
                    remaining: 0,
                };
                const excelRow = 10 + index;

                worksheet.getCell(`A${excelRow}`).value = cat;
                // 전파트 합계 데이터 입력
                worksheet.getCell(`D${excelRow}`).value = row.input;
                worksheet.getCell(`M${excelRow}`).value = row.output;
                worksheet.getCell(`V${excelRow}`).value = row.remaining;
                worksheet.getCell(`AE${excelRow}`).value = 0; // 비고
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

export default ExcelYearlyStatementReport; 
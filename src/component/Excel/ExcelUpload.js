import { useRef, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

const MAX_IMPORT_COLUMN_INDEX = 74;
const INPUT_MONTH_COLUMN_INDEXES = [13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];
const OUTPUT_MONTH_COLUMN_INDEXES = [42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64];

const normalizeText = (value) => String(value ?? "").trim();

const parseNumber = (value) => {
  const number = Number(normalizeText(value).replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
};

const findDataStartIndex = (rows) => {
  const headerRowIndex = rows.findIndex((row) =>
    normalizeText(row?.[1]).replace(/\s+/g, "").includes("자재코드")
  );

  if (headerRowIndex < 0) {
    throw new Error("자재코드 헤더를 찾을 수 없습니다.");
  }

  const dataStartIndex = rows.findIndex(
    (row, index) =>
      index > headerRowIndex &&
      (normalizeText(row?.[1]) || normalizeText(row?.[6])) &&
      !normalizeText(row?.[1]).replace(/\s+/g, "").includes("자재코드")
  );

  if (dataStartIndex < 0) {
    throw new Error("업로드할 자재 데이터를 찾을 수 없습니다.");
  }

  return dataStartIndex;
};

const formatRows = (rows) => {
  const dataStartIndex = findDataStartIndex(rows);

  return rows
    .slice(dataStartIndex)
    .filter((row) => normalizeText(row?.[1]) || normalizeText(row?.[6]))
    .map((row) => ({
      id: uuidv4(),
      자재코드: normalizeText(row[1]),
      위치: normalizeText(row[2]),
      대분류: normalizeText(row[3]),
      중분류: normalizeText(row[4]),
      소분류: normalizeText(row[5]),
      품명: normalizeText(row[6]),
      규격: normalizeText(row[7]),
      제조사: normalizeText(row[8]),
      거래처: normalizeText(row[9]),
      단위: normalizeText(row[10]),
      단가: parseNumber(row[11]),
      적정수량: parseNumber(row[72]),
      inputCarryover: parseNumber(row[12]),
      outputCarryover: parseNumber(row[41]),
      monthlyInputs: INPUT_MONTH_COLUMN_INDEXES.map((index) => parseNumber(row[index])),
      monthlyOutputs: OUTPUT_MONTH_COLUMN_INDEXES.map((index) => parseNumber(row[index])),
    }));
};

const extractDetectedYear = (rows, fileName) => {
  const sourceText = `${fileName} ${rows
    .slice(0, 5)
    .flat()
    .filter(Boolean)
    .join(" ")}`;
  const match = sourceText.match(/(20\d{2})\s*년?/);
  return match ? Number(match[1]) : null;
};

function ExcelUpload({ setCsvData, onUploadInfo, onDetectedYear }) {
  const inputRef = useRef(null);
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const applyParsedRows = (rows, uploadedFileName) => {
    const formattedData = formatRows(rows);
    const detectedYear = extractDetectedYear(rows, uploadedFileName);

    if (formattedData.length === 0) {
      throw new Error("업로드할 자재 데이터가 없습니다.");
    }

    setCsvData(formattedData);
    setParsedData(formattedData);
    onUploadInfo?.({
      fileName: uploadedFileName,
      rowCount: formattedData.length,
      detectedYear,
      inputTotal: formattedData.reduce(
        (sum, item) => sum + item.inputCarryover + item.monthlyInputs.reduce((total, value) => total + value, 0),
        0
      ),
      outputTotal: formattedData.reduce(
        (sum, item) => sum + item.outputCarryover + item.monthlyOutputs.reduce((total, value) => total + value, 0),
        0
      ),
    });

    if (detectedYear) {
      onDetectedYear?.(detectedYear);
    }
  };

  const parseExcelFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!worksheet) {
      throw new Error("엑셀 시트를 찾을 수 없습니다.");
    }

    const decodedRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: true,
      range: {
        s: { r: 0, c: 0 },
        e: { r: decodedRange.e.r, c: Math.min(decodedRange.e.c, MAX_IMPORT_COLUMN_INDEX) },
      },
    });

    applyParsedRows(rows, file.name);
  };

  const parseCsvFile = (file) =>
    new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: false,
        complete: (result) => {
          try {
            applyParsedRows(result.data, file.name);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: reject,
      });
    });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsParsing(true);
    setErrorMessage("");
    setFileName(file.name);
    setCsvData([]);
    setParsedData([]);
    onUploadInfo?.(null);

    try {
      if (file.name.toLowerCase().endsWith(".csv")) {
        await parseCsvFile(file);
      } else { 
        await parseExcelFile(file);
      }
    } catch (error) {
      console.error("파일 파싱 오류:", error);
      setErrorMessage(error.message || "파일을 읽는 중 오류가 발생했습니다.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isParsing}
        className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
      >
        <span className="block text-base font-semibold text-slate-700">
          {isParsing ? "파일을 분석하고 있습니다..." : "엑셀 또는 CSV 파일 선택"}
        </span>
        <span className="mt-2 block text-sm text-slate-500">
          {fileName || "지원 형식: .xlsx, .xls, .csv"}
        </span>
      </button>

      {errorMessage && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      )}

      {parsedData.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
            <h3 className="font-semibold text-slate-800">자재 미리보기</h3>
            <span className="text-sm text-slate-500">상위 10건</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">자재코드</th>
                  <th className="px-4 py-3">품명</th>
                  <th className="px-4 py-3">규격</th>
                  <th className="px-4 py-3 text-right">이월 입고</th>
                  <th className="px-4 py-3 text-right">이월 출고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedData.slice(0, 10).map((row) => (
                  <tr key={row.id} className="text-slate-700">
                    <td className="whitespace-nowrap px-4 py-3">{row.자재코드 || "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3">{row.품명 || "-"}</td>
                    <td className="max-w-xs truncate px-4 py-3">{row.규격 || "-"}</td>
                    <td className="px-4 py-3 text-right">{row.inputCarryover.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{row.outputCarryover.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcelUpload;

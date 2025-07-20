import { useState } from "react";
import Papa from "papaparse";
import { v4 as uuidv4 } from 'uuid';

function CsvUpload({ setCsvData }) {
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState("");


  const generateUniqueId = () => uuidv4();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (result) => {
        const headersRaw = result.data[4].map((val, index) => {
          return result.data[5][index] ? `${val}${result.data[5][index]}`.trim() : val.trim();
        });

        // 공백 제거한 key로 매핑
        const headers = headersRaw.map(h => h.replace(/\s+/g, ""));

        const selectedColumnsIndexes = [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
          39, // 입고수량
          68, // 출고수량
          72, // 적정수량
        ];

        const selectedHeaders = selectedColumnsIndexes.map(index => headers[index]);

        // 강제로 이름 부여
        selectedHeaders[selectedColumnsIndexes.indexOf(39)] = "입고수량";
        selectedHeaders[selectedColumnsIndexes.indexOf(68)] = "출고수량";
        selectedHeaders[selectedColumnsIndexes.indexOf(72)] = "적정수량";

        const formattedData = result.data.slice(6).map((row) => {
          const formattedRow = {};

          selectedColumnsIndexes.forEach((index, i) => {
            const header = selectedHeaders[i];
            formattedRow[header] = header === "적정수량" ? Number(row[index]) || 0 : row[index] || "";
          });

          formattedRow["id"] = formattedRow["자재코드"]
            ? generateUniqueId(formattedRow["자재코드"])
            : generateUniqueId();

          return formattedRow;
        });

        setCsvData(formattedData);
        setParsedData(formattedData);
        console.log("CSV 파싱 데이터:", formattedData);
      },
      error: (error) => {
        console.error("⚠ CSV 파싱 오류:", error);
      },
    });


  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4" />
      {fileName && <p className="text-sm text-gray-500 mb-2">파일명: {fileName}</p>}

      {parsedData.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold text-lg">미리보기 (최대 10개 행)</h3>
          <table className="w-full border-collapse border border-gray-300 mt-2 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">자재코드</th>
                <th className="border p-2">품 명</th>
                <th className="border p-2">규 격</th>
                <th className="border p-2">단 위</th>
                <th className="border p-2">단 가</th>
                <th className="border p-2">입고수량</th>
                <th className="border p-2">출고수량</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.slice(0, 10).map((row, index) => (
                <tr key={index} className="text-center">
                  <td className="border p-2">{row["자재코드"]}</td>
                  <td className="border p-2">{row["품명"]}</td>
                  <td className="border p-2">{row["규격"]}</td>
                  <td className="border p-2">{row["단위"]}</td>
                  <td className="border p-2">{row["단가"]}</td>
                  <td className="border p-2">{row["입고수량"]}</td>
                  <td className="border p-2">{row["출고수량"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CsvUpload;
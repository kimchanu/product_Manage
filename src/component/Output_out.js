import React, { useState, useEffect } from "react";
import User_info from "./User_info";

const MaterialOutputPage = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [comment, setComment] = useState("");
  const [date, setDate] = useState("");

  const fetchData = async () => {
    if (!user?.business_location || !user?.department) {
      console.log("Missing user info:", user);
      return;
    }

    console.log("Fetching data with user info:", user);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          businessLocation: user.business_location,
          department: user.department,
        }),
      });

      console.log("Server response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(errorData.message || "자재 데이터를 가져오는데 실패했습니다.");
      }

      const result = await response.json();
      console.log("Received materials data:", result);

      if (!Array.isArray(result)) {
        console.error("Invalid data format received:", result);
        throw new Error("자재 데이터가 올바른 형식이 아닙니다.");
      }
      setMaterials(result);
    } catch (error) {
      console.error("서버 요청 오류:", error);
      setMaterials([]);
    }
  };

  useEffect(() => {
    if (user) {
      console.log("User info updated, fetching data...");
      fetchData();
    }
  }, [user]);

  const handleSelect = (material) => {
    if (!selectedMaterials.some((m) => m.material_id === material.material_id)) {
      setSelectedMaterials([...selectedMaterials, { ...material, outputQty: 0 }]);
    }
  };

  const handleQtyChange = (id, value) => {
    setSelectedMaterials((prev) =>
      prev.map((mat) => {
        if (mat.material_id === id) {
          const stock = (mat.total_input_quantity || 0) - (mat.total_output_quantity || 0);
          const newQty = Number(value);

          if (newQty > stock) {
            alert(`❗ 출고 수량은 재고(${stock})보다 클 수 없습니다.`);
            return { ...mat, outputQty: stock };
          }

          return { ...mat, outputQty: newQty };
        }
        return mat;
      })
    );
  };

  const handleRemove = (id) => {
    setSelectedMaterials((prev) => prev.filter((mat) => mat.material_id !== id));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "⬆️" : "⬇️";
  };

  const getSortedMaterials = () => {
    let filtered = materials
      .map((m) => ({
        ...m,
        stock: (m.total_input_quantity || 0) - (m.total_output_quantity || 0),
      }))
      .filter((m) =>
        (m.material_code.toLowerCase().includes(search.toLowerCase()) ||
          m.name.toLowerCase().includes(search.toLowerCase())) &&
        m.stock >= 1
      );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = sortConfig.key === "stock" ? a.stock : a[sortConfig.key];
        const bValue = sortConfig.key === "stock" ? b.stock : b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const handleSave = async () => {
    if (!date || !comment) {
      alert("출고일자와 사유를 모두 입력해주세요.");
      return;
    }

    const materialsToSend = selectedMaterials.map((mat) => ({
      material_id: mat.material_id,
      outputQty: mat.outputQty,
    }));

    const payload = {
      materials: materialsToSend,
      comment,
      date,
      department: user?.department,
      business_location: user?.business_location,
      user_id: user?.name,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/materials/output`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "출고 저장 실패");
      }

      alert("✅ 출고 정보가 저장되었습니다!");
      setSelectedMaterials([]);
      setComment("");
      setDate("");
      await fetchData();
    } catch (error) {
      console.error("출고 저장 오류:", error);
      alert("❌ 출고 저장 중 오류가 발생했습니다: " + error.message);
    }
  };

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      <User_info setUser={setUser} />

      <div>
        <h2 className="text-xl font-bold mb-2">자재 목록</h2>
        <input
          type="text"
          placeholder="🔍 검색 (자재코드, 이름)"
          className="border px-2 py-1 mb-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="overflow-y-auto max-h-[600px] border rounded">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 cursor-pointer" onClick={() => handleSort("material_code")}>자재코드 {getSortIcon("material_code")}</th>
                <th className="border p-2">이름</th>
                <th className="border p-2">규격</th>
                <th className="border p-2 cursor-pointer" onClick={() => handleSort("stock")}>재고 {getSortIcon("stock")}</th>
              </tr>
            </thead>
            <tbody>
              {getSortedMaterials().map((material) => (
                <tr
                  key={material.material_id}
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSelect(material)}
                >
                  <td className="border p-2">{material.material_code}</td>
                  <td className="border p-2">{material.name}</td>
                  <td className="border p-2">{material.specification}</td>
                  <td className="border p-2">{(material.total_input_quantity - material.total_output_quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">출고 대상</h2>
        <table className="w-full border text-sm mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">자재코드</th>
              <th className="border p-2">이름</th>
              <th className="border p-2">규격</th>
              <th className="border p-2">단가</th>
              <th className="border p-2">재고</th>
              <th className="border p-2">총 가격</th>
              <th className="border p-2">출고수량</th>
              <th className="border p-2">삭제</th>
            </tr>
          </thead>
          <tbody>
            {selectedMaterials.map((material) => {
              const stock = (material.total_input_quantity || 0) - (material.total_output_quantity || 0);
              const totalPrice = stock * (material.price || 0);
              return (
                <tr key={material.material_id}>
                  <td className="border p-2">{material.material_code}</td>
                  <td className="border p-2">{material.name}</td>
                  <td className="border p-2">{material.specification}</td>
                  <td className="border p-2">{material.price?.toLocaleString() || 0}</td>
                  <td className="border p-2">{stock.toLocaleString()}</td>
                  <td className="border p-2">{totalPrice.toLocaleString()}</td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      className="w-20 border p-1"
                      value={material.outputQty}
                      onChange={(e) => handleQtyChange(material.material_id, e.target.value)}
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => handleRemove(material.material_id)}
                    >삭제</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mb-4">
          <textarea
            placeholder="✍️ 출고 사유 또는 코멘트"
            className="w-full border p-2 mb-2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <input
            type="date"
            className="border p-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleSave}
        >✅ 저장</button>
      </div>
    </div>
  );
};

export default MaterialOutputPage;
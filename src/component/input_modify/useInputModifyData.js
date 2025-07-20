import { useState, useEffect, useMemo } from "react";

const useInputModifyData = (user) => {
    const [materials, setMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const currentYear = new Date().getFullYear();
    const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
    const [endDate, setEndDate] = useState("");

    const fetchData = async (userInfo = user) => {
        if (!userInfo?.business_location || !userInfo?.department) {
            console.log('Missing user info:', { business_location: userInfo?.business_location, department: userInfo?.department });
            return;
        }
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/materials`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    businessLocation: userInfo.business_location,
                    department: userInfo.department,
                }),
            });
            const result = await response.json();
            if (!Array.isArray(result)) throw new Error("자재 데이터가 올바른 형식이 아님");
            setMaterials(result);
        } catch (error) {
            console.error("서버 요청 오류:", error);
            setMaterials([]);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [user]);

    // 분류별 유니크 값 목록 (select box용)
    const bigCategoryList = useMemo(() => {
        const set = new Set();
        materials.forEach(m => m.big_category && set.add(m.big_category));
        return Array.from(set);
    }, [materials]);
    const categoryList = useMemo(() => {
        const set = new Set();
        materials.forEach(m => m.category && set.add(m.category));
        return Array.from(set);
    }, [materials]);
    const subCategoryList = useMemo(() => {
        const set = new Set();
        materials.forEach(m => m.sub_category && set.add(m.sub_category));
        return Array.from(set);
    }, [materials]);

    // 필터링된 자재 데이터
    const filteredMaterials = materials.flatMap((material) => {
        const totalInput = material.inputs?.reduce((acc, cur) => acc + (cur.quantity || 0), 0) || 0;
        const totalOutput = material.outputs?.reduce((acc, cur) => acc + (cur.quantity || 0), 0) || 0;
        const remainingQuantity = totalInput - totalOutput;
        const remainingPrice = remainingQuantity * (material.price || 0);
        return material.inputs?.length > 0
            ? material.inputs
                .map((input) => ({
                    material_code: material.material_code,
                    name: material.name,
                    specification: material.specification,
                    price: material.price,
                    input_quantity: input.quantity,
                    input_date: input.date,
                    input_user: input.user_id,
                    input_comment: input.comment,
                    remaining_quantity: remainingQuantity,
                    remaining_price: remainingPrice,
                    input_id: input.id,
                    material_id: material.material_id,
                    location: material.location,
                    big_category: material.big_category,
                    category: material.category,
                    sub_category: material.sub_category,
                    manufacturer: material.manufacturer,
                    unit: material.unit,
                }))
                .filter((input) => {
                    const inputDate = new Date(input.input_date);
                    const start = startDate ? new Date(startDate) : null;
                    const end = endDate ? new Date(endDate) : null;
                    const matchesSearch =
                        input.material_code?.includes(searchTerm) ||
                        input.name?.includes(searchTerm) ||
                        input.category?.includes(searchTerm) ||
                        input.sub_category?.includes(searchTerm);
                    const inDateRange = (!start || inputDate >= start) && (!end || inputDate <= end);
                    const hasValidQuantity = input.input_quantity >= 1;
                    return matchesSearch && inDateRange && hasValidQuantity;
                })
            : [];
    });

    return {
        materials,
        setMaterials,
        searchTerm,
        setSearchTerm,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        fetchData,
        filteredMaterials,
        bigCategoryList,
        categoryList,
        subCategoryList,
    };
};

export default useInputModifyData;

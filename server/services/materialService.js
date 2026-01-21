const { createModels, ApiMainProduct } = require("../models/material");

const getAllMaterials = async (businessLocation, department) => {
  try {
    const { Product, Input, Output } = createModels(businessLocation, department);

    // 1. Local DB Products 조회
    const localProductsPromise = (async () => {
      try {
        return await Product.findAll({
          include: [
            {
              model: Input,
              as: "inputs",
              attributes: ["id", "quantity", "comment", "date", "user_id"],
            },
            {
              model: Output,
              as: "outputs",
              attributes: ["id", "quantity", "comment", "date", "user_id"],
            },
          ],
          raw: false,
        });
      } catch (error) {
        // 테이블이 없는 경우 (아직 생성되지 않음) 빈 배열 반환
        if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
          console.warn(`Local table not found for ${businessLocation}_${department}, returning empty list.`);
          return [];
        }
        throw error;
      }
    })();

    // 2. Groupware DB Products 조회 (ApiMainProduct)
    // 매핑 로직 추가
    const locationMapping = {
      "GK": "GK사업소",
      "CM": "천마사업소",
      "ES": "을숙도사업소",
      "GN": "강남사업소"
    };

    const gwBusinessLocation = locationMapping[businessLocation] || businessLocation;

    const gwProductsPromise = ApiMainProduct.findAll({
      where: {
        business_location: gwBusinessLocation,
        department: department,
      },
      raw: true, // Groupware 데이터는 단순 조회
    });

    const [localProducts, gwProducts] = await Promise.all([
      localProductsPromise,
      gwProductsPromise,
    ]);

    // 3. Groupware Products에 대한 Output 조회 (Output 테이블은 공유)
    // gwProducts의 material_id 목록 추출
    const gwMaterialIds = gwProducts.map((p) => p.material_id);
    let gwOutputs = [];
    if (gwMaterialIds.length > 0) {
      try {
        gwOutputs = await Output.findAll({
          where: {
            material_id: gwMaterialIds,
          },
          raw: true,
        });
      } catch (error) {
        if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
          console.warn(`Local Output table not found for ${businessLocation}_${department}, using empty list.`);
          gwOutputs = [];
        } else {
          throw error;
        }
      }
    }

    // 4. 데이터 병합 및 가공

    // 4-1. Local Products 가공
    const formattedLocalProducts = localProducts.map((product) => {
      const inputs = product.inputs || [];
      const outputs = product.outputs || [];

      const totalInput = inputs.reduce((sum, input) => sum + (input.quantity || 0), 0);
      const totalOutput = outputs.reduce((sum, output) => sum + (output.quantity || 0), 0);
      const stock = totalInput - totalOutput;

      return {
        id: product.id, // Local ID (if needed)
        material_id: product.material_id,
        material_code: product.material_code,
        location: product.location,
        big_category: product.big_category,
        manufacturer: product.manufacturer,
        name: product.name,
        specification: product.specification,
        unit: product.unit,
        price: product.price,
        supplier: product.supplier,
        category: product.category,
        sub_category: product.sub_category,
        appropriate: product.appropriate,
        total_input_quantity: totalInput,
        total_output_quantity: totalOutput,
        stock,
        inputs,
        outputs,
        source: "local",
      };
    });

    // 4-2. Groupware Products 가공
    const formattedGwProducts = gwProducts.map((p) => {
      // 해당 자재의 Output 필터링
      const myOutputs = gwOutputs.filter((o) => o.material_id === p.material_id);

      // Groupware Product의 quantity를 Input으로 간주
      // 가상의 Input 객체 생성하여 프론트엔드 포맷 맞춤
      const initialInput = {
        id: `gw_${p.id}`,
        quantity: p.quantity,
        comment: p.comment || "Initial Stock from Groupware",
        date: p.date,
        user_id: p.user_id,
        source: "groupware_initial",
      };

      const inputs = [initialInput];
      const outputs = myOutputs; // 이미 Output 모델 조회 결과 (raw objects or instances)

      const totalInput = p.quantity || 0;
      const totalOutput = myOutputs.reduce((sum, output) => sum + (output.quantity || 0), 0);
      const stock = totalInput - totalOutput;

      return {
        id: p.id, // Groupware ID
        material_id: p.material_id,
        material_code: p.material_code,
        location: p.location,
        big_category: p.big_category,
        manufacturer: p.manufacturer,
        name: p.name,
        specification: p.specification,
        unit: p.unit,
        price: p.price,
        supplier: p.supplier,
        category: p.category,
        sub_category: p.sub_category,
        appropriate: null, // Groupware 테이블에 appropriate 컬럼이 없다면 null
        total_input_quantity: totalInput,
        total_output_quantity: totalOutput,
        stock,
        inputs,
        outputs,
        source: "groupware",
      };
    });

    // 5. 리스트 합치기 (중복 처리 정책에 따라 다름, 현재는 단순히 합침)
    // 만약 material_id가 겹칠 수 있고, 이를 합쳐야 한다면 추가 로직 필요.
    // 현재는 "테이블 세팅은 Product 와 Input을 합친 테이블"이라고 했으므로
    // 별도의 자재 리스트로 취급하여 합쳐서 반환.
    const allMaterials = [...formattedLocalProducts, ...formattedGwProducts];

    return allMaterials;
  } catch (error) {
    console.error("자재 정보 조회 오류:", error);
    throw error;
  }
};

// material_id, field, value로 단일 필드 업데이트
const updateMaterialField = async (material_id, field, value, businessLocation, department) => {
  try {
    const { Product } = createModels(businessLocation, department);
    // 동적으로 필드 업데이트
    await Product.update(
      { [field]: value },
      { where: { material_id } }
    );
    return true;
  } catch (error) {
    console.error("자재 정보 수정 오류:", error);
    throw error;
  }
};

module.exports = { getAllMaterials, updateMaterialField };

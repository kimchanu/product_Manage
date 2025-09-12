const { createModels } = require("../models/material");

const getAllMaterials = async (businessLocation, department) => {
  try {
    const { Product, Input, Output } = createModels(businessLocation, department);

    const products = await Product.findAll({
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

    const materialsWithStock = products.map((product) => {
      const inputs = product.inputs || [];
      const outputs = product.outputs || [];

      const totalInput = inputs.reduce((sum, input) => sum + (input.quantity || 0), 0);
      const totalOutput = outputs.reduce((sum, output) => sum + (output.quantity || 0), 0);
      const stock = totalInput - totalOutput;

      return {
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
      };
    });

    return materialsWithStock;
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

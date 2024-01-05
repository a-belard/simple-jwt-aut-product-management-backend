import {
  createSuccessResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from "../utils/api.response.js";
import { Sequelize } from "sequelize";
import { sequelize } from "../utils/database.js";

export const registerProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    await sequelize.query(
      "EXEC usp_ins_product @name = :name, @description = :description, @price = :price",
      {
        replacements: { name, description, price },
      }
    );

    return createSuccessResponse("Product registered successfully", null, res);
  } catch (error) {
    return serverErrorResponse(error, res);
  }
};

export const getProducts = async (req, res) => {
  try {
    const result = await sequelize.query("EXEC usp_list_product", {
      type: Sequelize.QueryTypes.SELECT,
    });

    const products = result.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
    }));

    return successResponse("Products", products, res);
  } catch (ex) {
    return serverErrorResponse(ex, res);
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await findOneProduct(id);

    if (product == null) return notFoundResponse("id", id, "Product", res);

    return successResponse("Product", product, res);
  } catch (ex) {
    return serverErrorResponse(ex, res);
  }
};

export const deleteProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await findOneProduct(productId);

    if (product == null)
      return notFoundResponse("id", productId, "Product", res);

    await sequelize.query("EXEC usp_del_product @product_id = :productId", {
      replacements: { productId },
      type: Sequelize.QueryTypes.DELETE,
    });

    return successResponse(
      `Product with ID ${productId} deleted successfully.`,
      null,
      res
    );
  } catch (ex) {
    return serverErrorResponse(ex, res);
  }
};

export const updateProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await findOneProduct(id);

    if (product == null) return notFoundResponse("id", id, "Product", res);

    const { name, description, price } = req.body;

    await sequelize.query(
      "EXEC usp_upd_product @product_id = :id, @name = :name, @description = :description, @price = :price",
      {
        replacements: { id, name, description, price },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );

    return successResponse(
      `Product with ID ${id} updated successfully.`,
      null,
      res
    );
  } catch (ex) {
    return serverErrorResponse(ex, res);
  }
};

const findOneProduct = async (id) => {
  const result = await sequelize.query(
    "EXEC usp_get_product @product_id = :id",
    {
      replacements: { id },
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  const product = result.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
  }))[0];

  return product;
};

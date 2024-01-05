import supertest from "supertest";
import app from "../../src/app";
import UserModel from "../../src/models/user.model";
import {
  closeConnection,
  connectDB,
  executeStoredProcedures,
} from "../../src/utils/database";
import ProductModel from "../../src/models/product.model";

const request = supertest(app);

describe("Product module test", () => {
  let auth_token;
  beforeAll(async () => {
    await connectDB();
    await executeStoredProcedures();

    let userToCreate = {
      username: "test",
      password: "test_test",
    };
    await request.post("/users/register").send(userToCreate);
    const response = await request.post("/users/login").send(userToCreate);
    auth_token = response.body.data.access_token;
  });

  describe("Register product feature test", () => {
    test("Should return 200 on successful product registration", async () => {
      const productToRegister = {
        name: "Test Product",
        description: "This is a test product",
        price: 19.99,
      };

      const response = await request
        .post("/products/register")
        .send(productToRegister)
        .set("auth-token", `Bearer ${auth_token}`);

      expect(response.status).toBe(201);
    });

    test("Should return 401  when the auth token is not provided", async () => {
      const productToRegister = {
        name: "Test Product",
        description: "This is a test product",
        price: 19.99,
      };

      const response = await request
        .post("/products/register")
        .send(productToRegister);

      expect(response.status).toBe(401);
    });
  });

  describe("Get products feature test", () => {
    test("Should return 200 and an array of products", async () => {
      const response = await request
        .get("/products")
        .set("auth-token", `Bearer ${auth_token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test("Should return 401  when the auth token is not provided", async () => {
      const response = await request.get("/products");

      expect(response.status).toBe(401);
    });
  });

  describe("Update product feature test", () => {
    test("Should return 200 on successful product update", async () => {
      const existingProduct = await ProductModel.create({
        name: "Existing Product",
        description: "This is an existing product",
        price: 29,
      });

      const updatedProductData = {
        name: "Updated Product",
        description: "This product has been updated",
        price: 39,
      };

      const response = await request
        .put(`/products/update/${existingProduct.id}`)
        .send(updatedProductData)
        .set("auth-token", `Bearer ${auth_token}`);

      expect(response.status).toBe(200);

      const updatedProduct = await ProductModel.findByPk(existingProduct.id);
      expect(updatedProduct.name).toBe(updatedProductData.name);
      expect(updatedProduct.description).toBe(updatedProductData.description);
      expect(updatedProduct.price).toBe(updatedProductData.price);
    });

    test("Should return 404 when the product does not exist", async () => {
      const response = await request
        .put("/products/update/1000")
        .send({
          name: "Updated Product",
          description: "This product has been updated",
          price: 39.99,
        })
        .set("auth-token", `Bearer ${auth_token}`);

      expect(response.status).toBe(404);
    });

    test("Should return 401 when the auth token is not provided", async () => {
      const response = await request.put("/products/update/1").send({
        name: "Updated Product",
        description: "This product has been updated",
        price: 39.99,
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Delete product feature test", () => {
    test("Should return 200  on successful product deletion", async () => {
      const existingProduct = await ProductModel.create({
        name: "Existing Product",
        description: "This is an existing product",
        price: 29,
      });

      const response = await request
        .delete(`/products/delete/${existingProduct.id}`)
        .set("auth-token", `Bearer ${auth_token}`);

      expect(response.status).toBe(200);
    });

    test("Should return 404  when the product does not exist", async () => {
      const response = await request
        .delete("/products/delete/1000")
        .set("auth-token", `Bearer ${auth_token}`);

      expect(response.status).toBe(404);
    });

    test("Should return 401 when the auth token is not provided", async () => {
      const response = await request.delete("/products/delete/1");

      expect(response.status).toBe(401);
    });
  });

  afterAll(async () => {
    await UserModel.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
    await ProductModel.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
    await closeConnection();
  });
});

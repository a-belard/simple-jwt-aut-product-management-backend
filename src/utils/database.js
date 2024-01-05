import { Sequelize, DataTypes } from "sequelize";
import { db_host, db_name, db_user, db_password, db_port } from "./config.js";

const environment = process.env.NODE_ENV || "DEV";

const sequelize = new Sequelize({
  dialect: "mssql",
  host: db_host,
  database: db_name,
  username: db_user,
  password: db_password,
  port: db_port,
  logging: environment !== "TEST",
  dialectOptions: {
    options: {
      trustServerCertificate: true,
    },
  },
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection has been established successfully and tables created."
    );

    if (environment !== "TEST" && !process.env.GITHUB_ACTIONS) {
      await executeStoredProcedures();
      console.log("Stored procedures executed successfully.");
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

export async function closeConnection() {
  try {
    await sequelize.close();
    console.log("Sequelize connection closed.");
  } catch (error) {
    console.error("Error closing Sequelize connection:", error);
  }
}

export async function executeStoredProcedures() {
  try {
    const dropProcedures = [
      "DROP PROCEDURE IF EXISTS usp_ins_product;",
      "DROP PROCEDURE IF EXISTS usp_get_product;",
      "DROP PROCEDURE IF EXISTS usp_list_product;",
      "DROP PROCEDURE IF EXISTS usp_upd_product;",
      "DROP PROCEDURE IF EXISTS usp_del_product;",
    ];

    for (const dropProcedure of dropProcedures) {
      await sequelize.query(dropProcedure);
    }

    const createProcedures = [
      `
      CREATE PROCEDURE usp_ins_product @name NVARCHAR(255), @description NVARCHAR(MAX), @price INT
      AS
      BEGIN
          INSERT INTO products (name, description, price) VALUES (@name, @description, @price);
      END;
      `,
      `
      CREATE PROCEDURE usp_get_product @product_id INT
      AS
      BEGIN
          SELECT * FROM products WHERE id = @product_id;
      END;
      `,
      `
      CREATE PROCEDURE usp_list_product
      AS
      BEGIN
          SELECT * FROM products;
      END;
      `,
      `
      CREATE PROCEDURE usp_upd_product @product_id INT, @name NVARCHAR(255), @description NVARCHAR(MAX), @price INT
      AS
      BEGIN
          UPDATE products SET name = @name, description = @description, price = @price WHERE id = @product_id;
      END;
      `,
      `
      CREATE PROCEDURE usp_del_product @product_id INT
      AS
      BEGIN
          DELETE FROM products WHERE id = @product_id;
      END;
      `,
    ];

    for (const createProcedure of createProcedures) {
      await sequelize.query(createProcedure);
    }
  } catch (error) {
    console.error("Error executing stored procedures:", error);
  }
}

export { sequelize, DataTypes };

export default sequelize;

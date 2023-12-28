const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
import swaggerUi from "swagger-ui-express";
import userRoutes from "./src/routes/user.routes.js";
import productRoutes from "./src/routes/product.routes.js";

const app = express();

// middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerJson));

app.use("/users", userRoutes);
app.use("/products", productRoutes);

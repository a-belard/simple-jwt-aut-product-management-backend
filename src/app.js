import express, { json } from "express";
import cors from "cors";
import { corsFunction } from "./utils/cors.js";
import { createRequire } from "module";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";

const require = createRequire(import.meta.url);
const swaggerJson = require("../swagger.json");
export const app = express();

app.use(cors());
app.use(corsFunction);
app.use(json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));
app.use("/users", userRoutes);
app.use("/products", productRoutes);

export default app;

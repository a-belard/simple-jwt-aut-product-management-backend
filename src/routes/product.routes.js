import express from 'express'
import authenticate from '../middlewares/auth.middleware.js'
import {deleteProductById, getProductById, getProducts,registerProduct, updateProductById} from "../controllers/product.controller.js"
import { validateProductRegistration } from '../validators/product.validator.js'

const router = express.Router()

router.get("/", authenticate, getProducts)
router.get("/by-id/:id", authenticate, getProductById)
router.post("/register",authenticate,validateProductRegistration, registerProduct)
router.delete("/delete/:id", authenticate, deleteProductById)
router.put("/update/:id", authenticate,validateProductRegistration, updateProductById)


export default router;
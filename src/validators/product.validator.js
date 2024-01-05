import Joi from "joi";
import { errorResponse } from "../utils/api.response.js";

export async function validateProductRegistration(req, res, next) {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().min(1).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return errorResponse(error.message, res);

    return next();
  } catch (ex) {
    return errorResponse(ex.message, res);
  }
}

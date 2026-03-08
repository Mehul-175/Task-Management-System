import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
  firstname: Joi.string().required(),
  middlename: Joi.string(),
  lastname: Joi.string().required(),
});

export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email().lowercase(),
  password: Joi.string().min(6).required(),
}).xor("username", "email");

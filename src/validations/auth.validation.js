import Joi from "joi";

export const registerSchema = Joi.object({
  adminDetails: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).trim().required(),
    firstname: Joi.string().required(),
    middlename: Joi.string().allow(""),
    lastname: Joi.string().required(),
  }).required(),
  companyDetails: Joi.object({
    name: Joi.string().min(3).max(30).required(),
  }).required(),
  planId: Joi.string().required(),
});

export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email().lowercase(),
  password: Joi.string().min(6).required(),
}).xor("username", "email");

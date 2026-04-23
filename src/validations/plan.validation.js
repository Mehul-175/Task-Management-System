import Joi from "joi";

export const createPlanSchema = Joi.object({
  name: Joi.string().uppercase().min(3).max(30).required(),
  price: Joi.number().precision(2).min(0).required(),
  duration_days: Joi.number().integer().min(1).required(),
  max_users: Joi.number().integer().min(1).required(),
  max_projects: Joi.number().integer().min(1).required(),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "ARCHIVED").default("ACTIVE"),
});

export const updatePlanSchema = Joi.object({
  name: Joi.string().uppercase().min(3).max(30).trim(),
  price: Joi.number().precision(2).min(0),
  duration_days: Joi.number().integer().min(1),
  max_users: Joi.number().integer().min(1),
  max_projects: Joi.number().integer().min(1),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "ARCHIVED"),
}).min(1);

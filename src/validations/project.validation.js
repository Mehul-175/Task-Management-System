import Joi from "joi";

export const createProjectSchema = Joi.object({
  name: Joi.string().min(3).max(100).trim().required(),
  shortName: Joi.string().min(2).max(10).trim().uppercase().required(),
  description: Joi.string().max(500).trim().allow("", null),
  status: Joi.string().valid("PLANNED", "ONGOING", "COMPLETED", "ON_HOLD").default("PLANNED"),
  assigned_users: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).default([]),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().min(3).max(100).trim(),
  shortName: Joi.string().min(2).max(10).trim().uppercase(),
  description: Joi.string().max(500).trim().allow("", null),
  status: Joi.string().valid("PLANNED", "ONGOING", "COMPLETED", "ON_HOLD"),
  assigned_users: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
}).min(1);

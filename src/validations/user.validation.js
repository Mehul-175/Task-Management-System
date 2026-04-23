import Joi from "joi";

export const createSubUserSchema = Joi.object({
    firstname: Joi.string().min(2).max(50).trim().required(),
    lastname: Joi.string().min(2).max(50).trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    // We don't validate password here because the system generates it automatically
});

export const updateSubUserSchema = Joi.object({
    firstname: Joi.string().min(2).max(50).trim(),
    lastname: Joi.string().min(2).max(50).trim(),
    status: Joi.string().valid("ACTIVE", "INACTIVE")
}).min(1);
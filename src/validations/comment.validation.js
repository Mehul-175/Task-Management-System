import Joi from "joi";

export const commentSchema = Joi.object({
    content: Joi.string().min(1).max(1000).trim().required(),
    task_id: Joi.string().hex().length(24).required()
});
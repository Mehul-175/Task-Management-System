import Joi from "joi";

export const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).allow('', null),
  project_id: Joi.string().hex().length(24).required(),
  assignees: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  report_to: Joi.string().hex().length(24),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").default("MEDIUM"),
  status: Joi.string().valid(
    "To-Do", "In-Progress", "Done", "Testing", "QA-Verified", "Re-Open", "Deployment"
  ).default("To-Do")
});

export const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid(
    "To-Do", "In-Progress", "Done", "Testing", "QA-Verified", "Re-Open", "Deployment"
  ).required()
});

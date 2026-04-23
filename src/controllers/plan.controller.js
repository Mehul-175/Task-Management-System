import Plan from "../models/plan.model.js";
import Company from "../models/company.model.js";
import { createPlanSchema, updatePlanSchema } from "../validations/plan.validation.js";

export const createPlan = async (req, res) => {
  try {
    const { value, error } = createPlanSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const activeCount = await Plan.countDocuments({ status: "ACTIVE" });
    if (activeCount >= 5 && value.status === "ACTIVE") {
      return res.status(400).json({ message: "Max 5 active plans allowed. Swap or inactivate one first." });
    }

    const plan = await Plan.create(value);
    return res.status(201).json(plan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const query = req.user.system_role === "SUPER_ADMIN" ? {} : { status: "ACTIVE" };
    const plans = await Plan.find(query).sort({ createdAt: -1 });
    return res.status(200).json(plans);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    return res.status(200).json(plan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { value, error } = updatePlanSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const plan = await Plan.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    return res.status(200).json(plan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const swapPlans = async (req, res) => {
  try {
    const { oldPlanId, newPlanId } = req.body;

    await Promise.all([
      Plan.findByIdAndUpdate(oldPlanId, { status: "INACTIVE" }),
      Plan.findByIdAndUpdate(newPlanId, { status: "ACTIVE" }),
    ]);

    return res.status(200).json({ message: "Swap successful. Old plan is now retiring." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const usage = await Company.countDocuments({ plan_id: req.params.id });
    if (usage > 0) {
      await Plan.findByIdAndUpdate(req.params.id, { status: "INACTIVE" });
      return res.status(409).json({ message: "Plan in use. Set to INACTIVE for auto-archiving." });
    }

    await Plan.findByIdAndUpdate(req.params.id, { status: "ARCHIVED" });
    return res.status(200).json({ message: "Plan archived." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

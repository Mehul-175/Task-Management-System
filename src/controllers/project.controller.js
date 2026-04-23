import Project from "../models/project.model.js";
import Company from "../models/company.model.js";
import { createProjectSchema, updateProjectSchema } from "../validations/project.validation.js";

export const createProject = async (req, res) => {
  try {
    const { value, error } = createProjectSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const companyId = req.user.company_id;
    const company = await Company.findById(companyId).populate("plan_id");

    if (!company || !company.plan_id) {
      return res.status(403).json({ message: "No active plan found for this company." });
    }

    const projectCount = await Project.countDocuments({ company_id: companyId, isDeleted: false });

    if (projectCount >= company.plan_id.max_projects) {
      return res.status(403).json({
        message: `Limit reached. Your ${company.plan_id.name} plan allows only ${company.plan_id.max_projects} projects.`,
      });
    }

    const newProject = await Project.create({
      ...value,
      company_id: companyId,
      created_by: req.user.id,
    });

    return res.status(201).json(newProject);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const query = { company_id: req.user.company_id, isDeleted: false };

    if (req.user.system_role !== "ADMIN") {
      query.assigned_users = req.user.id;
    }

    const projects = await Project.find(query).populate("assigned_users", "firstname lastname email");
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      company_id: req.user.company_id,
      isDeleted: false,
    }).populate("assigned_users", "firstname lastname email");

    if (!project) return res.status(404).json({ message: "Project not found or unauthorized." });

    if (
      req.user.system_role !== "ADMIN" &&
      !project.assigned_users.some((u) => u._id.equals(req.user.id))
    ) {
      return res.status(403).json({ message: "Access denied to this project." });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { value, error } = updateProjectSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company_id: req.user.company_id, isDeleted: false },
      value,
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found." });
    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company_id: req.user.company_id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found." });
    return res.status(200).json({ message: "Project deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

import Project from "../models/project.model.js";
import Company from "../models/company.model.js";
import Task from "../models/task.model.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validations/project.validation.js";

export const createProject = async (req, res) => {
  try {
    const { value, error } = createProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const companyId = req.user.company_id;

    const company = await Company.findById(companyId).populate("plan_id");

    if (!company || !company.plan_id) {
      return res.status(403).json({
        message: "No active plan found for this company.",
      });
    }

    const projectCount = await Project.countDocuments({
      company_id: companyId,
      isDeleted: false,
    });

    if (projectCount >= company.plan_id.max_projects) {
      return res.status(403).json({
        message: `Limit reached. Your ${company.plan_id.name} plan allows only ${company.plan_id.max_projects} projects.`,
      });
    }

    const assignedUsers = Array.from(
      new Set([req.user.id, ...value.assigned_users])
    );

    const newProject = await Project.create({
      ...value,
      company_id: companyId,
      created_by: req.user.id,
      assigned_users: assignedUsers,
    });

    return res.status(201).json(newProject);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getAllProjects = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const userId = req.user.id;

    // ADMIN → see all company projects
    if (req.user.system_role === "ADMIN") {
      const projects = await Project.find({
        company_id: companyId,
        isDeleted: false,
      });

      return res.status(200).json(projects);
    }

    // USER → projects where:
    // 1. assigned in project
    // 2. OR created by user
    // 3. OR has tasks assigned

    // Get project IDs from tasks
    const taskProjectIds = await Task.distinct("project_id", {
      company_id: companyId,
      isDeleted: false,
      $or: [
        { assignees: userId },
        { assign_to: userId },
      ],
    });

    const projects = await Project.find({
      company_id: companyId,
      isDeleted: false,
      $or: [
        { created_by: userId },
        { assigned_users: userId },
        { _id: { $in: taskProjectIds } },
      ],
    });

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

    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized." });

    if (req.user.system_role !== "ADMIN") {
      const isProjectMember = project.assigned_users.some((user) =>
        user._id.equals(req.user.id)
      );

      if (!isProjectMember) {
        const assignedTask = await Task.exists({
          project_id: project._id,
          company_id: req.user.company_id,
          isDeleted: false,
          $or: [
            { assignees: req.user.id },
            { assign_to: req.user.id },
          ],
        });

        if (!assignedTask) {
          return res
            .status(403)
            .json({ message: "Access denied to this project." });
        }
      }
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { value, error } = updateProjectSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company_id: req.user.company_id, isDeleted: false },
      value,
      { new: true },
    );

    if (!project)
      return res.status(404).json({ message: "Project not found." });
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
      { new: true },
    );

    if (!project)
      return res.status(404).json({ message: "Project not found." });
    return res.status(200).json({ message: "Project deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Activity from "../models/activity.model.js"; // We will create this model next
import { createTaskSchema, updateTaskStatusSchema } from "../validations/task.validation.js";

// 1. CREATE TASK (Admin Only)
export const createTask = async (req, res) => {
  try {
    const { value, error } = createTaskSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Find project and increment sequence atomically for ID generation (e.g., CMS-01)
    const project = await Project.findOneAndUpdate(
      { _id: value.project_id, company_id: req.user.company_id, isDeleted: false },
      { $inc: { taskSequence: 1 } },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found." });

    const formattedId = `${project.shortName}-${String(project.taskSequence).padStart(2, '0')}`;

    const task = await Task.create({
      ...value,
      task_id: formattedId,
      company_id: req.user.company_id,
      created_by: req.user.id
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. UPDATE STATUS (Admin & User)
export const updateTaskStatus = async (req, res) => {
  try {
    const { value, error } = updateTaskStatusSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Scoped query: ensures user only updates tasks in their own company
    const task = await Task.findOne({ 
        _id: req.params.id, 
        company_id: req.user.company_id, 
        isDeleted: false 
    });

    if (!task) return res.status(404).json({ message: "Task not found." });

    const oldStatus = task.status;
    task.status = value.status;
    await task.save();

    // Log this change in Activity Tracker
    await Activity.create({
      task_id: task._id,
      performed_by: req.user.id,
      oldStatus,
      newStatus: value.status,
      timestamp: new Date()
    });

    res.status(200).json({ message: "Status updated successfully", currentStatus: task.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. GET PROJECT TASKS (Scoped by Role)
export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const query = { project_id: projectId, company_id: req.user.company_id, isDeleted: false };

    // Strict Requirement: Users only see projects/tasks assigned to them
    if (req.user.system_role !== "ADMIN") {
      query.assign_to = req.user.id;
    }

    const tasks = await Task.find(query)
      .populate("assign_to", "firstname lastname email")
      .populate("report_to", "firstname lastname email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
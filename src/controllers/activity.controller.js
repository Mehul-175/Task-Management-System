import Activity from "../models/activity.model.js";
import Task from "../models/task.model.js";

// GET HISTORY FOR A SPECIFIC TASK
export const getTaskHistory = async (req, res) => {
    try {
        const { taskId } = req.params;

        // 1. Security Check: Does the task belong to the user's company?
        const task = await Task.findOne({ 
            _id: taskId, 
            company_id: req.user.company_id,
            isDeleted: false 
        });

        if (!task) {
            return res.status(404).json({ message: "Task history not found or unauthorized." });
        }

        // 2. Fetch Audit Trail
        const history = await Activity.find({ task_id: taskId })
            .populate("performed_by", "firstname lastname email")
            .sort({ timestamp: -1 }); // Show newest changes first

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: "Error fetching task history", error: error.message });
    }
};
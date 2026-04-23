import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    task_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Task", 
        required: true 
    },
    performed_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    oldStatus: { 
        type: String, 
        required: true 
    },
    newStatus: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

// Indexing for high-performance history retrieval
activitySchema.index({ task_id: 1, timestamp: -1 });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "ACTIVE", "PAYMENT_FAILED", "EXPIRED"],
        default: "PENDING"
    },
    plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
    },
    plan_expiry: {
        type: Date
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })

const Company = mongoose.model("Company", companySchema);

export default Company;
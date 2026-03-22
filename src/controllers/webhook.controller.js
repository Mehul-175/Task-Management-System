import crypto from "crypto";
import Company from "../models/company.model.js";
import User from "../models/user.model.js";
import Plan from "../models/plan.model.js";

export const razorpayWebhook = async (req, res) => {
    try {
        // 1. Verification (Comment this block out for Postman testing)
        /*
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"];
        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if (signature !== digest) {
            return res.status(400).json({ message: "Invalid signature" });
        }
        */

        const { event, payload } = req.body;

        if (event === "payment_link.paid") {
            const { company_id, admin_id, plan_id } = payload.payment_link.entity.notes;

            // Fetch plan to get duration
            const plan = await Plan.findById(plan_id);
            
            // Calculate Expiry
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

            // Update Company and User
            await Company.findByIdAndUpdate(company_id, {
                status: "ACTIVE",
                plan_expiry: expiryDate
            });

            await User.findByIdAndUpdate(admin_id, {
                status: "ACTIVE"
            });

            console.log(`✅ Activation Successful for Company: ${company_id}`);
        }

        res.status(200).json({ status: "ok" });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: "Webhook processing failed" });
    }
};
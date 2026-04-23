import cron from "node-cron";
import Plan from "../models/plan.model.js";
import Company from "../models/company.model.js";

const planCleanup = cron.schedule("0 0 * * *", async () => {
    try {
        // 1. Find plans marked as INACTIVE
        const inactivePlans = await Plan.find({ status: "INACTIVE" });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const plan of inactivePlans) {
            // 2. Check: Is anyone CURRENTLY active?
            const currentUsers = await Company.countDocuments({
                plan_id: plan._id,
                plan_expiry: { $gt: new Date() }
            });

            if (currentUsers === 0) {
                // 3. Grace Period Check: Has anyone used it in the last 30 days?
                // This prevents archiving if a user is just late on their payment.
                const recentlyActive = await Company.findOne({
                    plan_id: plan._id,
                    plan_expiry: { $gt: thirtyDaysAgo }
                });

                if (!recentlyActive) {
                    plan.status = "ARCHIVED";
                    await plan.save();
                    console.log(`[CRON] Plan ${plan.name} safely ARCHIVED.`);
                }
            }
        }
    } catch (error) {
        console.error("Cron Error:", error);
    }
});

export default planCleanup;
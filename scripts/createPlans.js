import mongoose from "mongoose";
import Plan from "../src/models/plan.model.js"; // Adjust path to your model
import "dotenv/config";
const plans = [
  {
    name: "BASIC",
    price: 499,
    duration_days: 30,
    max_users: 5,
    max_projects: 2,
    status: "ACTIVE",
  },
  {
    name: "STANDARD",
    price: 999,
    duration_days: 30,
    max_users: 15,
    max_projects: 10,
    status: "ACTIVE",
  },
  {
    name: "PREMIUM",
    price: 2499,
    duration_days: 90,
    max_users: 50,
    max_projects: 50,
    status: "ACTIVE",
  }
];

const seedPlans = async () => {
  try {
    // 1. Connect to DB (If running script standalone)
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🌱 Connected to MongoDB for seeding...");

    // 2. Clear existing plans to avoid duplicates (Optional but recommended for testing)
    await Plan.deleteMany({});
    console.log("🗑️ Old plans cleared.");

    // 3. Insert new plans
    const createdPlans = await Plan.insertMany(plans);
    console.log("✅ Plans seeded successfully:");
    
    // 4. Log the IDs so you can copy them to Postman immediately
    createdPlans.forEach(plan => {
      console.log(`${plan.name}: ${plan._id}`);
    });

    process.exit(0); // Success exit
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1); // Error exit
  }
};

seedPlans();
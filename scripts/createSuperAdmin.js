import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcryptjs";
import User from "../src/models/user.model.js";

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const password = await bcrypt.hash("superadmin123", 10);

    await User.create({
      username: "superadmin",
      email: "admin@system.com",
      password,
      firstname: "System",
      lastname: "Admin",
      system_role: "SUPER_ADMIN",
      status: "ACTIVE",
    });

    console.log("Super Admin created");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createSuperAdmin();

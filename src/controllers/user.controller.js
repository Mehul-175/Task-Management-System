import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendWelcomeEmail } from "../utils/mailer.js";
import { createSubUserSchema, updateSubUserSchema } from "../validations/user.validation.js";

const generateUsername = async (firstname, lastname) => {
  const base = `${firstname}${lastname}`.toLowerCase().replace(/\s+/g, "");
  const random = crypto.randomBytes(2).toString("hex");
  return `${base}${random}`;
};

export const createSubUser = async (req, res) => {
  try {
    const { value, error } = createSubUserSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const adminCompanyId = req.user.company_id;
    const company = await Company.findById(adminCompanyId).populate("plan_id");

    if (!company || !company.plan_id) {
      return res.status(403).json({ message: "No active subscription plan found." });
    }

    const currentUserCount = await User.countDocuments({
      company_id: adminCompanyId,
      isDeleted: false,
    });

    if (currentUserCount >= company.plan_id.max_users) {
      return res.status(403).json({
        message: `User limit reached. Your ${company.plan_id.name} plan allows a maximum of ${company.plan_id.max_users} users.`,
      });
    }

    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) return res.status(400).json({ message: "Email is already registered." });

    const tempPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const username = await generateUsername(value.firstname, value.lastname);

    const newUser = await User.create({
      ...value,
      username,
      password: hashedPassword,
      company_id: adminCompanyId,
      system_role: "USER",
      status: "ACTIVE",
      isDeleted: false,
    });

    try {
      await sendWelcomeEmail(value.email, tempPassword, value.firstname);
    } catch (mailErr) {
      console.error("User created but Welcome Email failed:", mailErr.message);
    }

    return res.status(201).json({
      message: "User created successfully.",
      user: { id: newUser._id, email: newUser.email, username: newUser.username },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getCompanyUsers = async (req, res) => {
  try {
    const users = await User.find({
      company_id: req.user.company_id,
      isDeleted: false,
      system_role: "USER",
    }).select("-password");

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSubUser = async (req, res) => {
  try {
    const { value, error } = updateSubUserSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id, company_id: req.user.company_id, isDeleted: false, system_role: "USER" },
      value,
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found." });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSubUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, company_id: req.user.company_id, isDeleted: false, system_role: "USER" },
      { isDeleted: true, status: "INACTIVE" },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found or already deleted." });
    return res.status(200).json({ message: "User has been deactivated." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

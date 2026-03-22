import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import Plan from "../models/plan.model.js";
import bcrypt from "bcryptjs";
import Razorpay from "razorpay";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/generateTokens.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

const REFRESH_TTL = Number(process.env.REFRESH_TTL) * 24 * 60 * 60 * 1000;
const razorpay = new Razorpay({
  key_id: process.env.RAZOR_KEY,
  key_secret: process.env.RAZOR_SECRET,
});
export const register = async (req, res) => {
  try {
    const { value, error } = registerSchema.validate(req.body);

    if (error) {
      return res
        .status(422)
        .json({ message: "Invalid Input", details: error.details[0].message });
    }

    const { adminDetails: admin, companyDetails: company, planId } = value;

    //Checking conflict
    const existingEmail = await User.findOne({ email: admin.email });
    if (existingEmail) {
      return res
        .status(409)
        .json({ message: "This email is already registered" });
    }
    const existingUser = await User.findOne({ username: admin.username });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "This username is already taken" });
    }
    const existingCompany = await Company.findOne({ name: company.name });
    if (existingCompany) {
      return res
        .status(409)
        .json({ message: "Company with this name is already registered" });
    }

    const selectedPlan = await Plan.findById(planId);
    if (!selectedPlan) {
      return res.status(404).json({ message: "Selected plan not found" });
    }

    //Hashing password
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    //Create admin and his company
    const newUser = await User.create({
      username: admin.username,
      email: admin.email,
      firstname: admin.firstname,
      middlename: admin.middlename,
      lastname: admin.lastname,
      password: hashedPassword,
      status: "INACTIVE",
      system_role: "ADMIN",
    });

    const newCompany = await Company.create({
      name: company.name,
      created_by: newUser._id,
      plan_id: planId,
      status: "PENDING",
    });

    newUser.company_id = newCompany._id;
    await newUser.save();

    //Payment for plan using Razorpay

    const paymentLink = await razorpay.paymentLink.create({
      amount: selectedPlan.price * 100, // Amount in paise
      currency: "INR",
      accept_partial: false,
      description: `Subscription for ${selectedPlan.name} plan`,
      customer: {
        name: `${newUser.firstname} ${newUser.lastname}`,
        email: newUser.email,
      },
      notify: { email: true },
      reminder_enable: true,

      notes: {
        company_id: newCompany._id.toString(),
        admin_id: newUser._id.toString(),
        plan_id: selectedPlan._id.toString(),
      },
      callback_url: "http://localhost:5173/payment-success",
      callback_method: "get",
    });

    //Generate the tokens
    const accessToken = generateAccessToken({
      id: newUser.id,
      role: newUser.system_role,
      jobrole: newUser.jobrole_id,
      company: newUser.company_id,
    });
    const refreshToken = generateRefreshToken();

    //Hash refresh token
    const hashedToken = hashToken(refreshToken);
    // Update user in DB
    newUser.refreshtoken = hashedToken;
    newUser.refresh_expiry = Date.now() + Number(process.env.REFRESH_TTL);
    await newUser.save();

    //Set cookies
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
    });

    res.status(201).json({
      message: "User created Successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.system_role,
        jobrole: newUser.jobrole_id,
        company: newUser.company_id,
      },
      accessToken,
      checkout_url: paymentLink.short_url,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating the user", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { value, error } = loginSchema.validate(req.body);

    if (error) {
      return res
        .status(422)
        .json({ message: "Invalid Input", details: error.details[0].message });
    }
    const { username, email, password } = value;

    // Finds a user where (username matches) OR (email matches)
    const user = await User.findOne({
      $or: [{ username }, { email }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //check if the user is active
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account not active" });
    }


    //check the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //Generate the tokens
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.system_role,
      jobrole: user.jobrole_id,
      company: user.company_id,
    });
    const refreshToken = generateRefreshToken();

    //Hash refresh token
    const hashedToken = hashToken(refreshToken);
    // Update user in DB
    user.refreshtoken = hashedToken;
    user.refresh_expiry = Date.now() + Number(process.env.REFRESH_TTL);
    await user.save();

    //Set cookies
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "api/auth/refresh",
    });

    res.status(200).json({
      message: "User logged in Successfully",
      user: {
        id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.system_role,
        jobrole: user.jobrole_id,
        company: user.company_id,
      },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error signing user" });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const hash = hashToken(token);

    const user = await User.findOne({ refreshtoken: hash });

    if (!user) {
      res.clearCookie("refreshToken", { path: "/auth/refresh" });
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    if (user.refresh_expiry < Date.now()) {
      res.clearCookie("refreshToken", { path: "/auth/refresh" });
      return res.status(403).json({ message: "Refresh token expired" });
    }

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.system_role,
      jobrole: user.jobrole_id,
      company: user.company_id,
    });

    const newRefreshToken = generateRefreshToken();

    user.refreshtoken = hashToken(newRefreshToken);
    user.refresh_expiry = Date.now() + REFRESH_TTL;

    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "api/auth/refresh",
    });

    res.json({
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error refreshing token",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, {
      $unset: {
        refreshtoken: 1,
        refresh_expiry: 1,
      },
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

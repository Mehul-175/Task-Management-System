import User from "../models/user.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/generateTokens.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

const REFRESH_TTL = Number(process.env.REFRESH_TTL) * 24 * 60 * 60 * 1000;
export const register = async (req, res) => {
  try {
    const { value, error } = registerSchema.validate(req.body);

    if (error) {
      return res
        .status(422)
        .json({ message: "Invalid Input", details: error.details[0].message });
    }

    const { username, firstname, middlename, lastname, email, password } =
      value;

    //Checking conflict
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(409)
        .json({ message: "This email is already registered" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "This username is already taken" });
    }

    //Hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      firstname,
      middlename,
      lastname,
      password: hashedPassword,
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
      path: "/auth/refresh",
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
    });
  } catch (error) {
    return res.status(500).json({ message: "Error creating the user", error });
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
      path: "/auth/refresh",
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

    const hash = hashToken(token);

    const user = await User.findOne({
      refreshtoken: hash,
    });

    if (!user) {
      return res.status(403).send("invalid refresh token");
    }

    if (user.refresh_expiry < Date.now()) {
      return res.status(403).send("expired refresh token");
    }

    const newAccessToken = generateAccessToken({
      id: user.id,
      role: user.system_role,
      jobrole: user.jobrole_id,
      company: user.company_id,
    });
    const newRefreshToken = generateRefreshToken();

    user.refreshtoken = hashToken(newRefreshToken);
    user.refresh_expiry = Date.now() + REFRESH_TTL;
    user.save();

    //Set cookies
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
    });

    res.status(200).json({
      message: "User logged in Successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Error refreshing token" });
  }
};

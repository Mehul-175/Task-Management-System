import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Username is required"],
    },
    firstname: {
      type: String,
      required: [true, "First Name is required"],
      trim: true,
    },
    middlename: {
      type: String,
      trim: true
    },
    lastname: {
      type: String,
      trim: true,
      required: [true, "Last Name is required"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    system_role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "USER"],
      default: "USER",
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true
    },
    jobrole_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRole",
    },
    refreshtoken: {
        type: String,
        select: false,
        index: true
    },
    refresh_expiry: {
      type: Date,
      select: false
    }
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;

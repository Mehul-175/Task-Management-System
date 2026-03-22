import mongoose from "mongoose";


const paymentSchema = new mongoose.Schema({
    company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true
  },

  razorpay_payment_id: String,

  razorpay_order_id: String,

  razorpay_signature: String,

  amount: Number,

  status: {
    type: String,
    enum: ["CREATED", "SUCCESS", "FAILED"],
    default: "CREATED"
  }

}, { timestamps: true });


const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
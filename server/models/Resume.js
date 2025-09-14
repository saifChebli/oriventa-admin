import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    birthDate: { type: Date, required: true },

    exp1: { type: String, required: true },
    exp2: { type: String },
    exp3: { type: String },

    languages: { type: String, required: true },
    diplomas: { type: String, required: true },
    stages: { type: String },
    associations: { type: String },
    skills: { type: String, required: true },

    cvType: {
      type: String,
      enum: ["Français", "Anglais"],
      required: true,
    },

    remarks: { type: String },

    paymentReceipt: { type: String, required: true },
    status: { type: String, enum: ["pending","traite" ,"accepted", "refuse" , "comment"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);

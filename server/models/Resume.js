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

   cvTypes: {
      europass: [{ type: String }],
      allemand: [{ type: String }],
      italian: [{ type: String }],
      canadien: [{ type: String }],
      golfe: [{ type: String }],
    },

    remarks: { type: String },

    paymentReceipt: { type: String, required: true },
    status: { type: String, enum: ["pending" ,"accepted", "refuse" ], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);

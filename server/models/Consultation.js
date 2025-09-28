import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    jobDomain: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
      enum: ["0-1", "1-3", "3-5", "5-10", "10+"], // restrict to form options
    },
    destination: {
      type: String,
    },
    jobType: {
      type: String,
    },
    reason: {
      type: String,
    },
    extra: {
      type: String,
    },
    consent: {
      type: Boolean,
      default: false,
    },
    status: {
    type: String,
    enum: ['pending', 'confirmed', 'decline' ,'comment' , 'unreachable'],
    default: 'pending'
  },
   comment: { type: [
        {
          text: { type: String },
          date: { type: Date, default: Date.now },
          writer : { type: mongoose.Schema.Types.ObjectId , ref : "User"  }
        }
      ] , default: []  },

  },
  { timestamps: true }
);

export default mongoose.model("Consultation", consultationSchema);

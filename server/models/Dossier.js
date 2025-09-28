import mongoose from "mongoose";

const dossierSchema = new mongoose.Schema(
  {
    dossierNumber: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    birthDate: { type: Date, required: true },
    jobType: { type: String, required: true },
    hasCV: { type: String, enum: ["Oui", "Non"], required: true },

    cvFile: { type: String }, // chemin du fichier
    experiences: { type: String, required: true },
    exp1: { type: String },
    exp2: { type: String },
    exp3: { type: String },
    attestationsTravail: { type: String },
    languages: { type: String, required: true },
    diplomas: { type: String, required: true },
    diplomasFiles: { type: String },
    stages: { type: String, required: true },
    attestationsStage: { type: String },
    associations: { type: String, required: true },
    skills: { type: String, required: true },
    remarks: { type: String },
    paymentReceipt: { type: String },
    status: { type: String, enum: ["pending","traite" ,"accepted", "refuse" , "comment"], default: "pending" },
    comment: { type: [
      {
        text: { type: String },
        date: { type: Date, default: Date.now },
        writer : { type: mongoose.Schema.Types.ObjectId , ref : "User" }
      }
    ] , default: []  },
    
  },
  { timestamps: true }
);

export default mongoose.model("Dossier", dossierSchema);

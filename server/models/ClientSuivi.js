import mongoose from 'mongoose';

const clientSuiviSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    consultationValidated: { type: Boolean, default: false },
    paymentReceived: { type: Boolean, default: false },
    destination: { type: String, default: '' },
    cvLetterCreated: { type: Boolean, default: false },
    // Backward-compat single file fields (kept for existing data)
    cvFile: { type: String, default: '' },
    lmFile: { type: String, default: '' },
    // New multi-file support
    cvFiles: { type: [String], default: [] },
    lmFiles: { type: [String], default: [] },
    applicationNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('ClientSuivi', clientSuiviSchema);

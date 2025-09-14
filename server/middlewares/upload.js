import multer from "multer";
import path from "path";
import fs from "fs";

// Storage dynamique
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dossierNumber = req.body.dossierNumber || "unknown";
    const fullName = req.body.fullName?.replace(/\s+/g, "_") || "unknown";

    const uploadPath = path.join("uploads", `${dossierNumber}_${fullName}`);

    // Crée le dossier si inexistant
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Middleware Multer configuré
const upload = multer({ storage });

export default upload;

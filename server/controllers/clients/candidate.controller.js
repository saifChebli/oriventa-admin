import Dossier from "../../models/Dossier.js";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import archiver from "archiver";



export const getCandidates = async (req, res) => {
    try {
        const candidates = await Dossier.find().sort({ createdAt: -1 }).populate('comment.writer' , 'name email role')
        return res.status(200).json(candidates);
    } catch (error) {
        return res.status(500).json({ message: "Error when try to get candidates" });
    }
};

export const addCandidate = async (req, res) => {
    try {
    const data = req.body;
    const dossierNumber = data.dossierNumber;
    const fullName = data.fullName?.replace(/\s+/g, "_");
    const basePath = path.join("uploads", `${dossierNumber}_${fullName}`);
    const dossier = new Dossier({
      ...data,
      passportPhoto: req.files?.passportPhoto?.[0]
        ? path.join(basePath, req.files.passportPhoto[0].filename)
        : null,
      cvFile: req.files?.cvFile?.[0] ? path.join(basePath, req.files.cvFile[0].filename) : null,
      photoPersonne: req.files?.photoPersonne?.[0]
        ? path.join(basePath, req.files.photoPersonne[0].filename)
        : null,
      attestationsTravail: req.files?.attestationsTravail?.[0]
        ? path.join(basePath, req.files.attestationsTravail[0].filename)
        : null,
      diplomasFiles: req.files?.diplomasFiles?.[0]
        ? path.join(basePath, req.files.diplomasFiles[0].filename)
        : null,
      attestationsStage: req.files?.attestationsStage?.[0]
        ? path.join(basePath, req.files.attestationsStage[0].filename)
        : null,
      paymentReceipt: req.files?.paymentReceipt?.[0]
        ? path.join(basePath, req.files.paymentReceipt[0].filename)
        : null,
    });

    await dossier.save();
    res.status(201).json({ message: "✅ Dossier créé avec succès", dossier });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Erreur serveur" });
  }
}

export const updateCandidateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Dossier.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update consultation status" });
  }
};


export const addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user.id;
  try {
     const dossier = await Dossier.findById(id)
        const comment = dossier.comment
    const updated = await Dossier.findByIdAndUpdate(
      id,
      { comment : [...comment, { text , writer: userId }] },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to update dossier status" });
  }
};


export const downloadFolder = async (req, res) => {
  try {
    const { dossierNumber, fullName } = req.params;

    // Decode and sanitize fullName to match folder naming convention used on upload
    const rawFullName = decodeURIComponent(fullName || "");
    const safeFullName = rawFullName
      .replace(/[\\/]/g, "_")      // prevent path traversal
      .replace(/\s+/g, "_")         // spaces to underscores (matches addCandidate)
      .trim();

    const folderPath = path.join("uploads", `${dossierNumber}_${safeFullName}`);

    // Check folder existence
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // ZIP filename
    const zipFileName = `${dossierNumber}_${safeFullName}.zip`;

    // Set response headers
    res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);
    res.setHeader("Content-Type", "application/zip");

    // Create archive and pipe to response
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error generating ZIP file' });
      } else {
        res.end();
      }
    });
    archive.pipe(res);

    // Add entire folder
    archive.directory(folderPath, false);

    // Finalize ZIP
    archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating ZIP file" });
  }
}

export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    await Dossier.findByIdAndDelete(id);
    res.status(200).json({ message: "Dossier deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete dossier" });
  }
};
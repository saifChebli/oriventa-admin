import Dossier from "../../models/Dossier.js";
import express from "express";
import multer from "multer";
import path from "path";




export const getCandidates = async (req, res) => {
    try {
        const candidates = await Dossier.find().sort({ createdAt: -1 });
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
      cvFile: req.files?.cvFile?.[0] ? path.join(basePath, req.files.cvFile[0].filename) : null,
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
    const updated = await Dossier.findByIdAndUpdate(
      id,
      { comment : [...comment, { text , writer: userId }] },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update consultation status" });
  }
};
import Resume from "../../models/Resume.js";
import fs from "fs";
import path from "path";



export const getResumes = async (req,res) => {
    try {
        const resumes = await Resume.find().sort({ createdAt: -1 });
        res.status(200).json(resumes)

    } catch (error) {
        res.status(500).json({ message: "Error when try to get resumes" });
    }
}

export const addResume = async (req,res) => {
     try {
    const data = req.body;
    const paymentReceipt = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    let cvTypes = {};
    try {
      cvTypes = typeof data.cvTypes === 'string' ? JSON.parse(data.cvTypes) : data.cvTypes;
    } catch (e) {
      cvTypes = {
        europass: [],
        allemand: [],
        canadien: [],
        golfe: [],
      };
    }


    const newRequest = new Resume({
      ...data,
      cvTypes,
      paymentReceipt,
    });

    await newRequest.save();
    res.status(201).json({ message: "CV request submitted successfully", request: newRequest });
  } catch (err) {
    res.status(500).json({ message: "Error saving request", error: err.message });
  }
}


export const updateResumeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Resume.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update consultation status" });
  }
};


export const downloadFile = async (req, res) => {
  try {
    let { filename } = req.params;

    // Extract only the actual filename (in case a full path was sent)
    filename = filename.split("/").pop();

    const filePath = path.join("uploads", "receipts", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    await Resume.findByIdAndDelete(id);
    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete resume" });
  }
};

export const downloadResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    const payment = resume.paymentReceipt;
    if (!payment) return res.status(404).json({ message: "No payment receipt for this resume" });

    // Normalize stored path: remove leading slash if present
    let relative = payment;
    if (relative.startsWith("/")) relative = relative.slice(1);

    // If stored path already contains uploads, use it; otherwise assume receipts
    let filePath = path.join('.', relative);

    // If file doesn't exist, try the receipts folder with the basename
    if (!fs.existsSync(filePath)) {
      const filename = path.basename(relative);
      filePath = path.join('uploads', 'receipts', filename);
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filename = path.basename(filePath);
    return res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
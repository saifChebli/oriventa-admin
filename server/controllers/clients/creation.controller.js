import Resume from "../../models/Resume.js";




export const getResumes = async (req,res) => {
    try {
        const resumes = await Resume.find();
        res.status(200).json(resumes).sort({ createdAt: -1 });

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
    const { filename } = req.params;
    const filePath = path.join("uploads", "receipts", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Send file for download
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
}


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
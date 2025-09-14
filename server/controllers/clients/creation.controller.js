import Resume from "../../models/Resume.js";




export const getResumes = async (req,res) => {
    try {
        const resumes = await Resume.find();
        return res.status(200).json(resumes).sort({ createdAt: -1 });

    } catch (error) {
       return res.status(500).json({ message: "Error when try to get resumes" });
    }
}

export const addResume = async (req,res) => {
     try {
    const data = req.body;
    const paymentReceipt = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    const newRequest = new Resume({
      ...data,
      paymentReceipt,
    });

    await newRequest.save();
    res.status(201).json({ message: "CV request submitted successfully", request: newRequest });
  } catch (err) {
    res.status(500).json({ message: "Error saving request", error: err.message });
  }
}
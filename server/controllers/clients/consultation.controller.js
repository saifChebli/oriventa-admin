import Consultation from "../../models/Consultation.js"




export const getConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find().sort({ createdAt: -1 })
        return res.status(200).json(consultations)
    } catch (error) {
        return res.status(500).json({ message: "Error when try to get consultations" });

    }
}

export const addConsultation = async (req, res) => {
    const { fullName , phone , whatsapp , address , jobDomain , experience , destination ,reason ,jobType , extra } = req.body
    try {
        const consultation = await Consultation.create({ fullName , phone , whatsapp , address , jobDomain , experience, destination ,reason ,jobType , extra })
        res.status(201).json({message : "Consultation added successfully" , consultation});
    } catch (error) {
        return res.status(500).json({ message: "Error when try to add consultation" });
    }
}

export const updateConsultationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Consultation.findByIdAndUpdate(
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
    const consultation = await Consultation.findById(id)
    const comment = consultation.comment
    const updated = await Consultation.findByIdAndUpdate(
      id,
      { comment : [...comment,{ text , writer: userId }] },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to update consultation status" });
  }
};


export const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    await Consultation.findByIdAndDelete(id);
    res.status(200).json({ message: "Consultation deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete consultation" });
  }
};
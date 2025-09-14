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
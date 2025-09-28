import Contact from "../../models/Contact.js";




export const addContact = async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        const savedContact = await newContact.save();
        res.status(201).json(savedContact);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const updateContactStatus = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        contact.isViewed = req.body.isViewed;
        const updatedContact = await contact.save();
        res.status(200).json(updatedContact);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
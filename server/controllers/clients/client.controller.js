import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Create a new client account (only managers can do this)
export const createClientAccount = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Client with this email already exists" });
    }

    const client = await User.create({
      email,
      password,
      role: "client",
    });

    res.status(201).json({
      message: "Client account created successfully",
      client: {
        id: client._id,
        email: client.email,
        role: client.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error when trying to create client account" });
  }
};

// Get all client accounts (for managers to view)
export const getAllClients = async (req, res) => {
  try {
    const clients = await User.find({ role: "client" }).select("-password");
    res.status(200).json(clients);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error when trying to get client accounts" });
  }
};

// Get client profile (for client to view their own profile)
export const getClientProfile = async (req, res) => {
  const clientId = req.user.id;

  try {
    const client = await User.findById(clientId).select("-password");
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json(client);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error when trying to get client profile" });
  }
};

// Update client profile (for client to update their own profile)
export const updateClientProfile = async (req, res) => {
  const { id } = req.params;
  const { email, role, password } = req.body;

  try {
    const updateData = { email, role };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await User.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// Delete client account (for managers to delete client accounts)
export const deleteClientAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await User.findById(id);
    if (!id) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (client.role !== "client") {
      return res.status(400).json({ message: "User is not a client" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Client account deleted successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error when trying to delete client account" });
  }
};


export const getClientByRole = async (req, res) => {
  try {
    const clients = await User.find({ role: "client" }).select("-password");
    res.status(200).json(clients);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error when trying to get client accounts" });
  }
};
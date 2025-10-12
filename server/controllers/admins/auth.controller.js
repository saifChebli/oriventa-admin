import User from "../../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export const createAccount = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.create({
      email,
      password,  // plain text, will be hashed by schema
      role,
    });
    console.log(user)
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error when trying to create user" });
  }
};


export const login = async (req , res) => {
    const { email , password } = req.body
    try {
      const user = await User.findOne({email}).select("+password")
      if(!user){
        return res.status(404).json({message : "User not found"})
      }

        const isMatch = await bcrypt.compare(password , user.password)
        if(!isMatch){
            return res.status(401).json({message : "Invalid credentials"})
        }
        
            const tokenData = {
              id:  user.id,
              email: user.email,
              role: user.role,
            };
            console.log(tokenData)
        
            const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        
             res.cookie("token", token, {
              httpOnly: true,
              sameSite: "strict",
              maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
        
            const response = res.status(200).json({
              message: "Login successful",
              role: user.role,
              success: true,
            });
        
        
            return response;
        
        
    } catch (error) {
      console.log(error)
        return res.status(500).json({ message: "Error when try to login" });
    }
}

export const getAccount = async (req, res) => {
  const id = req.user.id;
  try {
    const user = await User.findOne({
      _id: id,      
    });
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error when try to get user" });
  }
};

export const getAllAccounts = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error when try to get all users" });
  }
};

export const logout = async(req, res) => {
    try {

      res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
     });
        const response = res.status(200).json(
            {
                message: "Logout successful",
                success: true,
            }
        )

        return response;
        
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
    
}

export const updateAccount = async (req, res) => {
  const id = req.user.id;
  const { email, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only allow managers to update via this endpoint (per requirement)
    if (user.role !== "manager") {
      return res.status(403).json({ message: "Only managers can update their account via this endpoint" });
    }

    // Update email if provided and unique
    if (email) {
      const existing = await User.findOne({ email });
      if (existing && existing.id !== id) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Update password flow
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change password" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      user.password = newPassword; // will be hashed by pre-save hook
    }

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    return res.status(200).json(userObj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error when try to update user" });
  }
};
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
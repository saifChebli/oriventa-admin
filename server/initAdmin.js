import User from "./models/User.js";

export const initAdmin = async () => {
  const existingAdmin = await User.findOne({ role: "manager" });
  if (!existingAdmin) {
    await User.create({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "manager",
    });
    console.log("✅ Initial manager created:", process.env.ADMIN_EMAIL);
  }
};

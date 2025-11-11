import User from "../models/User.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "uploads");

export const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: "Unauthorized" });
    const body = req.body || {};

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update name
    if (typeof body.name !== "undefined" && body.name !== null) {
      user.name = body.name;
    }

    // Handle avatar upload
    if (req.file) {
      try {
        if (user.avatarUrl) {
          const prevFilename = path.basename(user.avatarUrl);
          const prevPath = path.join(uploadsDir, prevFilename);
          if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
        }
      } catch (err) {
        console.warn("Failed to delete previous avatar:", err.message);
      }
      user.avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    // Handle remove avatar flag
    if (body.removeAvatar === "true" || body.removeAvatar === true) {
      if (user.avatarUrl) {
        try {
          const prevFilename = path.basename(user.avatarUrl);
          const prevPath = path.join(uploadsDir, prevFilename);
          if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
        } catch (err) {
          console.warn("Failed to delete avatar on remove:", err.message);
        }
      }
      user.avatarUrl = undefined;
    }

    // Handle password change
    const currentPassword = body.currentPassword;
    const newPassword = body.newPassword;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password required to change password" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    return res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Update failed" });
  }
};

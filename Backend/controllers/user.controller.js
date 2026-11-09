import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get currentUser: ${error.message}` });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name && typeof name === "string") {
            const trimmedName = name.trim();
            if (trimmedName.length < 2) {
                return res.status(400).json({ message: "Name must be at least 2 characters long." });
            }
            user.name = trimmedName;
        }

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to set a new password." });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Current password does not match." });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters long." });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits,
            }
        });
    } catch (error) {
        return res.status(500).json({ message: `Failed to update profile: ${error.message}` });
    }
};

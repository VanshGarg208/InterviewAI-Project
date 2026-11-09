import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"

export const register = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: "Database connection is currently unavailable. Please try again shortly." })
        }

        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide all required fields" })
        }

        const normalizedEmail = email.toLowerCase().trim();

        let user = await User.findOne({ email: normalizedEmail })
        if (user) {
            return res.status(400).json({ message: "User already exists with this email" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        })

        const token = await genToken(user._id)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits
        })

    } catch (error) {
        return res.status(500).json({ message: `Registration error: ${error.message}` })
    }
}

export const login = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: "Database connection is currently unavailable. Please try again shortly." })
        }

        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" })
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail })
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const token = await genToken(user._id)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits
        })

    } catch (error) {
        return res.status(500).json({ message: `Login error: ${error.message}` })
    }
}

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })
        return res.status(200).json({ message: "LogOut Successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Logout error: ${error.message}` })
    }
}

export const getMe = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: "Database connection unavailable" })
        }
        const user = await User.findById(req.userId).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `Get user error: ${error.message}` })
    }
}
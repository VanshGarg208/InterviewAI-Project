import mongoose from "mongoose";

export const requireDb = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "Database connection is currently unavailable. Please ensure MongoDB is running and network access is whitelisted.",
            dbState: mongoose.connection.readyState
        });
    }
    next();
};

export default requireDb;


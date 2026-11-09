import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        // Fallback: check Authorization header (e.g. Bearer <token>)
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "No authentication token provided" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment variables");
            return res.status(500).json({ message: "Server authentication configuration error" });
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!verifyToken || !verifyToken.userId) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        req.userId = verifyToken.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: `Authentication error: ${error.message}` });
    }
};

export default isAuth;

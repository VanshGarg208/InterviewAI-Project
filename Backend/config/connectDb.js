import "./env.js";
import dns from "node:dns";
import mongoose from "mongoose";

// Force Node.js to use public DNS servers (Google & Cloudflare) to resolve MongoDB Atlas SRV records.
// Windows system DNS sometimes fails to resolve _mongodb._tcp SRV records from Node.js even when
// nslookup/Compass work fine. This is the safe fix — no TLS changes, no credential exposure.
try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
    console.log("DNS configured to use public resolvers (8.8.8.8, 1.1.1.1)");
} catch (error) {
    console.warn("Custom DNS setServers warning:", error.message);
}

const connectDb = async () => {
    const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;
    if (!mongoUrl) {
        console.error("❌ MongoDB Connection Error: MONGODB_URL is not set in your .env file.");
        console.error("   → Add MONGODB_URL=mongodb+srv://... to Backend/.env");
        return;
    }

    // Mask password in logs for security
    const maskedUrl = mongoUrl.replace(/:([^@]+)@/, ":***@");
    console.log(`📡 Connecting to MongoDB Atlas: ${maskedUrl}`);

    try {
        await mongoose.connect(mongoUrl, {
            dbName: "InterviewAI",
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 15000,
            maxPoolSize: 10,
        });
        console.log("✅ MongoDB Database Connected Successfully → InterviewAI");
    } catch (error) {
        // Provide actionable error messages for the most common Atlas issues
        const msg = error.message || "";
        if (
            msg.includes("IP") ||
            msg.includes("whitelist") ||
            msg.includes("not authorized") ||
            msg.includes("Could not connect to any servers")
        ) {
            console.error("❌ MongoDB Connection Failed — IP NOT WHITELISTED ON ATLAS");
            console.error("   ╔══════════════════════════════════════════════════════╗");
            console.error("   ║  ACTION REQUIRED: Add your IP to MongoDB Atlas       ║");
            console.error("   ╚══════════════════════════════════════════════════════╝");
            console.error("   1. Go to: https://cloud.mongodb.com");
            console.error("   2. Select your project → Security → Network Access");
            console.error("   3. Click '+ ADD IP ADDRESS'");
            console.error("   4. For development: click 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0)");
            console.error("      OR enter your current IP: (run 'curl ifconfig.me' to find it)");
            console.error("   5. Click Confirm and wait ~30 seconds for it to apply");
        } else if (msg.includes("Authentication failed") || msg.includes("bad auth")) {
            console.error("❌ MongoDB Connection Failed — WRONG USERNAME OR PASSWORD");
            console.error("   → Check MONGODB_URL credentials in Backend/.env");
        } else if (msg.includes("ECONNREFUSED") || msg.includes("querySrv")) {
            console.error("❌ MongoDB Connection Failed — DNS/Network issue");
            console.error("   → Verify your internet connection and Atlas cluster status");
            console.error("   → Check that your cluster hostname is correct in MONGODB_URL");
        } else {
            console.error(`❌ MongoDB Connection Error: ${error.message}`);
        }
        console.error("   Full error:", error.message);
    }
};

// Log Mongoose connection state changes
mongoose.connection.on("connected", () => {
    console.log("🔗 Mongoose: Connection established");
});

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  Mongoose: Connection lost");
});

mongoose.connection.on("error", (err) => {
    console.error("❌ Mongoose connection error:", err.message);
});

export default connectDb;
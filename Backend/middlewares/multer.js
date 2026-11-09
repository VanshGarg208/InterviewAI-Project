import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the upload directory exists
const uploadDir = path.resolve(__dirname, "../public");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Sanitize original name to prevent directory traversal or special characters
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${Date.now()}-${safeName}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isPdfExt = ext === ".pdf";
    const isPdfMime = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf";

    if (isPdfExt && isPdfMime) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF documents are allowed."), false);
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter,
});

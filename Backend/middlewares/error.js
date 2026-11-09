import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, '../logs/error.log');

// Ensure log directory exists
const logDir = path.dirname(logFilePath);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const errorHandler = (err, req, res, next) => {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] [Error] ${err.name}: ${err.message}\nStack: ${err.stack}\n`;

    // Log the error for the developer
    console.error(`[${timestamp}] [Error] ${err.name}: ${err.message}`);
    console.error(err.stack);

    // Log to file
    fs.appendFile(logFilePath, errorMessage, (writeErr) => {
        if (writeErr) console.error('Failed to write to error log:', writeErr);
    });

    // Determine status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        // Include stack trace only in development
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export default errorHandler;

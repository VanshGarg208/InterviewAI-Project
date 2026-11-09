import "../config/env.js";
import axios from "axios";

export const askAi = async (messages) => {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.");
        }

        const rawApiKey = process.env.OPENROUTER_API_KEY;
        const apiKey = rawApiKey ? rawApiKey.trim() : "";

        // Check if the API key is missing or is the default placeholder
        const isPlaceholder = !apiKey || 
            apiKey === "your_openrouter_api_key" || 
            apiKey === "sk-or-v1-your-openrouter-api-key" || 
            apiKey.includes("your-openrouter-api-key");

        if (isPlaceholder) {
            const missingMsg = "OpenRouter API key is not configured. Please add a valid OPENROUTER_API_KEY in Backend/.env (get one at https://openrouter.ai/keys).";
            console.error(`[OpenRouter Service] Configuration Error: ${missingMsg}`);
            throw new Error(missingMsg);
        }

        const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: model,
                messages: messages
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "HTTP-Referer": frontendUrl,
                    "X-Title": "InterviewAI Platform",
                    "Content-Type": "application/json"
                },
                timeout: 35000 // 35-second timeout to prevent hanging requests
            }
        );

        const content = response?.data?.choices?.[0]?.message?.content;

        if (!content || !content.trim()) {
            throw new Error("AI returned empty response.");
        }

        return content;
    } catch (error) {
        // If this is our own validation error, propagate directly
        if (!error.response && !error.request && error.message.includes("OpenRouter API key is not configured")) {
            throw error;
        }

        const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

        // Handle network timeout
        if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
            console.error(`[OpenRouter Service] Request timed out after 35s [Model: ${model}]`);
            throw new Error("AI request timed out. OpenRouter took too long to respond. Please try again.");
        }

        // Handle HTTP response errors from OpenRouter
        if (error.response) {
            const status = error.response.status;
            const apiErrorMsg = error.response.data?.error?.message || error.response.data?.message || "Unknown provider error";

            // Safe diagnostic logging: status and message, NEVER authorization headers or secrets
            console.error(`[OpenRouter Service] API Error (Status ${status}): ${apiErrorMsg} [Model: ${model}]`);

            switch (status) {
                case 401:
                    throw new Error("Invalid or unauthorized OpenRouter API key. Please check your OPENROUTER_API_KEY in Backend/.env.");
                case 402:
                    throw new Error("Insufficient OpenRouter credits. Please add balance at openrouter.ai/credits or set OPENROUTER_MODEL to a free model (e.g. meta-llama/llama-3.3-70b-instruct:free) in Backend/.env.");
                case 403:
                    throw new Error(`OpenRouter access forbidden. Your API key does not have permission for model '${model}'.`);
                case 404:
                    throw new Error(`The selected AI model '${model}' is not available on OpenRouter. Please update OPENROUTER_MODEL in Backend/.env.`);
                case 429:
                    throw new Error("OpenRouter rate limit reached. Please wait a moment and try again.");
                case 500:
                case 502:
                case 503:
                case 524:
                    throw new Error("OpenRouter provider is temporarily unavailable. Please try again in a few moments.");
                default:
                    throw new Error(`OpenRouter Error (${status}): ${apiErrorMsg}`);
            }
        }

        // Handle network failure without HTTP response
        if (error.request) {
            console.error(`[OpenRouter Service] Network Error: No response received from OpenRouter (${error.message})`);
            throw new Error("Network error connecting to OpenRouter. Please check your internet connection.");
        }

        console.error("[OpenRouter Service] Unexpected Error:", error.message);
        throw new Error(error.message || "Failed to communicate with OpenRouter AI engine.");
    }
};
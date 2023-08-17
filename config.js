// Server configuration
export const SERVER_PORT = 3000; // Server port
export const DEBUG = false; // Debug mode

// Prompt Moderation before sending to OpenAI
export const MODERATION = false; // Moderation mode

// Rate limit
export const PRIOD = 15 * 1000; // 15 seconds
export const RATE_LIMIT = 50; // 50 requests per 15 seconds

// Whitelisted IPs
export const WHITELISTED_IPS = [
     "127.0.0.1"
];

// OpenAI API Keys
export let OPENAI_KEYS = [
    "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",
    "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",
    "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",
    "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",
];
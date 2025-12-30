// ============================================
// TextAIpro - Gemini AI Service (Client-Side)
// ============================================
// Communicates with serverless API for AI operations
// Key rotation is now handled server-side with Redis

import { AI_CONFIG } from '../config/config.js';

/**
 * API endpoint for Gemini proxy
 * Uses relative URL for Vercel deployment, falls back to localhost for dev
 */
const API_ENDPOINT = '/api/gemini';

/**
 * Check if API is configured (always true when using serverless)
 * @returns {boolean}
 */
export function isApiKeyConfigured() {
    // When using serverless API, keys are configured on the server
    return true;
}

/**
 * Make a request to the Gemini API via serverless proxy
 * @param {string} text - Input text to process
 * @param {string} action - Action type (correct, improve, summarize, toPrompt, translate)
 * @returns {Promise<string>} Processed text result
 */
async function callGeminiAPI(text, action) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, action }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `API request failed with status ${response.status}`);
        }

        if (!data.result) {
            throw new Error('No response from AI');
        }

        // Log key rotation info for debugging
        if (data.keyIndex !== undefined) {
            console.log(`[GeminiService] Used key index: ${data.keyIndex}, request count: ${data.requestCount}`);
        }

        return data.result;

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        throw error;
    }
}

/**
 * Correct spelling and grammar
 * @param {string} text - Text to correct
 * @returns {Promise<string>} Corrected text
 */
export async function correctText(text) {
    return callGeminiAPI(text, 'correct');
}

/**
 * Improve text style and clarity
 * @param {string} text - Text to improve
 * @returns {Promise<string>} Improved text
 */
export async function improveText(text) {
    return callGeminiAPI(text, 'improve');
}

/**
 * Summarize text
 * @param {string} text - Text to summarize
 * @returns {Promise<string>} Summarized text
 */
export async function summarizeText(text) {
    return callGeminiAPI(text, 'summarize');
}

/**
 * Convert text to high-effective prompt (DSE v3.0)
 * @param {string} text - Text to convert
 * @returns {Promise<string>} Optimized prompt
 */
export async function convertToPrompt(text) {
    return callGeminiAPI(text, 'toPrompt');
}

/**
 * Translate text (Arabic <-> English)
 * @param {string} text - Text to translate
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text) {
    return callGeminiAPI(text, 'translate');
}

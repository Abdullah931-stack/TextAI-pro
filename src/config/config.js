// ============================================
// TextAIPRO - Client Configuration
// ============================================
// This file contains client-side configuration only.
// API keys and sensitive data are stored server-side in .env
// ============================================

/**
 * AI Request Configuration (Client-Side)
 * Note: Model, temperature, and prompts are now configured server-side
 */
export const AI_CONFIG = {
   timeout: 30000 // 30 seconds - request timeout for client
};

/**
 * Allowed file types for import
 */
export const ALLOWED_IMPORT_TYPES = ['.txt', '.md', '.pdf'];

/**
 * Maximum file size (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

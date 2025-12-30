// ============================================
// TextAIpro - File Import/Export Service
// ============================================

import { sanitizeText, sanitizeContent } from '../utils/sanitize.js';
import { extractTextFromPDF } from './pdfService.js';
import { ALLOWED_IMPORT_TYPES, MAX_FILE_SIZE } from '../config/config.js';

/**
 * Validate file before import
 */
export function validateFile(file) {
    const extension = '.' + file.name.split('.').pop().toLowerCase();

    if (!ALLOWED_IMPORT_TYPES.includes(extension)) {
        throw new Error(`File type not allowed. Allowed types: ${ALLOWED_IMPORT_TYPES.join(', ')}`);
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    return { valid: true, extension };
}

/**
 * Read text file content
 */
function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file, 'UTF-8');
    });
}

/**
 * Import a file and return its content
 */
export async function importFile(file) {
    const { extension } = validateFile(file);

    let content = '';

    switch (extension) {
        case '.txt':
            content = await readTextFile(file);
            content = sanitizeText(content);
            break;

        case '.md':
            content = await readTextFile(file);
            content = sanitizeContent(content);
            break;

        case '.pdf':
            content = await extractTextFromPDF(file);
            content = sanitizeText(content);
            break;

        default:
            throw new Error('Unsupported file type');
    }

    return {
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        content: content,
        originalName: file.name,
        type: extension
    };
}

/**
 * Export content as a downloadable file
 */
export function exportFile(content, filename, format = 'txt') {
    const mimeTypes = {
        'txt': 'text/plain',
        'md': 'text/markdown'
    };

    const mimeType = mimeTypes[format] || 'text/plain';
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Get file extension from name
 */
export function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

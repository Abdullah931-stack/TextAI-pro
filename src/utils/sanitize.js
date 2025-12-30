// ============================================
// TextAIpro - Input Sanitization (XSS Prevention)
// ============================================

/**
 * HTML entities to escape
 */
const HTML_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[&<>"'`=/]/g, char => HTML_ENTITIES[char]);
}

/**
 * Sanitize imported content - remove potentially dangerous elements
 */
export function sanitizeContent(html) {
    // Create a temporary element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove dangerous elements
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
    dangerousTags.forEach(tag => {
        const elements = temp.querySelectorAll(tag);
        elements.forEach(el => el.remove());
    });

    // Remove dangerous attributes
    const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur'];
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
        dangerousAttrs.forEach(attr => el.removeAttribute(attr));
        // Remove javascript: URLs
        if (el.hasAttribute('href') && el.getAttribute('href').toLowerCase().startsWith('javascript:')) {
            el.removeAttribute('href');
        }
        if (el.hasAttribute('src') && el.getAttribute('src').toLowerCase().startsWith('javascript:')) {
            el.removeAttribute('src');
        }
    });

    return temp.innerHTML;
}

/**
 * Sanitize plain text - just escape HTML
 */
export function sanitizeText(text) {
    return escapeHtml(text);
}

/**
 * Convert plain text to safe HTML with line breaks
 */
export function textToHtml(text) {
    return escapeHtml(text).replace(/\n/g, '<br>');
}

/**
 * Convert HTML back to plain text
 */
export function htmlToText(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    // Replace <br> with newlines
    temp.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    return temp.textContent || '';
}

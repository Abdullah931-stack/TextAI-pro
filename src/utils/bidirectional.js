// ============================================
// TextAIpro - Bidirectional Text Utilities
// ============================================

/**
 * Detect if text is predominantly Arabic/RTL
 */
export function isArabic(text) {
    // Arabic Unicode range
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const arabicChars = (text.match(arabicPattern) || []).length;
    const latinChars = (text.match(/[a-zA-Z]/g) || []).length;

    return arabicChars > latinChars;
}

/**
 * Get text direction based on content
 */
export function getTextDirection(text) {
    return isArabic(text) ? 'rtl' : 'ltr';
}

/**
 * Apply direction to paragraph element
 */
export function applyParagraphDirection(element) {
    const text = element.textContent || '';
    const dir = getTextDirection(text);
    element.setAttribute('dir', dir);
    element.style.textAlign = dir === 'rtl' ? 'right' : 'left';
    element.style.unicodeBidi = 'isolate';
}

/**
 * Process editor content for proper bidirectional display
 */
export function processEditorContent(editorElement) {
    // Get all paragraphs or text nodes
    const paragraphs = editorElement.querySelectorAll('p, div');

    if (paragraphs.length === 0) {
        // Handle plain text (no paragraphs)
        const text = editorElement.textContent || '';
        editorElement.setAttribute('dir', getTextDirection(text));
    } else {
        paragraphs.forEach(applyParagraphDirection);
    }
}

/**
 * Wrap text in proper direction spans for mixed content
 */
export function wrapMixedContent(text) {
    // Split by language boundaries and wrap appropriately
    const segments = [];
    let currentSegment = '';
    let currentDir = null;

    for (const char of text) {
        const charDir = isArabic(char) ? 'rtl' : 'ltr';

        if (currentDir === null) {
            currentDir = charDir;
            currentSegment = char;
        } else if (charDir === currentDir || /\s/.test(char)) {
            currentSegment += char;
        } else {
            if (currentSegment.trim()) {
                segments.push({ text: currentSegment, dir: currentDir });
            }
            currentSegment = char;
            currentDir = charDir;
        }
    }

    if (currentSegment.trim()) {
        segments.push({ text: currentSegment, dir: currentDir });
    }

    return segments;
}

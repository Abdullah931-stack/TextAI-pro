// ============================================
// TextAIpro - Toolbar Module
// ============================================

import { AppState, setState, undo, redo, canUndo, canRedo, pushToHistory } from './state.js';
import { openModal } from './modals.js';
import { showSuccess, showError, showInfo } from './toast.js';
import {
    correctText,
    improveText,
    summarizeText,
    convertToPrompt,
    translateText,
    isApiKeyConfigured
} from '../services/geminiService.js';

// Helper functions to avoid circular imports
function getEditorElement() {
    return document.getElementById('editor');
}

function getEditorContent() {
    const editor = getEditorElement();
    return editor ? editor.value || '' : '';
}

function setEditorContent(content) {
    const editor = getEditorElement();
    if (editor) {
        editor.value = content;
        setState({ editorContent: content });
        updateWordCount(content);
        updateLineNumbers();
    }
}

function getSelectedText() {
    const editor = getEditorElement();
    if (!editor) return '';
    return editor.value.substring(editor.selectionStart, editor.selectionEnd);
}

function replaceContent(newContent, replaceAll = false) {
    const editor = getEditorElement();
    if (!editor) return;

    pushToHistory(AppState.editorContent);

    if (!replaceAll && editor.selectionStart !== editor.selectionEnd) {
        // Replace selection
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + newContent + editor.value.substring(end);
    } else {
        // Replace all
        editor.value = newContent;
    }

    const content = editor.value;
    setState({ editorContent: content });
    updateWordCount(content);
    updateLineNumbers();
}

function updateWordCount(content) {
    const countEl = document.getElementById('word-count');
    if (countEl) {
        const count = content.trim() ? content.trim().split(/\s+/).length : 0;
        countEl.textContent = `${count} كلمة`;
    }
}

function updateLineNumbers() {
    const lineNumbersEl = document.getElementById('line-numbers');
    const editor = getEditorElement();
    if (!lineNumbersEl || !editor) return;

    const content = editor.value || '';
    const lines = content.split('\n').length || 1;

    lineNumbersEl.innerHTML = '';
    for (let i = 1; i <= lines; i++) {
        const span = document.createElement('span');
        span.textContent = i;
        lineNumbersEl.appendChild(span);
    }
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    if (undoBtn) undoBtn.disabled = !canUndo();
    if (redoBtn) redoBtn.disabled = !canRedo();
}

function toggleLineNumbers() {
    const lineNumbersEl = document.getElementById('line-numbers');
    if (lineNumbersEl) {
        lineNumbersEl.hidden = !lineNumbersEl.hidden;
    }
}

async function copyToClipboard() {
    const selection = getSelectedText();
    const textToCopy = selection || getEditorContent();

    // Method 1: Modern Clipboard API (preferred, requires secure context)
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(textToCopy);
            return true;
        } catch (error) {
            console.warn('Clipboard API failed, trying fallback:', error);
        }
    }

    // Method 2: Fallback using execCommand (for mobile/HTTP contexts)
    return copyToClipboardFallback(textToCopy);
}

/**
 * Fallback clipboard copy using document.execCommand
 * Works on mobile browsers and HTTP contexts where Clipboard API fails
 * Android requires element to be visible (opacity > 0) for copy to work
 */
function copyToClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // Android-compatible styling: must be technically visible
    // Using very small opacity and positioning within viewport but not obtrusive
    textarea.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 1px;
        height: 1px;
        padding: 0;
        border: none;
        outline: none;
        box-shadow: none;
        background: transparent;
        opacity: 0.01;
        font-size: 16px;
        z-index: -1;
    `;
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('contenteditable', 'true');
    document.body.appendChild(textarea);

    // Focus the textarea first (important for Android)
    textarea.focus();

    // Select the text
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    let success = false;
    try {
        success = document.execCommand('copy');
        if (!success) {
            console.warn('execCommand returned false');
        }
    } catch (error) {
        console.error('Fallback copy failed:', error);
    }

    // Clean up
    textarea.blur();
    document.body.removeChild(textarea);

    return success;
}

/**
 * Initialize toolbar
 */
export function initToolbar() {
    // Editing tools
    document.getElementById('undo-btn')?.addEventListener('click', handleUndo);
    document.getElementById('redo-btn')?.addEventListener('click', handleRedo);
    document.getElementById('search-btn')?.addEventListener('click', () => openModal('search-modal'));
    document.getElementById('copy-btn')?.addEventListener('click', handleCopy);
    document.getElementById('clear-btn')?.addEventListener('click', () => openModal('confirm-modal'));
    document.getElementById('export-btn')?.addEventListener('click', () => openModal('export-modal'));

    // AI tools
    document.getElementById('correct-btn')?.addEventListener('click', () => handleAI('correct'));
    document.getElementById('improve-btn')?.addEventListener('click', () => handleAI('improve'));
    document.getElementById('summarize-btn')?.addEventListener('click', () => handleAI('summarize'));
    document.getElementById('tomd-btn')?.addEventListener('click', () => handleAI('toPrompt'));
    document.getElementById('translate-btn')?.addEventListener('click', () => handleAI('translate'));

    // View tools
    document.getElementById('line-numbers-btn')?.addEventListener('click', toggleLineNumbers);
    document.getElementById('language-select')?.addEventListener('change', handleLanguageChange);

    // Initial button states
    updateUndoRedoButtons();
}

/**
 * Handle undo
 */
function handleUndo() {
    // First save current state if changed
    const currentContent = getEditorContent();
    if (currentContent !== AppState.editorContent) {
        pushToHistory(AppState.editorContent);
        setState({ editorContent: currentContent });
    }

    const previous = undo();
    if (previous !== null) {
        setEditorContent(previous);
        updateUndoRedoButtons();
    }
}

/**
 * Handle redo
 */
function handleRedo() {
    const next = redo();
    if (next !== null) {
        setEditorContent(next);
        updateUndoRedoButtons();
    }
}

/**
 * Handle copy
 */
async function handleCopy() {
    const success = await copyToClipboard();
    if (success) {
        showSuccess('تم النسخ للحافظة');
    } else {
        showError('فشل النسخ');
    }
}

/**
 * Handle AI operations
 */
async function handleAI(operation) {
    // Check API key
    if (!isApiKeyConfigured()) {
        showError('يرجى إضافة مفتاح API في ملف الإعدادات');
        return;
    }

    // Get text to process
    const selectedText = getSelectedText();
    const fullText = getEditorContent();
    const textToProcess = selectedText || fullText;

    if (!textToProcess.trim()) {
        showInfo('لا يوجد نص للمعالجة');
        return;
    }

    // Show loading state
    setState({ aiLoading: true });
    showSkeleton(true);
    setAIButtonsLoading(true);

    try {
        let result;

        switch (operation) {
            case 'correct':
                result = await correctText(textToProcess);
                break;
            case 'improve':
                result = await improveText(textToProcess);
                break;
            case 'summarize':
                result = await summarizeText(textToProcess);
                break;
            case 'toPrompt':
                result = await convertToPrompt(textToProcess);
                break;
            case 'translate':
                result = await translateText(textToProcess);
                break;
            default:
                throw new Error('Unknown operation');
        }

        // Apply result
        replaceContent(result, !selectedText);

        showSuccess('تمت المعالجة بنجاح');

    } catch (error) {
        console.error('AI Error:', error);
        showError(error.message || 'حدث خطأ أثناء المعالجة');
    } finally {
        setState({ aiLoading: false });
        showSkeleton(false);
        setAIButtonsLoading(false);
    }
}

/**
 * Show/hide skeleton loader
 */
function showSkeleton(show) {
    const skeleton = document.getElementById('skeleton-loader');
    const editor = document.getElementById('editor');

    if (skeleton) skeleton.hidden = !show;
    if (editor) editor.style.visibility = show ? 'hidden' : 'visible';
}

/**
 * Set AI buttons loading state
 */
function setAIButtonsLoading(loading) {
    const aiButtons = document.querySelectorAll('.tool-btn.ai-btn');
    aiButtons.forEach(btn => {
        btn.classList.toggle('loading', loading);
        btn.disabled = loading;
    });
}

/**
 * Handle language change
 */
function handleLanguageChange(e) {
    const lang = e.target.value;
    setState({ language: lang });

    // Update document direction
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

// Export for other modules
export { updateUndoRedoButtons };

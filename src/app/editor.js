// ============================================
// TextAIpro - Editor Module
// ============================================

import { AppState, setState, pushToHistory, getWordCount, undo, redo, canUndo, canRedo } from './state.js';

let editor = null;
let debounceTimer = null;
const DEBOUNCE_DELAY = 500;

/**
 * Initialize the editor
 */
export function initEditor() {
    editor = document.getElementById('editor');
    if (!editor) {
        console.error('Editor element not found');
        return;
    }

    // Set up event listeners
    editor.addEventListener('input', handleInput);
    editor.addEventListener('keydown', handleKeydown);

    // Sync scroll with line numbers
    editor.addEventListener('scroll', syncLineNumbersScroll);

    // Initialize line numbers
    updateLineNumbers();

    console.log('Editor initialized');
}

/**
 * Handle input events (typing)
 */
function handleInput() {
    const content = editor.value || '';

    // Debounced history snapshot
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (content !== AppState.editorContent) {
            pushToHistory(AppState.editorContent);
            setState({ editorContent: content });
            updateUndoRedoButtons();
        }
    }, DEBOUNCE_DELAY);

    // Update word count
    updateWordCount(content);

    // Update line numbers
    updateLineNumbers();

    // Auto-save to current file
    if (AppState.currentFile) {
        saveToCurrentFile(content);
    }
}

/**
 * Save content to current file in IndexedDB
 */
async function saveToCurrentFile(content) {
    try {
        const { updateFileContent } = await import('./fileSystem.js');
        await updateFileContent(AppState.currentFile.id, content);
        updateSaveStatus('محفوظ');
    } catch (e) {
        console.error('Failed to save:', e);
    }
}

/**
 * Handle special keystrokes
 */
function handleKeydown(e) {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'z':
                if (e.shiftKey) {
                    e.preventDefault();
                    handleRedo();
                } else {
                    e.preventDefault();
                    handleUndo();
                }
                break;
            case 'y':
                e.preventDefault();
                handleRedo();
                break;
            case 'f':
                e.preventDefault();
                document.getElementById('search-btn')?.click();
                break;
        }
    }
}

/**
 * Handle undo from keyboard or button
 */
function handleUndo() {
    const content = editor.value || '';
    if (content !== AppState.editorContent) {
        pushToHistory(AppState.editorContent);
        setState({ editorContent: content });
    }

    const previous = undo();
    if (previous !== null && editor) {
        editor.value = previous;
        setState({ editorContent: previous });
        updateWordCount(previous);
        updateLineNumbers();
        updateUndoRedoButtons();
    }
}

/**
 * Handle redo from keyboard or button
 */
function handleRedo() {
    const next = redo();
    if (next !== null && editor) {
        editor.value = next;
        setState({ editorContent: next });
        updateWordCount(next);
        updateLineNumbers();
        updateUndoRedoButtons();
    }
}

/**
 * Update undo/redo buttons
 */
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn) undoBtn.disabled = !canUndo();
    if (redoBtn) redoBtn.disabled = !canRedo();
}

/**
 * Update word count display
 */
function updateWordCount(content) {
    const countEl = document.getElementById('word-count');
    if (countEl) {
        const count = getWordCount(content);
        countEl.textContent = `${count} كلمة`;
    }
}

/**
 * Update save status display
 */
function updateSaveStatus(status) {
    const statusEl = document.getElementById('save-status');
    if (statusEl) statusEl.textContent = status;
}

/**
 * Update line numbers
 */
function updateLineNumbers() {
    const lineNumbersEl = document.getElementById('line-numbers');
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

/**
 * Sync line numbers scroll with editor
 */
function syncLineNumbersScroll() {
    const lineNumbersEl = document.getElementById('line-numbers');
    if (lineNumbersEl && editor) {
        lineNumbersEl.scrollTop = editor.scrollTop;
    }
}

/**
 * Get editor content
 */
export function getEditorContent() {
    return editor ? editor.value || '' : '';
}

/**
 * Set editor content
 */
export function setEditorContent(content) {
    if (editor) {
        editor.value = content;
        setState({ editorContent: content });
        updateWordCount(content);
        updateLineNumbers();
    }
}

/**
 * Export for toolbar
 */
export { handleUndo, handleRedo, updateUndoRedoButtons };

// ============================================
// TextAIpro - Application State Management
// ============================================

// Global application state
export const AppState = {
    // Current active file
    currentFile: null,

    // Editor content
    editorContent: '',

    // Undo/Redo stacks
    historyStack: [],
    futureStack: [],
    maxHistorySize: 50,

    // UI state
    sidebarCollapsed: false,
    lineNumbersVisible: false,
    language: 'ar',

    // AI loading state
    aiLoading: false,

    // Search state
    searchResults: [],
    currentSearchIndex: -1
};

// State change listeners
const listeners = new Set();

/**
 * Subscribe to state changes
 */
export function subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

/**
 * Notify all listeners of state change
 */
function notifyListeners(changedKey) {
    listeners.forEach(callback => callback(changedKey, AppState));
}

/**
 * Update state
 */
export function setState(updates) {
    Object.keys(updates).forEach(key => {
        if (AppState.hasOwnProperty(key)) {
            AppState[key] = updates[key];
            notifyListeners(key);
        }
    });
}

/**
 * Push to history stack (for undo)
 */
export function pushToHistory(content) {
    AppState.historyStack.push(content);
    if (AppState.historyStack.length > AppState.maxHistorySize) {
        AppState.historyStack.shift();
    }
    AppState.futureStack = []; // Clear redo stack
    notifyListeners('historyStack');
}

/**
 * Undo action
 */
export function undo() {
    if (AppState.historyStack.length === 0) return null;

    const current = AppState.editorContent;
    const previous = AppState.historyStack.pop();
    AppState.futureStack.push(current);
    AppState.editorContent = previous;

    notifyListeners('editorContent');
    return previous;
}

/**
 * Redo action
 */
export function redo() {
    if (AppState.futureStack.length === 0) return null;

    const current = AppState.editorContent;
    const next = AppState.futureStack.pop();
    AppState.historyStack.push(current);
    AppState.editorContent = next;

    notifyListeners('editorContent');
    return next;
}

/**
 * Check if undo is available
 */
export function canUndo() {
    return AppState.historyStack.length > 0;
}

/**
 * Check if redo is available
 */
export function canRedo() {
    return AppState.futureStack.length > 0;
}

/**
 * Get word count from content
 */
export function getWordCount(text) {
    if (!text || !text.trim()) return 0;
    // Count both Arabic and English words
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

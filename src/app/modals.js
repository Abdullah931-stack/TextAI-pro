// ============================================
// TextAIpro - Modal System
// ============================================

import { showSuccess, showError } from './toast.js';
import { exportFile } from '../services/fileService.js';
import { AppState, pushToHistory, setState } from './state.js';

let modalOverlay = null;
let activeModal = null;

// Helper functions to access editor without circular import
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
    }
}

function clearEditorContent() {
    pushToHistory(AppState.editorContent);
    setEditorContent('');
}

/**
 * Initialize modal system
 */
export function initModals() {
    modalOverlay = document.getElementById('modal-overlay');

    // Close on overlay click
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeModal) closeModal();
    });

    // Set up modal-specific handlers
    setupConfirmModal();
    setupSearchModal();
    setupExportModal();
    setupNameModal();
    setupDeleteModal();
}

/**
 * Open a modal
 */
export function openModal(modalId) {
    if (!modalOverlay) return;

    // Hide all modals first
    document.querySelectorAll('.modal').forEach(m => m.hidden = true);

    // Show requested modal
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.hidden = false;
        activeModal = modal;
        modalOverlay.hidden = false;
        modalOverlay.classList.add('active');

        // Focus first input if present
        const firstInput = modal.querySelector('input');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }
}

/**
 * Close current modal
 */
export function closeModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        setTimeout(() => {
            modalOverlay.hidden = true;
            if (activeModal) activeModal.hidden = true;
            activeModal = null;
        }, 250);
    }
}

/**
 * Setup confirm clear modal
 */
function setupConfirmModal() {
    const cancelBtn = document.getElementById('cancel-clear');
    const confirmBtn = document.getElementById('confirm-clear');

    cancelBtn?.addEventListener('click', closeModal);
    confirmBtn?.addEventListener('click', () => {
        clearEditorContent();
        closeModal();
        showSuccess('تم مسح المحتوى');
    });
}

/**
 * Setup search and replace modal
 */
function setupSearchModal() {
    const closeBtn = document.getElementById('close-search');
    const searchInput = document.getElementById('search-input');
    const replaceInput = document.getElementById('replace-input');
    const resultsContainer = document.getElementById('search-results');
    const matchCount = document.getElementById('match-count');
    const replaceSelectedBtn = document.getElementById('replace-selected');
    const replaceAllBtn = document.getElementById('replace-all');

    closeBtn?.addEventListener('click', closeModal);

    // Live search
    searchInput?.addEventListener('input', () => {
        const query = searchInput.value;
        if (!query) {
            resultsContainer.innerHTML = '';
            matchCount.textContent = '0 نتيجة';
            replaceSelectedBtn.disabled = true;
            replaceAllBtn.disabled = true;
            return;
        }

        const content = getEditorContent();
        const matches = findMatches(content, query);

        matchCount.textContent = `${matches.length} نتيجة`;
        replaceSelectedBtn.disabled = matches.length === 0;
        replaceAllBtn.disabled = matches.length === 0;

        // Render results
        resultsContainer.innerHTML = matches.map((match, i) => `
            <div class="search-result-item">
                <input type="checkbox" id="match-${i}" checked>
                <label for="match-${i}">${escapeHtml(match.context)}</label>
            </div>
        `).join('');
    });

    // Replace selected
    replaceSelectedBtn?.addEventListener('click', () => {
        const query = searchInput.value;
        const replacement = replaceInput.value;
        const checkboxes = resultsContainer.querySelectorAll('input[type="checkbox"]:checked');

        if (checkboxes.length === 0) return;

        let content = getEditorContent();
        const matches = findMatches(content, query);
        const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.id.split('-')[1]));

        selectedIndices.sort((a, b) => b - a).forEach(idx => {
            const match = matches[idx];
            if (match) {
                content = content.substring(0, match.start) + replacement + content.substring(match.end);
            }
        });

        pushToHistory(AppState.editorContent);
        setEditorContent(content);
        showSuccess(`تم استبدال ${selectedIndices.length} نتيجة`);
        searchInput.dispatchEvent(new Event('input'));
    });

    // Replace all
    replaceAllBtn?.addEventListener('click', () => {
        const query = searchInput.value;
        const replacement = replaceInput.value;

        if (!query) return;

        const content = getEditorContent();
        const newContent = content.split(query).join(replacement);
        const count = (content.match(new RegExp(escapeRegex(query), 'g')) || []).length;

        pushToHistory(AppState.editorContent);
        setEditorContent(newContent);
        showSuccess(`تم استبدال ${count} نتيجة`);
        closeModal();
    });
}

/**
 * Find all matches of query in content
 */
function findMatches(content, query) {
    const matches = [];
    let pos = 0;

    while ((pos = content.indexOf(query, pos)) !== -1) {
        const start = Math.max(0, pos - 20);
        const end = Math.min(content.length, pos + query.length + 20);
        const context = (start > 0 ? '...' : '') +
            content.substring(start, end) +
            (end < content.length ? '...' : '');

        matches.push({ start: pos, end: pos + query.length, context });
        pos += query.length;
    }

    return matches;
}

/**
 * Setup export modal
 */
function setupExportModal() {
    const cancelBtn = document.getElementById('cancel-export');
    const exportTxtBtn = document.getElementById('export-txt');
    const exportMdBtn = document.getElementById('export-md');

    cancelBtn?.addEventListener('click', closeModal);

    exportTxtBtn?.addEventListener('click', () => {
        const content = getEditorContent();
        const filename = AppState.currentFile?.name?.replace(/\.[^/.]+$/, '') || 'document';
        exportFile(content, filename, 'txt');
        closeModal();
        showSuccess('تم تصدير الملف');
    });

    exportMdBtn?.addEventListener('click', () => {
        const content = getEditorContent();
        const filename = AppState.currentFile?.name?.replace(/\.[^/.]+$/, '') || 'document';
        exportFile(content, filename, 'md');
        closeModal();
        showSuccess('تم تصدير الملف');
    });
}

/**
 * Name modal for new file/folder
 */
let nameModalCallback = null;

function setupNameModal() {
    const cancelBtn = document.getElementById('cancel-name');
    const confirmBtn = document.getElementById('confirm-name');
    const nameInput = document.getElementById('item-name-input');

    cancelBtn?.addEventListener('click', closeModal);

    confirmBtn?.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name && nameModalCallback) {
            nameModalCallback(name);
            nameInput.value = '';
            closeModal();
        }
    });

    nameInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmBtn?.click();
    });
}

/**
 * Open name modal with callback
 * @param {string} title - Modal title
 * @param {function} callback - Callback with name value
 * @param {string} initialValue - Optional initial value for rename
 */
export function openNameModal(title, callback, initialValue = '') {
    document.getElementById('name-modal-title').textContent = title;
    document.getElementById('item-name-input').value = initialValue;
    nameModalCallback = callback;
    openModal('name-modal');
}

/**
 * Delete modal state
 */
let deleteModalResolve = null;

function setupDeleteModal() {
    const cancelBtn = document.getElementById('cancel-delete');
    const confirmBtn = document.getElementById('confirm-delete');

    cancelBtn?.addEventListener('click', () => {
        if (deleteModalResolve) {
            deleteModalResolve(false);
            deleteModalResolve = null;
        }
        closeModal();
    });

    confirmBtn?.addEventListener('click', () => {
        if (deleteModalResolve) {
            deleteModalResolve(true);
            deleteModalResolve = null;
        }
        closeModal();
    });

    // Handle ESC key and overlay click for delete modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && deleteModalResolve) {
            deleteModalResolve(false);
            deleteModalResolve = null;
        }
    });
}

/**
 * Open delete confirmation modal
 * @param {string} itemName - Name of the item to delete
 * @param {string} itemType - 'file' or 'folder'
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
export function openDeleteModal(itemName, itemType) {
    return new Promise((resolve) => {
        const message = document.getElementById('delete-modal-message');
        const nameDisplay = document.getElementById('delete-item-name');

        message.textContent = itemType === 'folder'
            ? 'هل أنت متأكد من حذف هذا المجلد وجميع محتوياته؟'
            : 'هل أنت متأكد من حذف هذا الملف؟';

        nameDisplay.textContent = itemName;
        deleteModalResolve = resolve;

        openModal('delete-modal');
    });
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

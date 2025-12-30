// ============================================
// TextAIpro - Virtual File System
// ============================================

import { initDB, getAllItems, getItem, saveItem, deleteItem, getChildren, generateId } from '../utils/storage.js';
import { AppState, setState } from './state.js';

// Local cache of file tree
let fileTree = [];

/**
 * Initialize the file system
 */
export async function initFileSystem() {
    await initDB();
    await loadFileTree();
    return fileTree;
}

/**
 * Load all files from IndexedDB
 */
async function loadFileTree() {
    try {
        const items = await getAllItems();
        fileTree = items;
        renderFileTree();
    } catch (error) {
        console.error('Failed to load file tree:', error);
        fileTree = [];
    }
}

/**
 * Create a new file
 */
export async function createFile(name, parentId = null, content = '') {
    const file = {
        id: generateId(),
        name: name.endsWith('.txt') || name.endsWith('.md') ? name : name + '.txt',
        type: 'file',
        content: content,
        parentId: parentId,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    await saveItem(file);
    fileTree.push(file);
    renderFileTree();
    return file;
}

/**
 * Create a new folder
 */
export async function createFolder(name, parentId = null) {
    const folder = {
        id: generateId(),
        name: name,
        type: 'folder',
        parentId: parentId,
        expanded: true,
        createdAt: Date.now()
    };

    await saveItem(folder);
    fileTree.push(folder);
    renderFileTree();
    return folder;
}

/**
 * Update file content
 */
export async function updateFileContent(fileId, content) {
    const file = fileTree.find(f => f.id === fileId);
    if (file) {
        file.content = content;
        file.updatedAt = Date.now();
        await saveItem(file);
    }
}

/**
 * Rename file or folder
 */
export async function renameItem(itemId, newName) {
    const item = fileTree.find(f => f.id === itemId);
    if (item) {
        item.name = newName;
        item.updatedAt = Date.now();
        await saveItem(item);
        renderFileTree();
    }
}

/**
 * Move item to a different folder
 */
export async function moveItem(itemId, newParentId) {
    const item = fileTree.find(f => f.id === itemId);
    if (item && item.id !== newParentId) {
        item.parentId = newParentId;
        item.updatedAt = Date.now();
        await saveItem(item);
        renderFileTree();
    }
}

/**
 * Delete file or folder (and children)
 */
export async function deleteFileOrFolder(itemId) {
    // Find all children recursively
    const toDelete = [itemId];
    const findChildren = (parentId) => {
        fileTree.filter(f => f.parentId === parentId).forEach(child => {
            toDelete.push(child.id);
            if (child.type === 'folder') {
                findChildren(child.id);
            }
        });
    };
    findChildren(itemId);

    // Delete all
    for (const id of toDelete) {
        await deleteItem(id);
    }

    fileTree = fileTree.filter(f => !toDelete.includes(f.id));
    renderFileTree();
}

/**
 * Open a file in the editor
 */
export async function openFile(fileId) {
    // Fetch fresh file data from IndexedDB
    const file = await getItem(fileId);

    if (!file || file.type !== 'file') {
        console.error('File not found:', fileId);
        return;
    }

    // Update local cache
    const idx = fileTree.findIndex(f => f.id === fileId);
    if (idx >= 0) {
        fileTree[idx] = file;
    }

    console.log('Opening file:', file.name, 'Content length:', (file.content || '').length);

    // Update state
    setState({
        currentFile: file,
        editorContent: file.content || '',
        historyStack: [],
        futureStack: []
    });

    // Update editor (textarea uses .value)
    const editor = document.getElementById('editor');
    if (editor) {
        editor.value = file.content || '';
        console.log('Editor value set to:', editor.value.substring(0, 50) + '...');
    }

    // Update current file display
    const currentFileEl = document.getElementById('current-file');
    if (currentFileEl) {
        currentFileEl.textContent = file.name;
    }

    // Update word count
    const wordCountEl = document.getElementById('word-count');
    if (wordCountEl) {
        const content = file.content || '';
        const count = content.trim() ? content.trim().split(/\s+/).length : 0;
        wordCountEl.textContent = `${count} كلمة`;
    }

    // Update line numbers
    const lineNumbersEl = document.getElementById('line-numbers');
    if (lineNumbersEl) {
        const content = file.content || '';
        const lines = content.split('\n').length || 1;
        lineNumbersEl.innerHTML = '';
        for (let i = 1; i <= lines; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            lineNumbersEl.appendChild(span);
        }
    }

    // Update active state in tree
    document.querySelectorAll('.file-tree-item').forEach(el => {
        el.classList.remove('active');
    });
    const activeItem = document.querySelector(`[data-id="${fileId}"]`);
    if (activeItem) activeItem.classList.add('active');

    // Reset undo/redo buttons
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn) undoBtn.disabled = true;
    if (redoBtn) redoBtn.disabled = true;
}

/**
 * Toggle folder expansion
 */
export async function toggleFolder(folderId) {
    const folder = fileTree.find(f => f.id === folderId);
    if (folder && folder.type === 'folder') {
        folder.expanded = !folder.expanded;
        await saveItem(folder);
        renderFileTree();
    }
}

/**
 * Get tree structure for rendering
 */
function buildTree(parentId = null) {
    return fileTree
        .filter(item => item.parentId === parentId)
        .sort((a, b) => {
            // Folders first, then files
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
}

/**
 * Render the file tree in the sidebar
 */
export function renderFileTree() {
    const container = document.getElementById('file-tree');
    if (!container) return;

    container.innerHTML = '';

    function renderLevel(parentId, depth = 0) {
        const items = buildTree(parentId);
        const fragment = document.createDocumentFragment();

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = `file-tree-item ${item.type}`;
            el.dataset.id = item.id;
            el.dataset.type = item.type;
            el.draggable = true;
            el.style.paddingInlineStart = `${12 + depth * 16}px`;

            // Action buttons HTML
            const actionBtns = `
                <div class="item-actions">
                    <button class="item-action-btn rename-btn" data-action="rename" title="إعادة تسمية">✏️</button>
                    <button class="item-action-btn delete-btn" data-action="delete" title="حذف">🗑️</button>
                </div>
            `;

            if (item.type === 'folder') {
                el.innerHTML = `
                    <span class="folder-toggle ${item.expanded ? 'expanded' : ''}">▶</span>
                    <span class="icon-folder"></span>
                    <span class="item-name">${item.name}</span>
                    ${actionBtns}
                `;
                fragment.appendChild(el);

                if (item.expanded) {
                    const children = document.createElement('div');
                    children.className = 'folder-children';
                    children.appendChild(renderLevel(item.id, depth + 1));
                    fragment.appendChild(children);
                }
            } else {
                el.innerHTML = `
                    <span class="icon-file"></span>
                    <span class="item-name">${item.name}</span>
                    ${actionBtns}
                `;
                fragment.appendChild(el);
            }

            // Mark active file
            if (AppState.currentFile && AppState.currentFile.id === item.id) {
                el.classList.add('active');
            }
        });

        return fragment;
    }

    container.appendChild(renderLevel(null));
}

/**
 * Get file by ID
 */
export function getFile(fileId) {
    return fileTree.find(f => f.id === fileId);
}

/**
 * Get all files (for search, etc)
 */
export function getAllFiles() {
    return fileTree.filter(f => f.type === 'file');
}

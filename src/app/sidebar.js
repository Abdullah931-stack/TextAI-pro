// ============================================
// TextAIpro - Sidebar Module
// ============================================

import { AppState, setState } from './state.js';
import {
    initFileSystem,
    createFile,
    createFolder,
    openFile,
    toggleFolder,
    moveItem,
    renderFileTree,
    getFile,
    deleteFileOrFolder,
    renameItem
} from './fileSystem.js';
import { openNameModal } from './modals.js';
import { showSuccess, showError, showInfo } from './toast.js';
import { importFile, validateFile } from '../services/fileService.js';

let draggedItem = null;

/**
 * Initialize sidebar
 */
export async function initSidebar() {
    // Mark module as initialized to prevent fallback script from duplicating handlers
    window.__sidebarModuleInitialized = true;

    // Initialize file system
    await initFileSystem();

    // Toggle sidebar - only add if not already handled
    const toggleBtn = document.getElementById('toggle-sidebar');
    if (toggleBtn && !toggleBtn.dataset.sidebarHandlerAttached) {
        toggleBtn.addEventListener('click', toggleSidebar);
        toggleBtn.dataset.sidebarHandlerAttached = 'true';
    }

    // Expand sidebar button (for collapsed state on desktop)
    const expandBtn = document.getElementById('expand-sidebar-btn');
    if (expandBtn && !expandBtn.dataset.sidebarHandlerAttached) {
        expandBtn.addEventListener('click', expandSidebar);
        expandBtn.dataset.sidebarHandlerAttached = 'true';
    }

    // New file/folder buttons
    document.getElementById('new-file-btn')?.addEventListener('click', handleNewFile);
    document.getElementById('new-folder-btn')?.addEventListener('click', handleNewFolder);

    // File tree events (delegated)
    const fileTree = document.getElementById('file-tree');
    if (fileTree) {
        fileTree.addEventListener('click', handleTreeClick);
        fileTree.addEventListener('dblclick', handleTreeDoubleClick);
        fileTree.addEventListener('dragstart', handleDragStart);
        fileTree.addEventListener('dragover', handleDragOver);
        fileTree.addEventListener('dragleave', handleDragLeave);
        fileTree.addEventListener('drop', handleDrop);
        fileTree.addEventListener('dragend', handleDragEnd);
    }

    // External file drop zone - only on the drop zone element
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    if (dropZone) {
        dropZone.addEventListener('dragover', handleExternalDragOver);
        dropZone.addEventListener('dragleave', handleExternalDragLeave);
        dropZone.addEventListener('drop', handleExternalDrop);

        // Click handler to open file browser
        dropZone.addEventListener('click', () => {
            fileInput?.click();
        });
    }

    // File input change handler
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
                await processImportedFiles(files);
            }
            // Reset input to allow reimporting the same file
            e.target.value = '';
        });
    }
}

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const expandBtn = document.getElementById('expand-sidebar-btn');

    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        setState({ sidebarCollapsed: isCollapsed });

        // Show/hide expand button on desktop
        if (expandBtn && window.innerWidth > 768) {
            expandBtn.classList.toggle('visible', isCollapsed);
        }
    }
}

/**
 * Expand collapsed sidebar (used by floating button)
 */
function expandSidebar() {
    const sidebar = document.getElementById('sidebar');
    const expandBtn = document.getElementById('expand-sidebar-btn');

    if (sidebar && sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        setState({ sidebarCollapsed: false });

        if (expandBtn) {
            expandBtn.classList.remove('visible');
        }
    }
}

/**
 * Handle new file creation
 */
function handleNewFile() {
    openNameModal('ملف جديد', async (name) => {
        try {
            const file = await createFile(name);
            openFile(file.id);
            showSuccess('تم إنشاء الملف');
        } catch (error) {
            showError('فشل إنشاء الملف');
        }
    });
}

/**
 * Handle new folder creation
 */
function handleNewFolder() {
    openNameModal('مجلد جديد', async (name) => {
        try {
            await createFolder(name);
            showSuccess('تم إنشاء المجلد');
        } catch (error) {
            showError('فشل إنشاء المجلد');
        }
    });
}

/**
 * Handle tree item click
 */
function handleTreeClick(e) {
    const item = e.target.closest('.file-tree-item');
    if (!item) return;

    const id = item.dataset.id;
    const type = item.dataset.type;

    // Check for action button clicks
    const actionBtn = e.target.closest('.item-action-btn');
    if (actionBtn) {
        e.stopPropagation();
        const action = actionBtn.dataset.action;

        if (action === 'delete') {
            handleDeleteItem(id, type);
        } else if (action === 'rename') {
            handleRenameItem(id);
        }
        return;
    }

    // Toggle folder or select file
    if (type === 'folder') {
        // Check if clicked on toggle
        if (e.target.classList.contains('folder-toggle')) {
            toggleFolder(id);
        }
    } else {
        openFile(id);
    }
}

/**
 * Handle delete item
 */
async function handleDeleteItem(id, type) {
    const confirmMsg = type === 'folder'
        ? 'هل أنت متأكد من حذف هذا المجلد وجميع محتوياته؟'
        : 'هل أنت متأكد من حذف هذا الملف؟';

    if (confirm(confirmMsg)) {
        try {
            await deleteFileOrFolder(id);
            showSuccess('تم الحذف بنجاح');
        } catch (error) {
            showError('فشل الحذف');
        }
    }
}

/**
 * Handle rename item
 */
async function handleRenameItem(id) {
    const file = await getFile(id);
    if (!file) return;

    openNameModal('إعادة تسمية', async (newName) => {
        try {
            await renameItem(id, newName);
            showSuccess('تم تغيير الاسم');
        } catch (error) {
            showError('فشل تغيير الاسم');
        }
    }, file.name);
}

/**
 * Handle tree item double click (open file or toggle folder)
 */
function handleTreeDoubleClick(e) {
    const item = e.target.closest('.file-tree-item');
    if (!item) return;

    const id = item.dataset.id;
    const type = item.dataset.type;

    if (type === 'folder') {
        toggleFolder(id);
    } else {
        openFile(id);
    }
}

/**
 * Handle drag start
 */
function handleDragStart(e) {
    const item = e.target.closest('.file-tree-item');
    if (!item) return;

    draggedItem = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.dataset.id);
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const item = e.target.closest('.file-tree-item');
    if (item && item !== draggedItem && item.dataset.type === 'folder') {
        item.classList.add('drag-over');
    }
}

/**
 * Handle drag leave
 */
function handleDragLeave(e) {
    const item = e.target.closest('.file-tree-item');
    if (item) {
        item.classList.remove('drag-over');
    }
}

/**
 * Handle drop (internal file tree drag-and-drop only)
 */
async function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling

    // Ignore external file drops - let the drop zone handle those
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        return;
    }

    const targetItem = e.target.closest('.file-tree-item');

    // Clear drag-over state
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

    if (!draggedItem) return;

    const draggedId = draggedItem.dataset.id;
    let targetParentId = null;

    if (targetItem && targetItem.dataset.type === 'folder') {
        targetParentId = targetItem.dataset.id;
    }

    // Don't drop on self
    if (draggedId === targetParentId) return;

    try {
        await moveItem(draggedId, targetParentId);
        showSuccess('تم نقل العنصر');
    } catch (error) {
        showError('فشل نقل العنصر');
    }
}

/**
 * Handle drag end
 */
function handleDragEnd() {
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

/**
 * Handle external drag over (file from OS)
 */
function handleExternalDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    const dropZone = document.getElementById('drop-zone');
    if (dropZone) dropZone.classList.add('active');
}

/**
 * Handle external drag leave
 */
function handleExternalDragLeave(e) {
    const dropZone = document.getElementById('drop-zone');
    if (dropZone && !dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove('active');
    }
}

/**
 * Process imported files (shared by drag-drop and file input)
 * @param {File[]} files - Array of files to import
 */
async function processImportedFiles(files) {
    if (files.length === 0) return;

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
        try {
            // Validate file
            validateFile(file);

            // Import file
            const imported = await importFile(file);

            // Create file in virtual FS
            const newFile = await createFile(imported.name, null, imported.content);

            // If single file, open it
            if (files.length === 1) {
                openFile(newFile.id);
            }

            successCount++;
        } catch (error) {
            console.error('Import error:', error);
            errorCount++;
        }
    }

    if (successCount > 0) {
        showSuccess(`تم استيراد ${successCount} ملف`);
    }
    if (errorCount > 0) {
        showError(`فشل استيراد ${errorCount} ملف`);
    }
}

/**
 * Handle external file drop
 */
async function handleExternalDrop(e) {
    e.preventDefault();

    const dropZone = document.getElementById('drop-zone');
    if (dropZone) dropZone.classList.remove('active');

    const files = Array.from(e.dataTransfer.files);
    await processImportedFiles(files);
}

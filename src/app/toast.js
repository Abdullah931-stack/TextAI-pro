// ============================================
// TextAIpro - Toast Notifications
// ============================================

const TOAST_DURATION = 3000;
let toastContainer = null;

/**
 * Initialize toast container
 */
export function initToast() {
    toastContainer = document.getElementById('toast-container');
}

/**
 * Show a toast notification
 */
export function showToast(message, type = 'info') {
    if (!toastContainer) initToast();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto-hide after duration
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, TOAST_DURATION);

    return toast;
}

/**
 * Show success toast
 */
export function showSuccess(message) {
    return showToast(message, 'success');
}

/**
 * Show error toast
 */
export function showError(message) {
    return showToast(message, 'error');
}

/**
 * Show warning toast
 */
export function showWarning(message) {
    return showToast(message, 'warning');
}

/**
 * Show info toast
 */
export function showInfo(message) {
    return showToast(message, 'info');
}

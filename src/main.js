// ============================================
// TextAIpro - Main Entry Point
// ============================================
// Initializes all application modules

import { initToast, showInfo, showError } from './app/toast.js';
import { isApiKeyConfigured } from './services/geminiService.js';

/**
 * Initialize the application
 */
async function init() {
    console.log('TextAIpro v1.0.0 - Initializing...');

    try {
        // Initialize toast first (no dependencies)
        initToast();
        console.log('Toast initialized');

        // Initialize modals
        const { initModals } = await import('./app/modals.js');
        initModals();
        console.log('Modals initialized');

        // Initialize sidebar (includes file system)
        const { initSidebar } = await import('./app/sidebar.js');
        await initSidebar();
        console.log('Sidebar initialized');

        // Initialize toolbar
        const { initToolbar } = await import('./app/toolbar.js');
        initToolbar();
        console.log('Toolbar initialized');

        // Initialize editor
        const { initEditor } = await import('./app/editor.js');
        initEditor();
        console.log('Editor initialized');

        // Initialize mobile responsiveness
        const { initMobile } = await import('./app/mobile.js');
        initMobile();
        console.log('Mobile module initialized');

        // Check API key
        if (!isApiKeyConfigured()) {
            showInfo('يرجى إضافة مفتاح Gemini API في src/config/config.js');
        }

        console.log('TextAIpro initialized successfully!');

    } catch (error) {
        console.error('Failed to initialize TextAIpro:', error);
        showError('حدث خطأ أثناء تحميل التطبيق');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

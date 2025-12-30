// ============================================
// TextAIpro - Mobile Responsiveness Handler
// ============================================
// Handles hamburger menu, off-canvas sidebar, and mobile interactions

/**
 * Mobile breakpoint (matches CSS)
 */
const MOBILE_BREAKPOINT = 768;

/**
 * DOM Elements
 */
let hamburgerBtn = null;
let sidebar = null;
let mobileOverlay = null;
let toggleSidebarBtn = null;

/**
 * Check if current viewport is mobile
 * @returns {boolean}
 */
export function isMobileView() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

/**
 * Open mobile sidebar
 */
export function openMobileSidebar() {
    sidebar?.classList.add('mobile-open');
    mobileOverlay?.classList.add('active');
    hamburgerBtn?.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('Sidebar opened');
}

/**
 * Close mobile sidebar
 */
export function closeMobileSidebar() {
    sidebar?.classList.remove('mobile-open');
    mobileOverlay?.classList.remove('active');
    hamburgerBtn?.classList.remove('active');
    document.body.style.overflow = '';
    console.log('Sidebar closed');
}

/**
 * Toggle mobile sidebar
 */
export function toggleMobileSidebar() {
    console.log('Toggle clicked, sidebar has mobile-open:', sidebar?.classList.contains('mobile-open'));
    if (sidebar?.classList.contains('mobile-open')) {
        closeMobileSidebar();
    } else {
        openMobileSidebar();
    }
}

/**
 * Handle window resize
 */
function handleResize() {
    // Close mobile sidebar when switching to desktop view
    if (!isMobileView()) {
        sidebar?.classList.remove('mobile-open');
        mobileOverlay?.classList.remove('active');
        hamburgerBtn?.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} e 
 */
function handleKeydown(e) {
    // Close sidebar on Escape key
    if (e.key === 'Escape' && sidebar?.classList.contains('mobile-open')) {
        closeMobileSidebar();
    }
}

/**
 * Initialize mobile functionality
 */
export function initMobile() {
    // Guard: Skip ALL mobile initialization if inline fallback already handled it
    // This prevents duplicate event handlers when running on a server
    if (window.__mobileFallbackInitialized) {
        console.log('Inline fallback already initialized, skipping module initialization');
        return;
    }
    window.__mobileModuleInitialized = true;

    // Get DOM elements
    hamburgerBtn = document.getElementById('hamburger-btn');
    sidebar = document.getElementById('sidebar');
    mobileOverlay = document.getElementById('mobile-overlay');
    toggleSidebarBtn = document.getElementById('toggle-sidebar');

    console.log('Mobile init - hamburgerBtn:', hamburgerBtn);
    console.log('Mobile init - sidebar:', sidebar);
    console.log('Mobile init - mobileOverlay:', mobileOverlay);

    if (!hamburgerBtn || !sidebar || !mobileOverlay) {
        console.warn('Mobile elements not found, skipping mobile initialization');
        console.warn('Missing elements:', {
            hamburgerBtn: !hamburgerBtn,
            sidebar: !sidebar,
            mobileOverlay: !mobileOverlay
        });
        return;
    }

    // Hamburger button click
    hamburgerBtn.addEventListener('click', (e) => {
        console.log('Hamburger button clicked!');
        e.stopPropagation();
        e.preventDefault();
        toggleMobileSidebar();
    });

    // Overlay click closes sidebar
    mobileOverlay.addEventListener('click', () => {
        closeMobileSidebar();
    });

    // Override toggle sidebar button for mobile - support both click and touch
    if (toggleSidebarBtn) {
        function handleToggleSidebar(e) {
            e.stopPropagation();
            e.preventDefault();
            if (isMobileView()) {
                closeMobileSidebar();
            }
            // Desktop toggle is handled elsewhere (in sidebar.js)
        }
        toggleSidebarBtn.addEventListener('click', handleToggleSidebar);
        toggleSidebarBtn.addEventListener('touchend', handleToggleSidebar);
    }

    // Handle resize events with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
    });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);

    // Close sidebar when clicking on a file (on mobile only)
    const fileTree = document.getElementById('file-tree');
    if (fileTree) {
        fileTree.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file-tree-item');
            if (fileItem && isMobileView() && !fileItem.classList.contains('folder')) {
                // Small delay to allow file to load
                setTimeout(closeMobileSidebar, 150);
            }
        });
    }

    // AI Mobile Menu Logic
    const aiFab = document.getElementById('ai-fab');
    const aiBottomSheet = document.getElementById('ai-bottom-sheet');
    const closeAiSheetBtn = document.getElementById('close-ai-sheet');
    // FIXED: Scope selector to only AI sheet, not More Options sheet
    const aiSheetBtns = aiBottomSheet ? aiBottomSheet.querySelectorAll('.ai-sheet-btn') : [];

    // More Options Sheet Logic
    const moreBtn = document.getElementById('mobile-more-btn');
    const moreOptionsSheet = document.getElementById('more-options-sheet');
    const closeMoreSheetBtn = document.getElementById('close-more-sheet');
    const moreSheetBtns = moreOptionsSheet ? moreOptionsSheet.querySelectorAll('.ai-sheet-btn') : [];

    // Helper to check if More Options sheet is open
    function isMoreSheetOpen() {
        return moreOptionsSheet && moreOptionsSheet.classList.contains('active');
    }

    if (aiFab && aiBottomSheet && closeAiSheetBtn) {
        function toggleAiSheet() {
            const isOpen = aiBottomSheet.classList.contains('active');
            if (isOpen) {
                aiBottomSheet.classList.remove('active');
                if (!sidebar.classList.contains('mobile-open') && !isMoreSheetOpen()) {
                    mobileOverlay.classList.remove('active');
                }
            } else {
                // Close other sheets first
                if (moreOptionsSheet) moreOptionsSheet.classList.remove('active');
                aiBottomSheet.classList.add('active');
                mobileOverlay.classList.add('active');
                // Close sidebar if open
                if (sidebar.classList.contains('mobile-open')) {
                    closeMobileSidebar();
                }
            }
        }

        aiFab.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAiSheet();
        });

        // Close AI Sheet - support both click and touch
        function closeAiSheet(e) {
            e.stopPropagation();
            e.preventDefault();
            aiBottomSheet.classList.remove('active');
            if (!sidebar.classList.contains('mobile-open') && !isMoreSheetOpen()) {
                mobileOverlay.classList.remove('active');
            }
        }
        closeAiSheetBtn.addEventListener('click', closeAiSheet);
        closeAiSheetBtn.addEventListener('touchend', closeAiSheet);

        // Delegate clicks from sheet buttons to original toolbar buttons
        aiSheetBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-trigger');
                const originalBtn = document.getElementById(targetId);
                if (originalBtn) {
                    originalBtn.click();
                    // Close sheet after selection
                    aiBottomSheet.classList.remove('active');
                    mobileOverlay.classList.remove('active');
                }
            });
        });
    }

    // More Options Sheet Logic
    if (moreBtn && moreOptionsSheet && closeMoreSheetBtn) {
        function toggleMoreSheet() {
            const isOpen = moreOptionsSheet.classList.contains('active');
            if (isOpen) {
                moreOptionsSheet.classList.remove('active');
                if (!sidebar.classList.contains('mobile-open') && !aiBottomSheet?.classList.contains('active')) {
                    mobileOverlay.classList.remove('active');
                }
            } else {
                // Close other sheets first
                if (aiBottomSheet) aiBottomSheet.classList.remove('active');
                moreOptionsSheet.classList.add('active');
                mobileOverlay.classList.add('active');
                // Close sidebar if open
                if (sidebar.classList.contains('mobile-open')) {
                    closeMobileSidebar();
                }
            }
        }

        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleMoreSheet();
        });

        // Close More Sheet - support both click and touch
        function closeMoreSheet(e) {
            e.stopPropagation();
            e.preventDefault();
            moreOptionsSheet.classList.remove('active');
            if (!sidebar.classList.contains('mobile-open') && !aiBottomSheet?.classList.contains('active')) {
                mobileOverlay.classList.remove('active');
            }
        }
        closeMoreSheetBtn.addEventListener('click', closeMoreSheet);
        closeMoreSheetBtn.addEventListener('touchend', closeMoreSheet);

        // Delegate clicks from More Options sheet buttons to original toolbar buttons
        moreSheetBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-trigger');
                const originalBtn = document.getElementById(targetId);
                if (originalBtn) {
                    originalBtn.click();
                    // Close sheet after selection
                    moreOptionsSheet.classList.remove('active');
                    mobileOverlay.classList.remove('active');
                }
            });
        });
    }

    // Extend overlay closing logic to close all sheets
    mobileOverlay.addEventListener('click', () => {
        if (aiBottomSheet) aiBottomSheet.classList.remove('active');
        if (moreOptionsSheet) moreOptionsSheet.classList.remove('active');
    });

    console.log('Mobile module initialized');
}

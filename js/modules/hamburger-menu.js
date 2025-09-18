// Hamburger Menu Module
const HamburgerMenu = {
    // Initialize hamburger menu
    init() {
        this.setupEventListeners();
        console.log('HamburgerMenu initialized');
    },

    // Set up event listeners
    setupEventListeners() {
        // User dashboard hamburger
        document.getElementById('userHamburger')?.addEventListener('click', () => {
            this.toggleSidebar('user');
        });

        // Admin dashboard hamburger
        document.getElementById('adminHamburger')?.addEventListener('click', () => {
            this.toggleSidebar('admin');
        });

        // Officer dashboard hamburger
        document.getElementById('officerHamburger')?.addEventListener('click', () => {
            this.toggleSidebar('officer');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dashboard-sidebar') && !e.target.closest('.hamburger-btn')) {
                this.closeAllSidebars();
            }
        });

        // Close sidebar on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeAllSidebars();
            }
        });
    },

    // Toggle sidebar for specific dashboard
    toggleSidebar(dashboardType) {
        const sidebar = document.querySelector(`#${dashboardType}Dashboard .dashboard-sidebar`);
        const main = document.querySelector(`#${dashboardType}Dashboard .dashboard-main`);
        const hamburger = document.getElementById(`${dashboardType}Hamburger`);

        if (sidebar && main && hamburger) {
            const isCollapsed = sidebar.classList.contains('collapsed');
            
            if (isCollapsed) {
                this.openSidebar(sidebar, main, hamburger);
            } else {
                this.closeSidebar(sidebar, main, hamburger);
            }
        }
    },

    // Open sidebar
    openSidebar(sidebar, main, hamburger) {
        sidebar.classList.remove('collapsed');
        main.classList.remove('expanded');
        hamburger.classList.add('active');
        
        // Add smooth transition
        sidebar.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        main.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Add overlay for mobile
        if (window.innerWidth <= 768) {
            this.addOverlay();
        }
    },

    // Close sidebar
    closeSidebar(sidebar, main, hamburger) {
        sidebar.classList.add('collapsed');
        main.classList.add('expanded');
        hamburger.classList.remove('active');
        
        // Remove overlay for mobile
        this.removeOverlay();
    },

    // Add overlay for mobile
    addOverlay() {
        if (document.getElementById('sidebar-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        overlay.addEventListener('click', () => {
            this.closeAllSidebars();
        });
        
        document.body.appendChild(overlay);
        
        // Animate overlay in
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
    },

    // Remove overlay
    removeOverlay() {
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    },

    // Close all sidebars
    closeAllSidebars() {
        const sidebars = document.querySelectorAll('.dashboard-sidebar');
        const mains = document.querySelectorAll('.dashboard-main');
        const hamburgers = document.querySelectorAll('.hamburger-btn');

        sidebars.forEach(sidebar => {
            sidebar.classList.add('collapsed');
        });

        mains.forEach(main => {
            main.classList.add('expanded');
        });

        hamburgers.forEach(hamburger => {
            hamburger.classList.remove('active');
        });
        
        // Remove overlay
        this.removeOverlay();
    },

    // Check if sidebar is open
    isSidebarOpen(dashboardType) {
        const sidebar = document.querySelector(`#${dashboardType}Dashboard .dashboard-sidebar`);
        return sidebar && !sidebar.classList.contains('collapsed');
    },

    // Force close all sidebars (for mobile)
    forceCloseAll() {
        this.closeAllSidebars();
    }
};

// Make HamburgerMenu globally available
window.HamburgerMenu = HamburgerMenu;

// Hamburger Menu Module
const HamburgerMenu = {
    isInitialized: false,
    activeSidebar: null,
    overlay: null,

    // Initialize hamburger menu
    init() {
        if (this.isInitialized) return;
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('HamburgerMenu initialized');
    },

    // Set up event listeners
    setupEventListeners() {
        // User dashboard hamburger
        document.getElementById('userHamburger')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSidebar('user');
        });

        // Admin dashboard hamburger
        document.getElementById('adminHamburger')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSidebar('admin');
        });

        // Officer dashboard hamburger
        document.getElementById('officerHamburger')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSidebar('officer');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dashboard-sidebar') && 
                !e.target.closest('.hamburger-btn') && 
                !e.target.closest('.mobile-overlay')) {
                this.closeAllSidebars();
            }
        });

        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllSidebars();
            }
        });

        // Close sidebar on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeAllSidebars();
            }
        });

        // Prevent body scroll when mobile sidebar is open
        document.addEventListener('touchmove', (e) => {
            if (this.activeSidebar && window.innerWidth <= 768) {
                e.preventDefault();
            }
        }, { passive: false });
    },

    // Toggle sidebar for specific dashboard
    toggleSidebar(dashboardType) {
        const sidebar = document.querySelector(`#${dashboardType}Dashboard .dashboard-sidebar`);
        const main = document.querySelector(`#${dashboardType}Dashboard .dashboard-main`);
        const hamburger = document.getElementById(`${dashboardType}Hamburger`);

        if (!sidebar || !main || !hamburger) {
            console.warn(`Sidebar elements not found for ${dashboardType}`);
            return;
        }

        // Close any other open sidebar first
        if (this.activeSidebar && this.activeSidebar !== dashboardType) {
            this.closeAllSidebars();
        }

        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            this.openSidebar(sidebar, main, hamburger, dashboardType);
        } else {
            this.closeSidebar(sidebar, main, hamburger);
        }
    },

    // Open sidebar
    openSidebar(sidebar, main, hamburger, dashboardType) {
        try {
            sidebar.classList.remove('collapsed');
            main.classList.add('expanded');
            hamburger.classList.add('active');
            this.activeSidebar = dashboardType;
            
            // Add smooth transition
            sidebar.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            main.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Add overlay for mobile
            if (window.innerWidth <= 768) {
                this.addOverlay();
                document.body.style.overflow = 'hidden';
            }
            
            console.log(`Sidebar opened for ${dashboardType}`);
        } catch (error) {
            console.error('Error opening sidebar:', error);
        }
    },

    // Close sidebar
    closeSidebar(sidebar, main, hamburger) {
        try {
            sidebar.classList.add('collapsed');
            main.classList.remove('expanded');
            hamburger.classList.remove('active');
            this.activeSidebar = null;
            
            // Remove overlay for mobile
            this.removeOverlay();
            document.body.style.overflow = '';
            
            console.log('Sidebar closed');
        } catch (error) {
            console.error('Error closing sidebar:', error);
        }
    },

    // Add overlay for mobile
    addOverlay() {
        if (this.overlay) return;
        
        try {
            this.overlay = document.createElement('div');
            this.overlay.className = 'mobile-overlay';
            this.overlay.addEventListener('click', () => this.closeAllSidebars());
            document.body.appendChild(this.overlay);
            
            // Add active class after a short delay to ensure smooth transition
            requestAnimationFrame(() => {
                if (this.overlay) {
                    this.overlay.classList.add('active');
                }
            });
        } catch (error) {
            console.error('Error adding overlay:', error);
        }
    },

    // Remove overlay
    removeOverlay() {
        if (!this.overlay) return;
        
        try {
            this.overlay.classList.remove('active');
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                    this.overlay = null;
                }
            }, 300);
        } catch (error) {
            console.error('Error removing overlay:', error);
        }
    },

    // Close all sidebars
    closeAllSidebars() {
        try {
            const sidebars = document.querySelectorAll('.dashboard-sidebar');
            const mains = document.querySelectorAll('.dashboard-main');
            const hamburgers = document.querySelectorAll('.hamburger-btn');

            sidebars.forEach(sidebar => sidebar.classList.add('collapsed'));
            mains.forEach(main => main.classList.remove('expanded'));
            hamburgers.forEach(hamburger => hamburger.classList.remove('active'));
            
            this.activeSidebar = null;
            this.removeOverlay();
            document.body.style.overflow = '';
            
            console.log('All sidebars closed');
        } catch (error) {
            console.error('Error closing all sidebars:', error);
        }
    },

    // Check if sidebar is open
    isSidebarOpen(dashboardType) {
        const sidebar = document.querySelector(`#${dashboardType}Dashboard .dashboard-sidebar`);
        return sidebar && !sidebar.classList.contains('collapsed');
    },

    // Force close all sidebars (used during logout)
    forceCloseAll() {
        try {
            this.closeAllSidebars();
            
            // Force reset all elements
            setTimeout(() => {
                const sidebars = document.querySelectorAll('.dashboard-sidebar');
                const mains = document.querySelectorAll('.dashboard-main');
                const hamburgers = document.querySelectorAll('.hamburger-btn');
                const overlays = document.querySelectorAll('.mobile-overlay');

                sidebars.forEach(sidebar => {
                    sidebar.classList.add('collapsed');
                    sidebar.style.transform = 'translateX(-100%)';
                    sidebar.style.opacity = '0';
                });
                
                mains.forEach(main => {
                    main.classList.remove('expanded');
                    main.style.marginLeft = '0';
                });
                
                hamburgers.forEach(hamburger => {
                    hamburger.classList.remove('active');
                });
                
                overlays.forEach(overlay => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                });
                
                this.overlay = null;
                this.activeSidebar = null;
                document.body.style.overflow = '';
                
                console.log('Force close completed');
            }, 100);
        } catch (error) {
            console.error('Error in force close:', error);
        }
    },

    // Get active sidebar
    getActiveSidebar() {
        return this.activeSidebar;
    }
};

// Make HamburgerMenu globally available
window.HamburgerMenu = HamburgerMenu;

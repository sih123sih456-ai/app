// Main Application Controller
const App = {
    currentUser: null,
    currentRole: null,
    modules: {},

    // Initialize the application
    init() {
        console.log('Initializing Civic Issue Reporting System...');
        
        // Initialize configuration
        Config.init();
        
        // Initialize core modules
        this.initializeCore();
        
        // Initialize feature modules
        this.initializeModules();
        
        // Set up global event listeners
        this.setupGlobalEvents();
        
        // Show login page
        this.showPage('loginPage');
        
        console.log('Application initialized successfully');
    },

    // Initialize core functionality
    initializeCore() {
        // Initialize data
        DataManager.init();
        
        // Initialize notifications
        Notifications.init();
        
        // Initialize maps
        MapManager.init();
    },

    // Initialize all feature modules
    initializeModules() {
        this.modules = {
            language: LanguageModule,
            imageProcessor: ImageProcessor,
            hamburgerMenu: HamburgerMenu,
            login: LoginModule,
            userDashboard: UserDashboard,
            adminDashboard: AdminDashboard,
            adminRequests: AdminRequests,
            officerDashboard: OfficerDashboard,
            chatbot: ChatbotModule
        };

        // Initialize each module
        Object.values(this.modules).forEach(module => {
            if (module.init) {
                module.init();
            }
        });
    },

    // Set up global event listeners
    setupGlobalEvents() {
        // Global logout handlers
        document.addEventListener('click', (e) => {
            if (e.target.id === 'userLogout' || e.target.id === 'adminLogout' || e.target.id === 'officerLogout') {
                this.logout();
            }
        });

        // Global modal close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Global navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-btn')) {
                const section = e.target.getAttribute('data-section');
                this.switchDashboardSection(section);
            }
        });
    },

    // Page navigation
    showPage(pageId) {
        try {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
                page.style.display = 'none';
            });
            
            // Show target page
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.style.display = 'block';
                targetPage.classList.add('active');
            } else {
                console.error(`Page with ID '${pageId}' not found`);
            }
        } catch (error) {
            console.error('Error showing page:', error);
        }
    },

    // Dashboard section switching
    switchDashboardSection(sectionId) {
        try {
            if (!sectionId) {
                console.warn('No section ID provided for dashboard switching');
                return;
            }
            
            // Update nav buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-section') === sectionId);
            });
            
            // Update sections
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.classList.toggle('active', section.id === sectionId);
            });
            
            // Initialize specific sections that need it
            if (sectionId === 'admin-map' || sectionId === 'officer-map') {
                setTimeout(() => {
                    try {
                        if (sectionId === 'admin-map' && MapManager.initializeAdminMap) {
                            MapManager.initializeAdminMap();
                        } else if (sectionId === 'officer-map' && MapManager.initializeOfficerMap) {
                            MapManager.initializeOfficerMap();
                        }
                    } catch (mapError) {
                        console.error('Error initializing map:', mapError);
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error switching dashboard section:', error);
        }
    },

    // Authentication
    login(user, role) {
        try {
            // Validate inputs
            if (!user || !role) {
                throw new Error('Invalid user or role');
            }
            
            this.currentUser = user;
            this.currentRole = role;
            
            // Clear any existing notifications
            Notifications.clear();
            
            // Hide login page completely
            const loginPage = document.getElementById('loginPage');
            if (loginPage) {
                loginPage.style.display = 'none';
                loginPage.classList.remove('active');
            }
            
            // Show appropriate dashboard
            switch (role) {
                case 'user':
                    this.showPage('userDashboard');
                    if (this.modules.userDashboard && this.modules.userDashboard.show) {
                        this.modules.userDashboard.show();
                    }
                    break;
                case 'admin':
                    this.showPage('adminDashboard');
                    if (this.modules.adminDashboard && this.modules.adminDashboard.show) {
                        this.modules.adminDashboard.show();
                    }
                    break;
                case 'officer':
                    this.showPage('officerDashboard');
                    if (this.modules.officerDashboard && this.modules.officerDashboard.show) {
                        this.modules.officerDashboard.show();
                    }
                    break;
                default:
                    throw new Error('Invalid role');
            }
            
            // Small delay to ensure UI is ready
            setTimeout(() => {
                Notifications.show('Login successful!', 'success');
            }, 100);
            
        } catch (error) {
            console.error('Login error:', error);
            Notifications.error('Login failed. Please try again.');
            // Don't call logout() as it shows "Logged out successfully"
            // Just reset the state without showing logout message
            this.currentUser = null;
            this.currentRole = null;
        }
    },

    // Logout
    logout() {
        try {
            this.currentUser = null;
            this.currentRole = null;
            
            // Clear all notifications
            Notifications.clear();
            
            // Hide all dashboard pages
            document.querySelectorAll('.page').forEach(page => {
                page.style.display = 'none';
                page.classList.remove('active');
            });
            
            // Show login page
            const loginPage = document.getElementById('loginPage');
            if (loginPage) {
                loginPage.style.display = 'block';
                loginPage.classList.add('active');
            }
            
            // Reset all forms
            this.resetAllForms();
            
            // Close all sidebars
            if (this.modules.hamburgerMenu) {
                this.modules.hamburgerMenu.forceCloseAll();
            }
            
            // Clear any maps
            if (MapManager.maps) {
                Object.values(MapManager.maps).forEach(map => {
                    if (map && map.remove) {
                        map.remove();
                    }
                });
                MapManager.maps = {};
            }
            
            // Reset language if needed
            if (this.modules.language) {
                this.modules.language.applyLanguage();
            }
            
            // Show logout notification
            Notifications.show('Logged out successfully', 'info');
            
            // Note: Removed auto-reload to preserve localStorage data
            // Data will persist across sessions as requested
            
        } catch (error) {
            console.error('Logout error:', error);
            // Force reload if logout fails
            window.location.reload();
        }
    },

    // Reset all forms
    resetAllForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.reset();
        });
        
        // Clear photo previews
        const photoPreviews = document.querySelectorAll('#photoPreview');
        photoPreviews.forEach(preview => {
            preview.innerHTML = '';
        });
        
        // Clear map containers
        const mapContainers = document.querySelectorAll('.map-container');
        mapContainers.forEach(container => {
            container.innerHTML = '';
        });
        
        // Reset location inputs
        const locationInputs = document.querySelectorAll('#issueLocation');
        locationInputs.forEach(input => {
            input.value = '';
        });
        
        // Clear chatbot messages
        const chatbotMessages = document.querySelectorAll('#chatbotMessages');
        chatbotMessages.forEach(messages => {
            messages.innerHTML = '';
        });
    },

    // Modal management
    closeModal() {
        const modal = document.getElementById('issueModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },

    // Get current role
    getCurrentRole() {
        return this.currentRole;
    },

    // Get module
    getModule(moduleName) {
        return this.modules[moduleName];
    }
};

// Make App globally available
window.App = App;

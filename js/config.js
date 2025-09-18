// Configuration file for the Civic Issue Reporting System
const Config = {
    // API Configuration
    GEMINI_API_KEY: 'AIzaSyD8io1xki1Y1wcBja1uePolNk7VNmHVTpg', // Replace with your actual Gemini API key
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    
    // Map Configuration
    DEFAULT_MAP_CENTER: [40.7128, -74.0060], // New York City coordinates
    DEFAULT_ZOOM_LEVEL: 13,
    MAP_TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    MAP_ATTRIBUTION: '© OpenStreetMap contributors',
    
    // File Upload Configuration
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    
    // Notification Configuration
    NOTIFICATION_DURATION: {
        SUCCESS: 5000,
        ERROR: 7000,
        WARNING: 6000,
        INFO: 5000
    },
    
    // Auto-refresh Configuration
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
    
    // Pagination Configuration
    ITEMS_PER_PAGE: 10,
    
    // Escalation Configuration
    ESCALATION_LEVELS: ['Block', 'District', 'State', 'Court'],
    
    // Issue Status Configuration
    ISSUE_STATUSES: {
        PENDING: 'pending',
        IN_REVIEW: 'in-review',
        IN_PROGRESS: 'in-progress',
        RESOLVED: 'resolved'
    },
    
    // Urgency Levels
    URGENCY_LEVELS: {
        HIGH: 'high',
        MEDIUM: 'medium',
        LOW: 'low'
    },
    
    // User Roles
    USER_ROLES: {
        USER: 'user',
        ADMIN: 'admin',
        OFFICER: 'officer'
    },
    
    // Access Request Status
    REQUEST_STATUS: {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected'
    },
    
    // Default Admin Credentials
    DEFAULT_ADMIN: {
        EMAIL: 'admin@gmail.com',
        PASSWORD: 'admin123'
    },
    
    // Chatbot Configuration
    CHATBOT: {
        MAX_HISTORY_LENGTH: 50,
        RESPONSE_DELAY: 1000, // 1 second
        FALLBACK_ENABLED: true
    },
    
    // Map Marker Configuration
    MARKER_CONFIG: {
        RADIUS: 8,
        WEIGHT: 2,
        FILL_OPACITY: 0.7
    },
    
    // Validation Rules
    VALIDATION: {
        MIN_TITLE_LENGTH: 5,
        MIN_DESCRIPTION_LENGTH: 10,
        MIN_PASSWORD_LENGTH: 6,
        MAX_TITLE_LENGTH: 100,
        MAX_DESCRIPTION_LENGTH: 1000
    },
    
    // Feature Flags
    FEATURES: {
        GEMINI_CHATBOT: true,
        MAP_INTEGRATION: true,
        PHOTO_UPLOAD: true,
        REAL_TIME_UPDATES: true,
        NOTIFICATIONS: true,
        ESCALATION_SYSTEM: true
    },
    
    // Development Configuration
    DEBUG: false,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    
    // Initialize configuration
    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
    },
    
    // Load configuration from localStorage
    loadFromLocalStorage() {
        const savedConfig = localStorage.getItem('civicAppConfig');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                Object.assign(this, parsed);
            } catch (error) {
                console.warn('Failed to load configuration from localStorage:', error);
            }
        }
    },
    
    // Save configuration to localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('civicAppConfig', JSON.stringify(this));
        } catch (error) {
            console.warn('Failed to save configuration to localStorage:', error);
        }
    },
    
    // Set API key
    setApiKey(apiKey) {
        this.GEMINI_API_KEY = apiKey;
        this.saveToLocalStorage();
    },
    
    // Get API key
    getApiKey() {
        return this.GEMINI_API_KEY;
    },
    
    // Check if API key is configured
    isApiKeyConfigured() {
        return this.GEMINI_API_KEY && this.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
    },
    
    // Set feature flag
    setFeature(feature, enabled) {
        if (this.FEATURES.hasOwnProperty(feature)) {
            this.FEATURES[feature] = enabled;
            this.saveToLocalStorage();
        }
    },
    
    // Check if feature is enabled
    isFeatureEnabled(feature) {
        return this.FEATURES[feature] || false;
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Save configuration on changes
        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
        });
    },
    
    // Reset to defaults
    reset() {
        localStorage.removeItem('civicAppConfig');
        location.reload();
    }
};

// Make Config globally available
window.Config = Config;

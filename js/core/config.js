// Configuration Module
const Config = {
    // API Configuration
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    API_KEY: null,

    // Initialize configuration
    init() {
        this.loadApiKey();
        console.log('Config initialized');
    },

    // Load API key from localStorage or environment
    loadApiKey() {
        // Try to get from localStorage first
        this.API_KEY = localStorage.getItem('gemini_api_key');
        
        // If not found, try to get from environment (for development)
        if (!this.API_KEY) {
            // In a real app, you'd get this from environment variables
            this.API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
        }
    },

    // Get API key
    getApiKey() {
        return this.API_KEY;
    },

    // Check if API key is configured
    isApiKeyConfigured() {
        return this.API_KEY && this.API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' && this.API_KEY.length > 10;
    },

    // Set API key
    setApiKey(apiKey) {
        this.API_KEY = apiKey;
        localStorage.setItem('gemini_api_key', apiKey);
    },

    // Get API URL
    getApiUrl() {
        return this.GEMINI_API_URL;
    }
};

// Make Config globally available
window.Config = Config;

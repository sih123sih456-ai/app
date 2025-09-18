// Language Support Module
const LanguageModule = {
    currentLanguage: 'en',
    translations: {
        en: {
            // Login Page
            'civic_issue_reporter': 'Civic Issue Reporter',
            'report_track_issues': 'Report and track civic issues in your community',
            'citizen': 'Citizen',
            'admin_officer': 'Admin/Officer',
            'citizen_dashboard': 'Citizen Dashboard',
            'admin_dashboard': 'Admin Dashboard',
            'officer_dashboard': 'Officer Dashboard',
            'admin_details': 'Admin Details',
            'login': 'Login',
            'register': 'Register',
            'access_request': 'Access Request',
            'email': 'Email',
            'password': 'Password',
            'full_name': 'Full Name',
            'phone_number': 'Phone Number',
            'department': 'Department',
            'location': 'Location',
            'experience': 'Years of Experience',
            'reason_access': 'Reason for Access Request',
            'upload_profile': 'Upload Profile Image',
            'login_citizen': 'Login as Citizen',
            'register_citizen': 'Register as Citizen',
            'login_admin': 'Login as Admin',
            'submit_request': 'Submit Access Request',
            
            // Dashboard
            'welcome': 'Welcome',
            'logout': 'Logout',
            'overview': 'Overview',
            'submit_issue': 'Submit Issue',
            'track_issues': 'Track Issues',
            'help_support': 'Help & Support',
            'all_issues': 'All Issues',
            'access_requests': 'Access Requests',
            'issue_map': 'Issue Map',
            'assigned_issues': 'Assigned Issues',
            
            // Issue Form
            'issue_title': 'Issue Title',
            'urgency_level': 'Urgency Level',
            'description': 'Description',
            'select_urgency': 'Select Urgency',
            'high': 'High',
            'medium': 'Medium',
            'low': 'Low',
            'enter_location': 'Enter location or click on map',
            'select_on_map': 'Select on Map',
            'photo_evidence': 'Photo Evidence',
            'submit_issue': 'Submit Issue',
            
            // Status
            'pending': 'Pending',
            'in_review': 'In Review',
            'in_progress': 'In Progress',
            'resolved': 'Resolved',
            
            // Actions
            'view_details': 'View Details',
            'assign': 'Assign',
            'start_work': 'Start Work',
            'resolve': 'Resolve',
            'approve': 'Approve',
            'reject': 'Reject',
            
            // Statistics
            'pending_issues': 'Pending Issues',
            'in_review_issues': 'In Review',
            'resolved_issues': 'Resolved',
            'access_requests_count': 'Access Requests',
            'assigned_issues_count': 'Assigned Issues',
            'in_progress_issues': 'In Progress',
            
            // Notifications
            'login_successful': 'Login successful!',
            'registration_successful': 'Registration successful!',
            'issue_submitted': 'Issue submitted successfully!',
            'issue_assigned': 'Issue assigned successfully!',
            'status_updated': 'Issue status updated!',
            'request_approved': 'Access request approved!',
            'request_rejected': 'Access request rejected',
            'logged_out': 'Logged out successfully',
            
            // Chatbot
            'ask_question': 'Ask a question...',
            'civicbot_welcome': 'Hello! I\'m here to help you with civic issues. You can ask me about:',
            'issue_status_updates': 'Issue status updates',
            'how_to_submit': 'How to submit a new issue',
            'your_issues': 'Your submitted issues',
            'general_guidance': 'General guidance',
            
            // Common
            'close': 'Close',
            'cancel': 'Cancel',
            'save': 'Save',
            'edit': 'Edit',
            'delete': 'Delete',
            'search': 'Search',
            'filter': 'Filter',
            'all': 'All',
            'no_issues_found': 'No issues found',
            'no_requests_found': 'No access requests found',
            'no_admins_found': 'No admin details found',
            'loading': 'Loading...',
            'error': 'Error',
            'success': 'Success',
            'warning': 'Warning',
            'info': 'Info',
            'show_on_map': 'Show on Map',
            'assign_issue': 'Assign Issue',
            'system_administrator': 'System Administrator',
            'active': 'Active',
            'phone': 'Phone',
            'department': 'Department',
            'experience': 'Experience',
            'status': 'Status'
        },
        ta: {
            // Login Page
            'civic_issue_reporter': 'குடிமை பிரச்சினை அறிக்கை அமைப்பு',
            'report_track_issues': 'உங்கள் சமூகத்தில் குடிமை பிரச்சினைகளை அறிக்கை செய்து கண்காணிக்கவும்',
            'citizen': 'குடிமகன்',
            'admin_officer': 'நிர்வாகி/அதிகாரி',
            'citizen_dashboard': 'குடிமகன் கட்டுப்பாட்டு பலகை',
            'admin_dashboard': 'நிர்வாகி கட்டுப்பாட்டு பலகை',
            'officer_dashboard': 'அதிகாரி கட்டுப்பாட்டு பலகை',
            'admin_details': 'நிர்வாகி விவரங்கள்',
            'login': 'உள்நுழைவு',
            'register': 'பதிவு',
            'access_request': 'அணுகல் கோரிக்கை',
            'email': 'மின்னஞ்சல்',
            'password': 'கடவுச்சொல்',
            'full_name': 'முழு பெயர்',
            'phone_number': 'தொலைபேசி எண்',
            'department': 'துறை',
            'location': 'இடம்',
            'experience': 'அனுபவ ஆண்டுகள்',
            'reason_access': 'அணுகல் கோரிக்கைக்கான காரணம்',
            'upload_profile': 'சுயவிவர படத்தை பதிவேற்றவும்',
            'login_citizen': 'குடிமகனாக உள்நுழையவும்',
            'register_citizen': 'குடிமகனாக பதிவு செய்யவும்',
            'login_admin': 'நிர்வாகியாக உள்நுழையவும்',
            'submit_request': 'அணுகல் கோரிக்கையை சமர்ப்பிக்கவும்',
            
            // Dashboard
            'welcome': 'வரவேற்கிறோம்',
            'logout': 'வெளியேறு',
            'overview': 'கண்ணோட்டம்',
            'submit_issue': 'பிரச்சினையை சமர்ப்பிக்கவும்',
            'track_issues': 'பிரச்சினைகளை கண்காணிக்கவும்',
            'help_support': 'உதவி & ஆதரவு',
            'all_issues': 'அனைத்து பிரச்சினைகள்',
            'access_requests': 'அணுகல் கோரிக்கைகள்',
            'issue_map': 'பிரச்சினை வரைபடம்',
            'assigned_issues': 'நியமிக்கப்பட்ட பிரச்சினைகள்',
            
            // Issue Form
            'issue_title': 'பிரச்சினை தலைப்பு',
            'urgency_level': 'அவசர நிலை',
            'description': 'விளக்கம்',
            'select_urgency': 'அவசரத்தை தேர்ந்தெடுக்கவும்',
            'high': 'உயர்',
            'medium': 'நடுத்தர',
            'low': 'குறைந்த',
            'enter_location': 'இடத்தை உள்ளிடவும் அல்லது வரைபடத்தில் கிளிக் செய்யவும்',
            'select_on_map': 'வரைபடத்தில் தேர்ந்தெடுக்கவும்',
            'photo_evidence': 'புகைப்பட ஆதாரம்',
            'submit_issue': 'பிரச்சினையை சமர்ப்பிக்கவும்',
            
            // Status
            'pending': 'நிலுவையில்',
            'in_review': 'மறுஆய்வில்',
            'in_progress': 'முன்னேற்றத்தில்',
            'resolved': 'தீர்வு கண்டது',
            
            // Actions
            'view_details': 'விவரங்களை பார்க்கவும்',
            'assign': 'நியமிக்கவும்',
            'start_work': 'வேலையைத் தொடங்கவும்',
            'resolve': 'தீர்வு காணவும்',
            'approve': 'அனுமதிக்கவும்',
            'reject': 'நிராகரிக்கவும்',
            
            // Statistics
            'pending_issues': 'நிலுவை பிரச்சினைகள்',
            'in_review_issues': 'மறுஆய்வில்',
            'resolved_issues': 'தீர்வு கண்டது',
            'access_requests_count': 'அணுகல் கோரிக்கைகள்',
            'assigned_issues_count': 'நியமிக்கப்பட்ட பிரச்சினைகள்',
            'in_progress_issues': 'முன்னேற்றத்தில்',
            
            // Notifications
            'login_successful': 'உள்நுழைவு வெற்றிகரமாக!',
            'registration_successful': 'பதிவு வெற்றிகரமாக!',
            'issue_submitted': 'பிரச்சினை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
            'issue_assigned': 'பிரச்சினை வெற்றிகரமாக நியமிக்கப்பட்டது!',
            'status_updated': 'பிரச்சினை நிலை புதுப்பிக்கப்பட்டது!',
            'request_approved': 'அணுகல் கோரிக்கை அனுமதிக்கப்பட்டது!',
            'request_rejected': 'அணுகல் கோரிக்கை நிராகரிக்கப்பட்டது',
            'logged_out': 'வெற்றிகரமாக வெளியேறியது',
            
            // Chatbot
            'ask_question': 'ஒரு கேள்வியைக் கேளுங்கள்...',
            'civicbot_welcome': 'வணக்கம்! குடிமை பிரச்சினைகளில் உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன். நீங்கள் என்னைக் கேட்கலாம்:',
            'issue_status_updates': 'பிரச்சினை நிலை புதுப்பிப்புகள்',
            'how_to_submit': 'புதிய பிரச்சினையை எவ்வாறு சமர்ப்பிப்பது',
            'your_issues': 'உங்கள் சமர்ப்பிக்கப்பட்ட பிரச்சினைகள்',
            'general_guidance': 'பொது வழிகாட்டுதல்',
            
            // Common
            'close': 'மூடு',
            'cancel': 'ரத்து செய்',
            'save': 'சேமி',
            'edit': 'திருத்து',
            'delete': 'நீக்கு',
            'search': 'தேடு',
            'filter': 'வடிகட்டு',
            'all': 'அனைத்தும்',
            'no_issues_found': 'பிரச்சினைகள் எதுவும் கிடைக்கவில்லை',
            'no_requests_found': 'அணுகல் கோரிக்கைகள் எதுவும் கிடைக்கவில்லை',
            'no_admins_found': 'நிர்வாகி விவரங்கள் எதுவும் கிடைக்கவில்லை',
            'loading': 'ஏற்றுகிறது...',
            'error': 'பிழை',
            'success': 'வெற்றி',
            'warning': 'எச்சரிக்கை',
            'info': 'தகவல்',
            'show_on_map': 'வரைபடத்தில் காட்டு',
            'assign_issue': 'பிரச்சினையை நியமி',
            'system_administrator': 'கணினி நிர்வாகி',
            'active': 'செயலில்',
            'phone': 'தொலைபேசி',
            'department': 'துறை',
            'experience': 'அனுபவம்',
            'status': 'நிலை'
        }
    },

    // Initialize language module
    init() {
        this.loadLanguage();
        this.setupEventListeners();
        console.log('LanguageModule initialized');
    },

    // Set up event listeners
    setupEventListeners() {
        // Language toggle button (if exists)
        const langToggle = document.getElementById('languageToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }
    },

    // Load saved language or default
    loadLanguage() {
        const savedLang = localStorage.getItem('civicAppLanguage');
        if (savedLang && this.translations[savedLang]) {
            this.currentLanguage = savedLang;
        }
        this.applyLanguage();
    },

    // Apply current language to all elements
    applyLanguage() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translate(key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    },

    // Translate a key
    translate(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    },

    // Set language
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('civicAppLanguage', lang);
            this.applyLanguage();
            
            // Update body class for Tamil
            if (lang === 'ta') {
                document.body.classList.add('tamil');
            } else {
                document.body.classList.remove('tamil');
            }
            
            // Update document direction for RTL languages if needed
            if (lang === 'ar' || lang === 'he') {
                document.documentElement.dir = 'rtl';
            } else {
                document.documentElement.dir = 'ltr';
            }
            
            // Update language toggle button text
            const currentLangSpan = document.getElementById('currentLang');
            if (currentLangSpan) {
                currentLangSpan.textContent = lang === 'en' ? 'English' : 'தமிழ்';
            }
            
            Notifications.show(`Language changed to ${lang === 'en' ? 'English' : 'Tamil'}`, 'success');
        }
    },

    // Toggle between languages
    toggleLanguage() {
        const newLang = this.currentLanguage === 'en' ? 'ta' : 'en';
        this.setLanguage(newLang);
    },

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    },

    // Check if current language is Tamil
    isTamil() {
        return this.currentLanguage === 'ta';
    },

    // Check if current language is English
    isEnglish() {
        return this.currentLanguage === 'en';
    },

    // Format date according to language
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        if (this.isTamil()) {
            // For Tamil, we might want to use Tamil numerals
            return new Date(date).toLocaleDateString('ta-IN', finalOptions);
        } else {
            return new Date(date).toLocaleDateString('en-US', finalOptions);
        }
    },

    // Format number according to language
    formatNumber(number) {
        if (this.isTamil()) {
            return new Intl.NumberFormat('ta-IN').format(number);
        } else {
            return new Intl.NumberFormat('en-US').format(number);
        }
    }
};

// Make LanguageModule globally available
window.LanguageModule = LanguageModule;

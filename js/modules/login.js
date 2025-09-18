// Login Module
const LoginModule = {
    // Initialize login module
    init() {
        this.setupEventListeners();
        console.log('LoginModule initialized');
    },

    // Set up event listeners
    setupEventListeners() {
        // Role toggle buttons
        document.getElementById('userToggle').addEventListener('click', () => this.switchRole('user'));
        document.getElementById('adminToggle').addEventListener('click', () => this.switchRole('admin'));
        
        // Tab buttons
        document.getElementById('userLoginTab').addEventListener('click', () => this.switchAuthTab('user', 'login'));
        document.getElementById('userRegisterTab').addEventListener('click', () => this.switchAuthTab('user', 'register'));
        document.getElementById('adminLoginTab').addEventListener('click', () => this.switchAuthTab('admin', 'login'));
        document.getElementById('adminRequestTab').addEventListener('click', () => this.switchAuthTab('admin', 'request'));
        
        // Form submissions
        document.getElementById('userLoginForm').addEventListener('submit', (e) => this.handleUserLogin(e));
        document.getElementById('userRegisterForm').addEventListener('submit', (e) => this.handleUserRegister(e));
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => this.handleAdminLogin(e));
        document.getElementById('adminRequestForm').addEventListener('submit', (e) => this.handleAdminRequest(e));
    },

    // Switch between user and admin roles
    switchRole(role) {
        document.getElementById('userToggle').classList.toggle('active', role === 'user');
        document.getElementById('adminToggle').classList.toggle('active', role === 'admin');
        document.getElementById('userAuth').classList.toggle('active', role === 'user');
        document.getElementById('adminAuth').classList.toggle('active', role === 'admin');
    },

    // Switch between login and register/request tabs
    switchAuthTab(role, tab) {
        if (role === 'user') {
            document.getElementById('userLoginTab').classList.toggle('active', tab === 'login');
            document.getElementById('userRegisterTab').classList.toggle('active', tab === 'register');
            document.getElementById('userLoginForm').classList.toggle('active', tab === 'login');
            document.getElementById('userRegisterForm').classList.toggle('active', tab === 'register');
        } else {
            document.getElementById('adminLoginTab').classList.toggle('active', tab === 'login');
            document.getElementById('adminRequestTab').classList.toggle('active', tab === 'request');
            document.getElementById('adminLoginForm').classList.toggle('active', tab === 'login');
            document.getElementById('adminRequestForm').classList.toggle('active', tab === 'request');
        }
    },

    // Handle user login
    handleUserLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('userEmail').value.trim();
        const password = document.getElementById('userPassword').value;
        
        // Validation
        if (!email || !password) {
            Notifications.error('Please fill in all fields');
            return;
        }
        
        if (!Utils.validateEmail(email)) {
            Notifications.error('Please enter a valid email address');
            return;
        }
        
        // Check if user exists
        const user = DataManager.getUserByEmail(email);
        if (!user) {
            Notifications.error('User not found. Please register first.');
            return;
        }
        
        // Simple password validation (in real app, this would be server-side)
        if (password.length < 6) {
            Notifications.error('Password must be at least 6 characters');
            return;
        }
        
        // Login successful
        App.login(user, 'user');
    },

    // Handle user registration
    handleUserRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userRegEmail').value.trim();
        const password = document.getElementById('userRegPassword').value;
        const phone = document.getElementById('userPhone').value.trim();
        
        // Validation
        if (!name || !email || !password || !phone) {
            Notifications.error('Please fill in all fields');
            return;
        }
        
        if (!Utils.validateEmail(email)) {
            Notifications.error('Please enter a valid email address');
            return;
        }
        
        if (!Utils.validatePhone(phone)) {
            Notifications.error('Please enter a valid phone number');
            return;
        }
        
        if (password.length < 6) {
            Notifications.error('Password must be at least 6 characters');
            return;
        }
        
        // Check if user already exists
        if (DataManager.getUserByEmail(email)) {
            Notifications.error('User with this email already exists');
            return;
        }
        
        // Create user
        const user = DataManager.createUser({
            name,
            email,
            phone,
            role: 'user'
        });
        
        // Login successful
        App.login(user, 'user');
    },

    // Handle admin login
    handleAdminLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        
        console.log('Admin login attempt:', { email, password });
        
        // Validation
        if (!email || !password) {
            Notifications.error('Please fill in all fields');
            return;
        }
        
        if (!Utils.validateEmail(email)) {
            Notifications.error('Please enter a valid email address');
            return;
        }
        
        // Check admin credentials
        if (email === 'admin@gmail.com' && password === 'admin123') {
            const admin = {
                name: 'System Administrator',
                email: email,
                role: 'admin'
            };
            console.log('Admin credentials valid, calling App.login');
            App.login(admin, 'admin');
        } else {
            console.log('Invalid admin credentials');
            Notifications.error('Invalid admin credentials');
        }
    },

    // Handle admin access request
    handleAdminRequest(e) {
        e.preventDefault();
        
        const name = document.getElementById('adminName').value.trim();
        const email = document.getElementById('adminRegEmail').value.trim();
        const department = document.getElementById('adminDept').value.trim();
        const phone = document.getElementById('adminPhone').value.trim();
        const location = document.getElementById('adminLocation').value.trim();
        const experience = document.getElementById('adminExperience').value.trim();
        const reason = document.getElementById('adminReason').value.trim();
        const profileImage = document.getElementById('adminProfileImage').files[0];
        
        // Validation
        if (!name || !email || !department || !phone || !location || !experience || !reason) {
            Notifications.error('Please fill in all required fields');
            return;
        }
        
        if (!Utils.validateEmail(email)) {
            Notifications.error('Please enter a valid email address');
            return;
        }
        
        if (!Utils.validatePhone(phone)) {
            Notifications.error('Please enter a valid phone number');
            return;
        }
        
        if (!profileImage) {
            Notifications.error('Please upload a profile image');
            return;
        }
        
        if (!Utils.isImageFile(profileImage)) {
            Notifications.error('Please upload a valid image file');
            return;
        }
        
        // Check if request already exists
        const existingRequest = DataManager.accessRequests.find(req => req.email === email);
        if (existingRequest) {
            Notifications.error('Access request with this email already exists');
            return;
        }
        
        // Create access request
        const request = DataManager.createAccessRequest({
            name,
            email,
            department,
            phone,
            location,
            experience,
            reason,
            profileImage
        });
        
        Notifications.success('Access request submitted successfully! You will be notified when it is reviewed.');
        
        // Reset form
        e.target.reset();
    },

    // Show login page
    show() {
        App.showPage('loginPage');
    },

    // Reset forms
    resetForms() {
        document.getElementById('userLoginForm').reset();
        document.getElementById('userRegisterForm').reset();
        document.getElementById('adminLoginForm').reset();
        document.getElementById('adminRequestForm').reset();
    }
};

// Make LoginModule globally available
window.LoginModule = LoginModule;

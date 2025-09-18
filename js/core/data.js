// Data Management
const DataManager = {
    issues: [],
    accessRequests: [],
    users: [],
    officers: [],

    // Initialize with sample data
    init() {
        this.loadSampleData();
        console.log('DataManager initialized');
    },

    // Load sample data
    loadSampleData() {
        this.issues = [
            {
                id: 1,
                title: "Pothole on Main Street",
                description: "Large pothole causing traffic issues and vehicle damage",
                location: "Main Street, Downtown",
                coordinates: [40.7128, -74.0060],
                urgency: "high",
                status: "pending",
                submittedBy: "john@example.com",
                submittedDate: new Date().toISOString(),
                photos: [],
                assignedTo: null,
                escalationLevel: "Block"
            },
            {
                id: 2,
                title: "Broken Street Light",
                description: "Street light not working for the past week",
                location: "Oak Avenue, Residential Area",
                coordinates: [40.7589, -73.9851],
                urgency: "medium",
                status: "in-review",
                submittedBy: "jane@example.com",
                submittedDate: new Date(Date.now() - 86400000).toISOString(),
                photos: [],
                assignedTo: "officer1@example.com",
                escalationLevel: "Block"
            },
            {
                id: 3,
                title: "Garbage Collection Issue",
                description: "Garbage not collected for 3 days",
                location: "Park Lane, Suburb",
                coordinates: [40.7505, -73.9934],
                urgency: "low",
                status: "resolved",
                submittedBy: "bob@example.com",
                submittedDate: new Date(Date.now() - 172800000).toISOString(),
                photos: [],
                assignedTo: "officer2@example.com",
                escalationLevel: "Block"
            }
        ];

        this.accessRequests = [
            {
                id: 1,
                name: "Sarah Johnson",
                email: "sarah.johnson@city.gov",
                department: "Public Works",
                phone: "+1-555-0123",
                location: "City Hall",
                experience: "5 years",
                reason: "Need access to manage infrastructure issues",
                profileImage: null,
                status: "pending",
                submittedDate: new Date().toISOString()
            }
        ];

        this.users = [
            {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                phone: "+1-555-0100",
                role: "user",
                registeredDate: new Date().toISOString()
            },
            {
                id: 2,
                name: "Jane Smith",
                email: "jane@example.com",
                phone: "+1-555-0101",
                role: "user",
                registeredDate: new Date().toISOString()
            }
        ];

        this.officers = [
            {
                id: 1,
                name: "Mike Wilson",
                email: "officer1@example.com",
                department: "Public Works",
                phone: "+1-555-0200",
                location: "District 1",
                experience: "3 years",
                status: "active",
                profileImage: null
            },
            {
                id: 2,
                name: "Lisa Brown",
                email: "officer2@example.com",
                department: "Environmental Services",
                phone: "+1-555-0201",
                location: "District 2",
                experience: "5 years",
                status: "active",
                profileImage: null
            }
        ];

        this.admins = [
            {
                id: 1,
                name: "System Administrator",
                email: "admin@gmail.com",
                department: "IT Administration",
                phone: "+1-555-0001",
                location: "City Hall",
                experience: "10 years",
                status: "active",
                profileImage: null,
                role: "admin"
            }
        ];
    },

    // Issue management
    createIssue(issueData) {
        const issue = {
            id: this.generateIssueId(),
            ...issueData,
            submittedDate: new Date().toISOString(),
            status: 'pending',
            escalationLevel: 'Block'
        };
        this.issues.push(issue);
        return issue;
    },

    updateIssue(issueId, updates) {
        const index = this.issues.findIndex(issue => issue.id === issueId);
        if (index !== -1) {
            this.issues[index] = { ...this.issues[index], ...updates };
            return this.issues[index];
        }
        return null;
    },

    getIssue(issueId) {
        return this.issues.find(issue => issue.id === issueId);
    },

    getIssuesByUser(userEmail) {
        return this.issues.filter(issue => issue.submittedBy === userEmail);
    },

    getIssuesByOfficer(officerEmail) {
        return this.issues.filter(issue => issue.assignedTo === officerEmail);
    },

    getAllIssues() {
        return this.issues;
    },

    // Access request management
    createAccessRequest(requestData) {
        const request = {
            id: this.generateRequestId(),
            ...requestData,
            status: 'pending',
            submittedDate: new Date().toISOString()
        };
        this.accessRequests.push(request);
        return request;
    },

    updateAccessRequest(requestId, updates) {
        const index = this.accessRequests.findIndex(request => request.id === requestId);
        if (index !== -1) {
            this.accessRequests[index] = { ...this.accessRequests[index], ...updates };
            return this.accessRequests[index];
        }
        return null;
    },

    getAccessRequest(requestId) {
        return this.accessRequests.find(request => request.id === requestId);
    },

    getAllAccessRequests() {
        return this.accessRequests;
    },

    getPendingAccessRequests() {
        return this.accessRequests.filter(request => request.status === 'pending');
    },

    // User management
    createUser(userData) {
        const user = {
            id: this.generateUserId(),
            ...userData,
            registeredDate: new Date().toISOString()
        };
        this.users.push(user);
        return user;
    },

    getUserByEmail(email) {
        return this.users.find(user => user.email === email);
    },

    // Officer management
    createOfficer(officerData) {
        const officer = {
            id: this.generateOfficerId(),
            ...officerData,
            status: 'active'
        };
        this.officers.push(officer);
        return officer;
    },

    getOfficerByEmail(email) {
        return this.officers.find(officer => officer.email === email);
    },

    getAllOfficers() {
        return this.officers;
    },

    // Admin management
    getAllAdmins() {
        return this.admins;
    },

    getAdminByEmail(email) {
        return this.admins.find(admin => admin.email === email);
    },

    createAdmin(adminData) {
        const admin = {
            id: this.generateAdminId(),
            ...adminData,
            status: 'active',
            role: 'admin'
        };
        this.admins.push(admin);
        return admin;
    },

    // Statistics
    getIssueStats() {
        const total = this.issues.length;
        const pending = this.issues.filter(issue => issue.status === 'pending').length;
        const inReview = this.issues.filter(issue => issue.status === 'in-review').length;
        const inProgress = this.issues.filter(issue => issue.status === 'in-progress').length;
        const resolved = this.issues.filter(issue => issue.status === 'resolved').length;

        return { total, pending, inReview, inProgress, resolved };
    },

    getUserIssueStats(userEmail) {
        const userIssues = this.getIssuesByUser(userEmail);
        const pending = userIssues.filter(issue => issue.status === 'pending').length;
        const inReview = userIssues.filter(issue => issue.status === 'in-review').length;
        const resolved = userIssues.filter(issue => issue.status === 'resolved').length;

        return { total: userIssues.length, pending, inReview, resolved };
    },

    getOfficerIssueStats(officerEmail) {
        const officerIssues = this.getIssuesByOfficer(officerEmail);
        const assigned = officerIssues.length;
        const inProgress = officerIssues.filter(issue => issue.status === 'in-progress').length;
        const resolved = officerIssues.filter(issue => issue.status === 'resolved').length;

        return { assigned, inProgress, resolved };
    },

    // ID generators
    generateIssueId() {
        return this.issues.length > 0 ? Math.max(...this.issues.map(i => i.id)) + 1 : 1;
    },

    generateRequestId() {
        return this.accessRequests.length > 0 ? Math.max(...this.accessRequests.map(r => r.id)) + 1 : 1;
    },

    generateUserId() {
        return this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    },

    generateOfficerId() {
        return this.officers.length > 0 ? Math.max(...this.officers.map(o => o.id)) + 1 : 1;
    },

    generateAdminId() {
        return this.admins.length > 0 ? Math.max(...this.admins.map(a => a.id)) + 1 : 1;
    },

    // Search and filter
    searchIssues(query, filters = {}) {
        let results = this.issues;

        // Text search
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(issue => 
                issue.title.toLowerCase().includes(searchTerm) ||
                issue.description.toLowerCase().includes(searchTerm) ||
                issue.location.toLowerCase().includes(searchTerm)
            );
        }

        // Apply filters
        if (filters.status) {
            results = results.filter(issue => issue.status === filters.status);
        }

        if (filters.urgency) {
            results = results.filter(issue => issue.urgency === filters.urgency);
        }

        if (filters.assignedTo) {
            results = results.filter(issue => issue.assignedTo === filters.assignedTo);
        }

        if (filters.submittedBy) {
            results = results.filter(issue => issue.submittedBy === filters.submittedBy);
        }

        return results;
    }
};

// Make DataManager globally available
window.DataManager = DataManager;

// Data Management
const DataManager = {
    issues: [],
    accessRequests: [],
    users: [],
    officers: [],
    admins: [],
    notifications: [],

    // Initialize with sample data
    init() {
        this.loadFromStorage();
        if (this.issues.length === 0) {
            this.loadSampleData();
        }
        
        // Run storage cleanup on initialization
        this.cleanupStorage();
        
        // Log storage info for debugging
        const storageInfo = this.getStorageInfo();
        if (storageInfo) {
            console.log('Storage usage:', storageInfo.totalSizeFormatted);
        }
        
        console.log('DataManager initialized');
    },

    // Load data from localStorage with error handling
    loadFromStorage() {
        try {
            console.log('Loading data from localStorage...');
            
            // Check if localStorage is available
            if (!this.isLocalStorageAvailable()) {
                console.warn('localStorage not available, using default data');
                this.loadSampleData();
                return;
            }
            
            // Load each item individually with error handling
            const storageKeys = [
                'civicIssues',
                'civicAccessRequests', 
                'civicUsers',
                'civicOfficers',
                'civicAdmins',
                'civicNotifications'
            ];
            
            let loadedCount = 0;
            
            for (const key of storageKeys) {
                try {
                    const storedData = localStorage.getItem(key);
                    if (storedData) {
                        const parsedData = JSON.parse(storedData);
                        
                        // Assign to appropriate property
                        switch (key) {
                            case 'civicIssues':
                                this.issues = Array.isArray(parsedData) ? parsedData : [];
                                console.log('Loaded issues:', this.issues.length);
                                break;
                            case 'civicAccessRequests':
                                this.accessRequests = Array.isArray(parsedData) ? parsedData : [];
                                console.log('Loaded access requests:', this.accessRequests.length);
                                break;
                            case 'civicUsers':
                                this.users = Array.isArray(parsedData) ? parsedData : [];
                                console.log('Loaded users:', this.users.length);
                                break;
                            case 'civicOfficers':
                                this.officers = Array.isArray(parsedData) ? parsedData : [];
                                console.log('Loaded officers:', this.officers.length);
                                break;
                            case 'civicAdmins':
                                this.admins = Array.isArray(parsedData) ? parsedData : [];
                                console.log('Loaded admins:', this.admins.length);
                                break;
                            case 'civicNotifications':
                                this.notifications = Array.isArray(parsedData) ? parsedData : [];
                                console.log('Loaded notifications:', this.notifications.length);
                                break;
                        }
                        loadedCount++;
                    }
                } catch (itemError) {
                    console.error(`Failed to load ${key}:`, itemError);
                    // Initialize with empty array if loading fails
                    switch (key) {
                        case 'civicIssues': this.issues = []; break;
                        case 'civicAccessRequests': this.accessRequests = []; break;
                        case 'civicUsers': this.users = []; break;
                        case 'civicOfficers': this.officers = []; break;
                        case 'civicAdmins': this.admins = []; break;
                        case 'civicNotifications': this.notifications = []; break;
                    }
                }
            }
            
            console.log(`Data loading completed: ${loadedCount}/${storageKeys.length} items loaded`);
            
            // If no data was loaded, initialize with sample data
            if (loadedCount === 0) {
                console.log('No data found, initializing with sample data');
                this.loadSampleData();
            }
            
        } catch (error) {
            console.error('Critical error loading from storage:', error);
            // Initialize with sample data as fallback
            this.loadSampleData();
        }
    },

    // Save data to localStorage with error handling and fallback
    saveToStorage() {
        try {
            console.log('Saving data to localStorage...');
            
            // Check if localStorage is available
            if (!this.isLocalStorageAvailable()) {
                console.warn('localStorage not available, using memory storage');
                return false;
            }
            
            // Try to save each item individually to identify which one fails
            const storageItems = {
                'civicIssues': this.issues,
                'civicAccessRequests': this.accessRequests,
                'civicUsers': this.users,
                'civicOfficers': this.officers,
                'civicAdmins': this.admins,
                'civicNotifications': this.notifications
            };
            
            let successCount = 0;
            let failedItems = [];
            
            for (const [key, data] of Object.entries(storageItems)) {
                try {
                    const jsonData = JSON.stringify(data);
                    localStorage.setItem(key, jsonData);
                    successCount++;
                } catch (itemError) {
                    console.error(`Failed to save ${key}:`, itemError);
                    failedItems.push(key);
                    
                    // If it's a quota exceeded error, try to clean up old data
                    if (itemError.name === 'QuotaExceededError') {
                        this.handleQuotaExceeded(key, data);
                    }
                }
            }
            
            if (successCount > 0) {
                console.log(`Data saved successfully: ${successCount}/${Object.keys(storageItems).length} items`);
            }
            
            if (failedItems.length > 0) {
                console.warn('Failed to save some items:', failedItems);
                // Don't throw error, just log warning to prevent function stopping
            }
            
            return successCount > 0;
            
        } catch (error) {
            console.error('Critical error saving to storage:', error);
            // Don't throw error to prevent function stopping
            return false;
        }
    },

    // Check if localStorage is available
    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    // Handle quota exceeded error
    handleQuotaExceeded(key, data) {
        try {
            console.log(`Handling quota exceeded for ${key}, attempting cleanup...`);
            
            // Clean up old notifications (keep only last 50)
            if (key === 'civicNotifications' && data.length > 50) {
                const cleanedNotifications = data.slice(-50);
                localStorage.setItem(key, JSON.stringify(cleanedNotifications));
                this.notifications = cleanedNotifications;
                console.log('Cleaned up old notifications');
                return;
            }
            
            // Clean up old issues (keep only last 100)
            if (key === 'civicIssues' && data.length > 100) {
                const cleanedIssues = data.slice(-100);
                localStorage.setItem(key, JSON.stringify(cleanedIssues));
                this.issues = cleanedIssues;
                console.log('Cleaned up old issues');
                return;
            }
            
            // For other data, try to save with reduced size
            const reducedData = this.reduceDataSize(data);
            localStorage.setItem(key, JSON.stringify(reducedData));
            console.log(`Reduced data size for ${key}`);
            
        } catch (cleanupError) {
            console.error('Cleanup failed:', cleanupError);
        }
    },

    // Reduce data size by removing unnecessary fields
    reduceDataSize(data) {
        if (Array.isArray(data)) {
            return data.map(item => {
                const reduced = { ...item };
                // Remove large fields that might cause quota issues
                delete reduced.photos;
                delete reduced.statusHistory;
                delete reduced.comments;
                return reduced;
            });
        }
        return data;
    },

    // Load sample data
    loadSampleData() {
        // Start with empty arrays - no static data
        this.issues = [];
        this.accessRequests = [];
        this.notifications = [];
        
        // Only add sample users, officers, and admins for testing
        this.users = [
            {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                phone: "+1-555-0123",
                role: "user",
                registeredDate: new Date().toISOString()
            },
            {
                id: 2,
                name: "Jane Smith",
                email: "jane@example.com",
                phone: "+1-555-0124",
                role: "user",
                registeredDate: new Date().toISOString()
            }
        ];
        
        this.officers = [
            {
                id: 1,
                name: "Officer Mike Johnson",
                email: "officer1@example.com",
                phone: "+1-555-0201",
                department: "Public Works",
                specialization: "Road Maintenance",
                availability: "available",
                currentIssues: 0,
                maxIssues: 5,
                rating: 4.8,
                experience: "5 years"
            },
            {
                id: 2,
                name: "Officer Sarah Wilson",
                email: "officer2@example.com",
                phone: "+1-555-0202",
                department: "Environmental Services",
                specialization: "Waste Management",
                availability: "available",
                currentIssues: 1,
                maxIssues: 4,
                rating: 4.6,
                experience: "3 years"
            },
            {
                id: 3,
                name: "Officer David Brown",
                email: "officer3@example.com",
                phone: "+1-555-0203",
                department: "Public Works",
                specialization: "Street Lighting",
                availability: "busy",
                currentIssues: 4,
                maxIssues: 5,
                rating: 4.9,
                experience: "7 years"
            },
            {
                id: 4,
                name: "Officer Lisa Davis",
                email: "officer4@example.com",
                phone: "+1-555-0204",
                department: "Transportation",
                specialization: "Traffic Management",
                availability: "available",
                currentIssues: 2,
                maxIssues: 6,
                rating: 4.7,
                experience: "4 years"
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
        try {
            const issue = {
                id: this.generateIssueId(),
                ...issueData,
                submittedDate: new Date().toISOString(),
                status: 'pending',
                escalationLevel: 'Block',
                department: issueData.department || this.determineDepartment(issueData),
                views: 0,
                upvotes: 0,
                comments: [],
                statusHistory: [{
                    status: 'pending',
                    changedBy: issueData.submittedBy,
                    changedAt: new Date().toISOString(),
                    notes: 'Issue created'
                }]
            };
            
            // Add issue to memory
            this.issues.push(issue);
            console.log('Issue added to memory:', issue.id);
            
            // Create notification for admin (with error handling)
            try {
                this.createNotification({
                    type: 'new_issue',
                    title: 'New Issue Reported',
                    message: `New issue "${issue.title}" has been reported by ${issueData.submittedBy}`,
                    recipient: 'admin',
                    issueId: issue.id,
                    priority: issue.urgency
                });
            } catch (notificationError) {
                console.warn('Failed to create notification:', notificationError);
                // Continue without notification
            }
            
            // Save to storage (with error handling)
            const saveSuccess = this.saveToStorage();
            if (!saveSuccess) {
                console.warn('Failed to save to storage, but issue created in memory');
            }
            
            return issue;
            
        } catch (error) {
            console.error('Error creating issue:', error);
            // Return a basic issue object to prevent complete failure
            return {
                id: Date.now(),
                ...issueData,
                submittedDate: new Date().toISOString(),
                status: 'pending',
                escalationLevel: 'Block',
                department: 'General Services',
                views: 0,
                upvotes: 0,
                comments: [],
                statusHistory: [{
                    status: 'pending',
                    changedBy: issueData.submittedBy || 'unknown',
                    changedAt: new Date().toISOString(),
                    notes: 'Issue created (with errors)'
                }]
            };
        }
    },

    // Determine department based on issue content with enhanced matching
    determineDepartment(issueData) {
        const title = (issueData.title || '').toLowerCase();
        const description = (issueData.description || '').toLowerCase();
        const location = (issueData.location || '').toLowerCase();
        
        // Enhanced keywords for different departments with more specific terms
        const departmentKeywords = {
            'Waste Water Department': [
                'sewer', 'sewage', 'wastewater', 'drainage', 'drain', 'pipe', 'manhole', 
                'sewer line', 'sewage treatment', 'waste water', 'drainage system', 
                'blocked drain', 'sewer backup', 'overflow', 'septic', 'wastewater treatment'
            ],
            'Road Construction Department': [
                'road', 'street', 'highway', 'pavement', 'asphalt', 'pothole', 'construction',
                'road work', 'street repair', 'pavement repair', 'road construction', 
                'highway maintenance', 'road maintenance', 'street construction',
                'road damage', 'street damage', 'pavement damage', 'road hazard'
            ],
            'Public Works': [
                'infrastructure', 'sidewalk', 'bridge', 'tunnel', 'public facility',
                'city infrastructure', 'municipal', 'public building', 'facility maintenance'
            ],
            'Environmental Services': [
                'garbage', 'waste', 'recycling', 'trash', 'cleanup', 'pollution',
                'environmental', 'litter', 'waste management', 'garbage collection',
                'recycling center', 'waste disposal', 'environmental cleanup'
            ],
            'Transportation': [
                'traffic', 'signal', 'light', 'parking', 'bus', 'transit', 'traffic light',
                'stop sign', 'traffic signal', 'parking meter', 'bus stop', 'transit stop',
                'traffic management', 'parking enforcement'
            ],
            'Parks & Recreation': [
                'park', 'playground', 'recreation', 'sports', 'garden', 'playground equipment',
                'park maintenance', 'recreation facility', 'sports field', 'community garden'
            ],
            'Public Safety': [
                'safety', 'emergency', 'fire', 'police', 'security', 'emergency response',
                'safety hazard', 'emergency service', 'public safety', 'safety concern'
            ],
            'Utilities': [
                'electricity', 'power', 'gas', 'internet', 'cable', 'utility', 'power line',
                'electrical', 'gas line', 'utility pole', 'power outage', 'gas leak',
                'electrical issue', 'utility service'
            ],
            'Water Department': [
                'water', 'water supply', 'water line', 'water leak', 'water main',
                'water service', 'water pressure', 'water quality', 'water treatment',
                'drinking water', 'water pipe', 'water connection'
            ]
        };
        
        const allText = `${title} ${description} ${location}`;
        
        // Score each department based on keyword matches
        const departmentScores = {};
        
        for (const [department, keywords] of Object.entries(departmentKeywords)) {
            let score = 0;
            keywords.forEach(keyword => {
                if (allText.includes(keyword)) {
                    // Give more weight to title matches
                    if (title.includes(keyword)) {
                        score += 3;
                    } else if (description.includes(keyword)) {
                        score += 2;
                    } else {
                        score += 1;
                    }
                }
            });
            departmentScores[department] = score;
        }
        
        // Find the department with the highest score
        const bestMatch = Object.entries(departmentScores)
            .filter(([_, score]) => score > 0)
            .sort((a, b) => b[1] - a[1])[0];
        
        return bestMatch ? bestMatch[0] : 'General Services';
    },

    updateIssue(issueId, updates) {
        const index = this.issues.findIndex(issue => issue.id === issueId);
        if (index !== -1) {
            const oldIssue = this.issues[index];
            this.issues[index] = { ...this.issues[index], ...updates };
            
            // Add to status history if status changed
            if (updates.status && updates.status !== oldIssue.status) {
                this.issues[index].statusHistory.push({
                    status: updates.status,
                    changedBy: updates.changedBy || 'system',
                    changedAt: new Date().toISOString(),
                    notes: updates.notes || `Status changed to ${updates.status}`
                });
            }
            
            // Create notification for user if status changed
            if (updates.status && updates.status !== oldIssue.status) {
                this.createNotification({
                    type: 'status_update',
                    title: 'Issue Status Updated',
                    message: `Your issue "${oldIssue.title}" status has been updated to ${updates.status}`,
                    recipient: oldIssue.submittedBy,
                    issueId: issueId,
                    priority: oldIssue.urgency
                });
            }
            
            // Create notification for user if officer assigned
            if (updates.assignedTo && !oldIssue.assignedTo) {
                const officer = this.getOfficerByEmail(updates.assignedTo);
                this.createNotification({
                    type: 'officer_assigned',
                    title: 'Officer Assigned',
                    message: `Officer ${officer ? officer.name : 'Unknown'} has been assigned to your issue "${oldIssue.title}"`,
                    recipient: oldIssue.submittedBy,
                    issueId: issueId,
                    priority: oldIssue.urgency
                });
            }
            
            this.saveToStorage();
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
    },

    // Notification management
    createNotification(notificationData) {
        const notification = {
            id: this.generateNotificationId(),
            ...notificationData,
            createdAt: new Date().toISOString(),
            isRead: false
        };
        this.notifications.push(notification);
        this.saveToStorage();
        return notification;
    },

    getNotificationsForUser(userEmail) {
        return this.notifications.filter(notif => 
            notif.recipient === userEmail || notif.recipient === 'admin'
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            this.saveToStorage();
        }
    },

    getUnreadNotificationCount(userEmail) {
        return this.notifications.filter(notif => 
            (notif.recipient === userEmail || notif.recipient === 'admin') && !notif.isRead
        ).length;
    },

    generateNotificationId() {
        return this.notifications.length > 0 ? Math.max(...this.notifications.map(n => n.id)) + 1 : 1;
    },

    // Escalation level management
    getEscalationLevel(issue) {
        const daysSinceCreated = Math.floor((Date.now() - new Date(issue.submittedDate)) / (1000 * 60 * 60 * 24));
        
        if (daysSinceCreated >= 30) return 'Court';
        if (daysSinceCreated >= 14) return 'State';
        if (daysSinceCreated >= 7) return 'District';
        return 'Block';
    },

    updateEscalationLevels() {
        this.issues.forEach(issue => {
            const newLevel = this.getEscalationLevel(issue);
            if (newLevel !== issue.escalationLevel) {
                issue.escalationLevel = newLevel;
                
                // Create notification for escalation
                this.createNotification({
                    type: 'escalation',
                    title: 'Issue Escalated',
                    message: `Your issue "${issue.title}" has been escalated to ${newLevel} level`,
                    recipient: issue.submittedBy,
                    issueId: issue.id,
                    priority: issue.urgency
                });
            }
        });
        this.saveToStorage();
    },

    // Officer availability and assignment methods
    getAvailableOfficersForDepartment(department) {
        return this.officers.filter(officer => 
            officer.department === department && 
            officer.availability === 'available' && 
            officer.currentIssues < officer.maxIssues
        ).sort((a, b) => b.rating - a.rating); // Sort by rating
    },

    // Get all available officers (for cross-department assignment)
    getAllAvailableOfficers() {
        return this.officers.filter(officer => 
            officer.availability === 'available' && 
            officer.currentIssues < officer.maxIssues
        ).sort((a, b) => b.rating - a.rating);
    },

    // Check if officer department matches issue department
    isDepartmentMatch(issueDepartment, officerDepartment) {
        return issueDepartment === officerDepartment;
    },

    // Get department compatibility score
    getDepartmentCompatibilityScore(issueDepartment, officerDepartment) {
        if (issueDepartment === officerDepartment) {
            return 100; // Perfect match
        }
        
        // Define related departments
        const relatedDepartments = {
            'Waste Water Department': ['Public Works', 'Environmental Services'],
            'Road Construction Department': ['Public Works', 'Transportation'],
            'Public Works': ['Waste Water Department', 'Road Construction Department', 'Utilities'],
            'Environmental Services': ['Waste Water Department', 'Public Works'],
            'Transportation': ['Road Construction Department', 'Public Works'],
            'Utilities': ['Public Works', 'Water Department'],
            'Water Department': ['Utilities', 'Waste Water Department'],
            'Parks & Recreation': ['Public Works'],
            'Public Safety': ['General Services']
        };
        
        const related = relatedDepartments[issueDepartment] || [];
        if (related.includes(officerDepartment)) {
            return 75; // Related department
        }
        
        return 25; // Different department
    },

    getOfficerAvailabilityStatus(officerEmail) {
        const officer = this.getOfficerByEmail(officerEmail);
        if (!officer) return null;
        
        const assignedIssues = this.issues.filter(issue => 
            issue.assignedTo === officerEmail && 
            (issue.status === 'in-progress' || issue.status === 'in-review')
        ).length;
        
        return {
            ...officer,
            currentIssues: assignedIssues,
            isAvailable: officer.availability === 'available' && assignedIssues < officer.maxIssues,
            workloadPercentage: Math.round((assignedIssues / officer.maxIssues) * 100)
        };
    },

    assignOfficerToIssue(issueId, officerEmail) {
        const issue = this.getIssue(issueId);
        const officer = this.getOfficerByEmail(officerEmail);
        
        if (!issue || !officer) return false;
        
        // Check if officer is available
        const availability = this.getOfficerAvailabilityStatus(officerEmail);
        if (!availability.isAvailable) {
            return false;
        }
        
        // Update issue
        const updated = this.updateIssue(issueId, {
            assignedTo: officerEmail,
            status: 'in-progress',
            assignedDate: new Date().toISOString(),
            changedBy: 'admin'
        });
        
        if (updated) {
            // Create detailed notification for user
            this.createNotification({
                type: 'officer_assigned',
                title: 'Officer Assigned to Your Issue',
                message: `Officer ${officer.name} (${officer.specialization}) has been assigned to your issue "${issue.title}". They have ${officer.experience} experience and a ${officer.rating}/5 rating.`,
                recipient: issue.submittedBy,
                issueId: issueId,
                priority: issue.urgency,
                officerInfo: {
                    name: officer.name,
                    specialization: officer.specialization,
                    experience: officer.experience,
                    rating: officer.rating,
                    phone: officer.phone
                }
            });
            
            // Update officer workload
            this.updateOfficerWorkload(officerEmail);
        }
        
        return updated;
    },

    updateOfficerWorkload(officerEmail) {
        const officer = this.getOfficerByEmail(officerEmail);
        if (!officer) return;
        
        const assignedIssues = this.issues.filter(issue => 
            issue.assignedTo === officerEmail && 
            (issue.status === 'in-progress' || issue.status === 'in-review')
        ).length;
        
        officer.currentIssues = assignedIssues;
        
        // Update availability based on workload
        if (assignedIssues >= officer.maxIssues) {
            officer.availability = 'busy';
        } else if (assignedIssues < officer.maxIssues * 0.8) {
            officer.availability = 'available';
        }
        
        this.saveToStorage();
    },

    // Performance optimization methods
    getIssuesByDepartment(department) {
        return this.issues.filter(issue => issue.department === department);
    },

    getIssueStatsByDepartment() {
        const departments = [...new Set(this.issues.map(issue => issue.department))];
        const stats = {};
        
        departments.forEach(dept => {
            const deptIssues = this.getIssuesByDepartment(dept);
            stats[dept] = {
                total: deptIssues.length,
                pending: deptIssues.filter(i => i.status === 'pending').length,
                inProgress: deptIssues.filter(i => i.status === 'in-progress').length,
                resolved: deptIssues.filter(i => i.status === 'resolved').length,
                officers: this.getAvailableOfficersForDepartment(dept).length
            };
        });
        
        return stats;
    },

    // Storage cleanup and maintenance
    cleanupStorage() {
        try {
            console.log('Starting storage cleanup...');
            
            // Clean up old notifications (keep last 50)
            if (this.notifications.length > 50) {
                this.notifications = this.notifications.slice(-50);
                console.log('Cleaned up old notifications');
            }
            
            // Clean up old issues (keep last 100)
            if (this.issues.length > 100) {
                this.issues = this.issues.slice(-100);
                console.log('Cleaned up old issues');
            }
            
            // Clean up resolved issues older than 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const oldResolvedIssues = this.issues.filter(issue => 
                issue.status === 'resolved' && 
                new Date(issue.submittedDate) < thirtyDaysAgo
            );
            
            if (oldResolvedIssues.length > 0) {
                this.issues = this.issues.filter(issue => 
                    !(issue.status === 'resolved' && new Date(issue.submittedDate) < thirtyDaysAgo)
                );
                console.log(`Cleaned up ${oldResolvedIssues.length} old resolved issues`);
            }
            
            // Save cleaned data
            this.saveToStorage();
            console.log('Storage cleanup completed');
            
        } catch (error) {
            console.error('Error during storage cleanup:', error);
        }
    },

    // Get storage usage information
    getStorageInfo() {
        try {
            let totalSize = 0;
            const storageInfo = {};
            
            const keys = ['civicIssues', 'civicAccessRequests', 'civicUsers', 'civicOfficers', 'civicAdmins', 'civicNotifications'];
            
            keys.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    const size = new Blob([data]).size;
                    storageInfo[key] = {
                        size: size,
                        sizeFormatted: this.formatBytes(size),
                        items: JSON.parse(data).length
                    };
                    totalSize += size;
                }
            });
            
            return {
                totalSize: totalSize,
                totalSizeFormatted: this.formatBytes(totalSize),
                items: storageInfo,
                quota: this.getStorageQuota()
            };
            
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    },

    // Format bytes to human readable format
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Get storage quota information
    getStorageQuota() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                return navigator.storage.estimate();
            }
            return null;
        } catch (error) {
            console.error('Error getting storage quota:', error);
            return null;
        }
    }
};

// Make DataManager globally available
window.DataManager = DataManager;

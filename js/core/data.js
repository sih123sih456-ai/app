// Data Management
const DataManager = {
    issues: [],
    accessRequests: [],
    users: [],
    officers: [],
    notifications: [],

    // Initialize with sample data
    init() {
        this.loadFromStorage();
        if (this.issues.length === 0) {
            this.loadSampleData();
        }
        console.log('DataManager initialized');
    },

    // Load data from localStorage
    loadFromStorage() {
        try {
            const storedIssues = localStorage.getItem('civicIssues');
            if (storedIssues) {
                this.issues = JSON.parse(storedIssues);
            }

            const storedRequests = localStorage.getItem('civicAccessRequests');
            if (storedRequests) {
                this.accessRequests = JSON.parse(storedRequests);
            }

            const storedUsers = localStorage.getItem('civicUsers');
            if (storedUsers) {
                this.users = JSON.parse(storedUsers);
            }

            const storedOfficers = localStorage.getItem('civicOfficers');
            if (storedOfficers) {
                this.officers = JSON.parse(storedOfficers);
            }

            const storedNotifications = localStorage.getItem('civicNotifications');
            if (storedNotifications) {
                this.notifications = JSON.parse(storedNotifications);
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    },

    // Save data to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('civicIssues', JSON.stringify(this.issues));
            localStorage.setItem('civicAccessRequests', JSON.stringify(this.accessRequests));
            localStorage.setItem('civicUsers', JSON.stringify(this.users));
            localStorage.setItem('civicOfficers', JSON.stringify(this.officers));
            localStorage.setItem('civicNotifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    },

    // Load sample data
    loadSampleData() {
        // Start with empty arrays - no static data
        this.issues = [];
        this.accessRequests = [];
        this.notifications = [];
        
        // Only add sample users and officers for testing
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
        this.issues.push(issue);
        
        // Create notification for admin
        this.createNotification({
            type: 'new_issue',
            title: 'New Issue Reported',
            message: `New issue "${issue.title}" has been reported by ${issueData.submittedBy}`,
            recipient: 'admin',
            issueId: issue.id,
            priority: issue.urgency
        });
        
        // Save to storage
        this.saveToStorage();
        return issue;
    },

    // Determine department based on issue content
    determineDepartment(issueData) {
        const title = (issueData.title || '').toLowerCase();
        const description = (issueData.description || '').toLowerCase();
        const location = (issueData.location || '').toLowerCase();
        
        // Keywords for different departments
        const departmentKeywords = {
            'Public Works': ['pothole', 'road', 'street', 'sidewalk', 'drainage', 'sewer', 'water', 'infrastructure'],
            'Environmental Services': ['garbage', 'waste', 'recycling', 'trash', 'cleanup', 'pollution'],
            'Transportation': ['traffic', 'signal', 'light', 'parking', 'bus', 'transit'],
            'Parks & Recreation': ['park', 'playground', 'recreation', 'sports', 'garden'],
            'Public Safety': ['safety', 'emergency', 'fire', 'police', 'security'],
            'Utilities': ['electricity', 'power', 'gas', 'internet', 'cable']
        };
        
        const allText = `${title} ${description} ${location}`;
        
        for (const [department, keywords] of Object.entries(departmentKeywords)) {
            if (keywords.some(keyword => allText.includes(keyword))) {
                return department;
            }
        }
        
        return 'General Services'; // Default department
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
    }
};

// Make DataManager globally available
window.DataManager = DataManager;

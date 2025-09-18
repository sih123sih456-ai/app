// Admin Dashboard Module
const AdminDashboard = {
    // Initialize admin dashboard
    init() {
        this.setupEventListeners();
        console.log('AdminDashboard initialized');
    },

    // Set up event listeners
    setupEventListeners() {
        // Status filter
        document.getElementById('adminStatusFilter').addEventListener('change', () => this.loadAdminIssues());
        
        // Urgency filter
        document.getElementById('adminUrgencyFilter').addEventListener('change', () => this.loadAdminIssues());
    },

    // Show admin dashboard
    show() {
        this.updateStats();
        this.loadAdminIssues();
        this.loadAccessRequests();
        this.loadAdminDetails();
    },

    // Update admin statistics
    updateStats() {
        const stats = DataManager.getIssueStats();
        const requestStats = DataManager.getPendingAccessRequests().length;
        
        document.getElementById('adminPendingCount').textContent = stats.pending;
        document.getElementById('adminReviewCount').textContent = stats.inReview;
        document.getElementById('adminResolvedCount').textContent = stats.resolved;
        document.getElementById('adminRequestCount').textContent = requestStats;
    },

    // Load admin issues
    loadAdminIssues() {
        const statusFilter = document.getElementById('adminStatusFilter').value;
        const urgencyFilter = document.getElementById('adminUrgencyFilter').value;
        
        const filters = {};
        if (statusFilter) filters.status = statusFilter;
        if (urgencyFilter) filters.urgency = urgencyFilter;
        
        const issues = DataManager.searchIssues('', filters);
        this.displayIssues(issues);
    },

    // Display issues
    displayIssues(issues) {
        const container = document.getElementById('adminIssuesList');
        container.innerHTML = '';
        
        if (issues.length === 0) {
            container.innerHTML = '<div class="no-issues">No issues found matching the current filters.</div>';
            return;
        }
        
        issues.forEach(issue => {
            const issueCard = this.createIssueCard(issue);
            container.appendChild(issueCard);
        });
    },

    // Create issue card
    createIssueCard(issue) {
        const card = document.createElement('div');
        card.className = `issue-card ${issue.urgency}`;
        
        card.innerHTML = `
            <div class="issue-header">
                <div>
                    <div class="issue-title">${Utils.sanitizeHtml(issue.title)}</div>
                    <div class="issue-meta">
                        <span class="status-badge status-${issue.status}">${Utils.formatStatus(issue.status)}</span>
                        <span class="urgency-badge urgency-${issue.urgency}">${Utils.formatUrgency(issue.urgency)}</span>
                        <span>${Utils.formatDate(issue.submittedDate)}</span>
                    </div>
                </div>
                <div class="issue-actions">
                    ${issue.status === 'pending' ? 
                        `<button class="btn-primary" onclick="AdminDashboard.assignIssue(${issue.id})">Assign</button>` : 
                        ''
                    }
                    <button class="btn-secondary" onclick="AdminDashboard.viewIssueDetails(${issue.id})">View</button>
                </div>
            </div>
            <div class="issue-description">${Utils.sanitizeHtml(issue.description)}</div>
            <div class="issue-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${Utils.sanitizeHtml(issue.location)}</span>
                <span><i class="fas fa-layer-group"></i> ${issue.escalationLevel}</span>
                <span><i class="fas fa-user"></i> ${issue.submittedBy}</span>
                ${issue.assignedTo ? `<span><i class="fas fa-user-shield"></i> ${issue.assignedTo}</span>` : ''}
            </div>
        `;
        
        return card;
    },

    // Assign issue with officer availability
    assignIssue(issueId) {
        const issue = DataManager.getIssue(issueId);
        if (!issue) {
            Notifications.error('Issue not found');
            return;
        }
        
        // Get available officers for the issue's department
        const availableOfficers = DataManager.getAvailableOfficersForDepartment(issue.department);
        
        if (availableOfficers.length === 0) {
            Notifications.error(`No officers available in ${issue.department} department`);
            return;
        }
        
        // Show officer selection modal
        this.showOfficerSelectionModal(issue, availableOfficers);
    },

    // Show officer selection modal
    showOfficerSelectionModal(issue, availableOfficers) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('officerSelectionModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'officerSelectionModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Assign Officer to Issue</h3>
                        <span class="close" onclick="this.closest('.modal').style.display='none'">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="issue-info">
                            <h4>${issue.title}</h4>
                            <p><strong>Department:</strong> ${issue.department}</p>
                            <p><strong>Urgency:</strong> ${Utils.formatUrgency(issue.urgency)}</p>
                        </div>
                        <div class="officers-list" id="officersList"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Populate officers list
        const officersList = document.getElementById('officersList');
        officersList.innerHTML = '';
        
        availableOfficers.forEach(officer => {
            const officerCard = document.createElement('div');
            officerCard.className = 'officer-card';
            officerCard.innerHTML = `
                <div class="officer-info">
                    <div class="officer-name">${officer.name}</div>
                    <div class="officer-specialization">${officer.specialization}</div>
                    <div class="officer-details">
                        <span class="rating">⭐ ${officer.rating}/5</span>
                        <span class="experience">${officer.experience}</span>
                        <span class="workload">${officer.currentIssues}/${officer.maxIssues} issues</span>
                    </div>
                    <div class="workload-bar">
                        <div class="workload-fill" style="width: ${(officer.currentIssues / officer.maxIssues) * 100}%"></div>
                    </div>
                </div>
                <div class="officer-actions">
                    <button class="btn-primary" onclick="AdminDashboard.assignToOfficer(${issue.id}, '${officer.email}')">
                        Assign
                    </button>
                </div>
            `;
            officersList.appendChild(officerCard);
        });
        
        // Show modal
        modal.style.display = 'block';
    },

    // Assign issue to specific officer
    assignToOfficer(issueId, officerEmail) {
        const success = DataManager.assignOfficerToIssue(issueId, officerEmail);
        
        if (success) {
            const officer = DataManager.getOfficerByEmail(officerEmail);
            Notifications.success(`Issue assigned to ${officer.name}`);
            
            // Close modal
            document.getElementById('officerSelectionModal').style.display = 'none';
            
            // Refresh display
            this.loadAdminIssues();
            this.updateStats();
            
            // Update map if visible
            if (document.getElementById('adminMapContainer').style.display !== 'none') {
                MapManager.updateMapMarkers('admin');
            }
        } else {
            Notifications.error('Failed to assign officer. They may no longer be available.');
        }
    },

    // View issue details
    viewIssueDetails(issueId) {
        const issue = DataManager.getIssue(issueId);
        if (!issue) {
            Notifications.error('Issue not found');
            return;
        }
        
        // Switch to map view and highlight the issue
        this.showIssueOnMap(issue);
        
        // Also show modal with details
        const modalContent = document.getElementById('issueModalContent');
        modalContent.innerHTML = `
            <div class="issue-detail-header">
                <h2>${Utils.sanitizeHtml(issue.title)}</h2>
                <div class="issue-meta">
                    <span class="status-badge status-${issue.status}">${Utils.formatStatus(issue.status)}</span>
                    <span class="urgency-badge urgency-${issue.urgency}">${Utils.formatUrgency(issue.urgency)}</span>
                    <span>Submitted: ${Utils.formatDate(issue.submittedDate)}</span>
                </div>
            </div>
            
            <div class="issue-details-grid">
                <div class="issue-detail-section">
                    <h3><i class="fas fa-info-circle"></i> Details</h3>
                    <p><strong>Description:</strong> ${Utils.sanitizeHtml(issue.description)}</p>
                    <p><strong>Location:</strong> ${Utils.sanitizeHtml(issue.location)}</p>
                    <p><strong>Escalation Level:</strong> ${issue.escalationLevel}</p>
                </div>
                
                <div class="issue-detail-section">
                    <h3><i class="fas fa-user"></i> User Information</h3>
                    <p><strong>Submitted By:</strong> ${issue.submittedBy}</p>
                    ${issue.assignedTo ? `<p><strong>Assigned To:</strong> ${issue.assignedTo}</p>` : ''}
                </div>
                
                ${issue.photos.length > 0 ? `
                    <div class="issue-detail-section">
                        <h3><i class="fas fa-images"></i> Photos</h3>
                        <div class="photo-preview">
                            ${issue.photos.map(photo => `<img src="${photo}" alt="Issue Photo" class="issue-photo">`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-actions">
                <button class="btn-primary" onclick="AdminDashboard.showIssueOnMap(${issue.id})">
                    <i class="fas fa-map-marker-alt"></i> Show on Map
                </button>
                ${issue.status === 'pending' ? 
                    `<button class="btn-success" onclick="AdminDashboard.assignIssue(${issue.id}); App.closeModal();">
                        <i class="fas fa-user-plus"></i> Assign Issue
                    </button>` : 
                    ''
                }
                <button class="btn-secondary" onclick="App.closeModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;
        
        document.getElementById('issueModal').style.display = 'block';
    },

    // Show issue on map
    showIssueOnMap(issue) {
        // Switch to map section
        App.switchDashboardSection('admin-map');
        
        // Initialize map if not already done
        setTimeout(() => {
            MapManager.initializeAdminMap();
            
            // Center map on the specific issue
            if (issue.coordinates && MapManager.maps.adminMap) {
                MapManager.maps.adminMap.setView(issue.coordinates, 15);
                
                // Add a special marker for the selected issue
                const color = Utils.getUrgencyColor(issue.urgency);
                const marker = L.circleMarker(issue.coordinates, {
                    color: color,
                    fillColor: color,
                    fillOpacity: 1,
                    radius: 12,
                    weight: 3
                }).addTo(MapManager.maps.adminMap);
                
                marker.bindPopup(`
                    <div class="map-popup-selected">
                        <h4>${Utils.sanitizeHtml(issue.title)}</h4>
                        <p><strong>Status:</strong> <span class="status-${issue.status}">${Utils.formatStatus(issue.status)}</span></p>
                        <p><strong>Urgency:</strong> <span class="urgency-${issue.urgency}">${Utils.formatUrgency(issue.urgency)}</span></p>
                        <p><strong>Location:</strong> ${Utils.sanitizeHtml(issue.location)}</p>
                    </div>
                `).openPopup();
            }
        }, 100);
    },

    // Load access requests
    loadAccessRequests() {
        const requests = DataManager.getAllAccessRequests();
        const container = document.getElementById('accessRequestsList');
        container.innerHTML = '';
        
        if (requests.length === 0) {
            container.innerHTML = '<div class="no-requests">No access requests found.</div>';
            return;
        }
        
        requests.forEach(request => {
            const requestCard = this.createRequestCard(request);
            container.appendChild(requestCard);
        });
    },

    // Create request card
    createRequestCard(request) {
        const card = document.createElement('div');
        card.className = 'request-card';
        
        card.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <div class="request-avatar">
                        ${request.profileImage ? 
                            `<img src="${URL.createObjectURL(request.profileImage)}" alt="Profile">` : 
                            '<i class="fas fa-user"></i>'
                        }
                    </div>
                    <div class="request-details">
                        <h3>${Utils.sanitizeHtml(request.name)}</h3>
                        <p>${Utils.sanitizeHtml(request.department)} • ${Utils.sanitizeHtml(request.location)}</p>
                        <p>Experience: ${Utils.sanitizeHtml(request.experience)}</p>
                    </div>
                </div>
                <div class="request-actions">
                    ${request.status === 'pending' ? `
                        <button class="btn-success" onclick="AdminDashboard.approveRequest(${request.id})">Approve</button>
                        <button class="btn-danger" onclick="AdminDashboard.rejectRequest(${request.id})">Reject</button>
                    ` : `
                        <span class="status-badge status-${request.status}">${Utils.formatStatus(request.status)}</span>
                    `}
                </div>
            </div>
            <div class="request-details">
                <p><strong>Email:</strong> ${Utils.sanitizeHtml(request.email)}</p>
                <p><strong>Phone:</strong> ${Utils.sanitizeHtml(request.phone)}</p>
                <p><strong>Reason:</strong> ${Utils.sanitizeHtml(request.reason)}</p>
                <p><strong>Submitted:</strong> ${Utils.formatDate(request.submittedDate)}</p>
            </div>
        `;
        
        return card;
    },

    // Approve request
    approveRequest(requestId) {
        const request = DataManager.getAccessRequest(requestId);
        if (!request) {
            Notifications.error('Request not found');
            return;
        }
        
        // Update request status
        DataManager.updateAccessRequest(requestId, { status: 'approved' });
        
        // Create officer account
        DataManager.createOfficer({
            name: request.name,
            email: request.email,
            department: request.department,
            phone: request.phone,
            location: request.location,
            experience: request.experience
        });
        
        Notifications.success('Access request approved! Officer account created.');
        
        // Refresh display
        this.loadAccessRequests();
        this.updateStats();
    },

    // Reject request
    rejectRequest(requestId) {
        const request = DataManager.getAccessRequest(requestId);
        if (!request) {
            Notifications.error('Request not found');
            return;
        }
        
        // Update request status
        DataManager.updateAccessRequest(requestId, { status: 'rejected' });
        
        Notifications.warning('Access request rejected');
        
        // Refresh display
        this.loadAccessRequests();
        this.updateStats();
    },

    // Load admin details
    loadAdminDetails() {
        const admins = DataManager.getAllAdmins();
        const container = document.getElementById('adminDetailsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (admins.length === 0) {
            container.innerHTML = '<div class="no-admins">No admin details found.</div>';
            return;
        }
        
        admins.forEach(admin => {
            const adminCard = this.createAdminDetailCard(admin);
            container.appendChild(adminCard);
        });
    },

    // Create admin detail card
    createAdminDetailCard(admin) {
        const card = document.createElement('div');
        card.className = 'admin-detail-card';
        
        const initials = admin.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        card.innerHTML = `
            <div class="admin-detail-header">
                <div class="admin-detail-avatar">
                    ${admin.profileImage ? 
                        `<img src="${URL.createObjectURL(admin.profileImage)}" alt="Admin Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : 
                        initials
                    }
                </div>
                <div class="admin-detail-info">
                    <h3>${Utils.sanitizeHtml(admin.name)}</h3>
                    <p><i class="fas fa-shield-alt"></i> System Administrator</p>
                    <p><i class="fas fa-circle" style="color: #28a745; font-size: 8px;"></i> Active</p>
                </div>
            </div>
            
            <div class="admin-detail-content">
                <div class="admin-detail-item">
                    <i class="fas fa-envelope"></i>
                    <strong>Email:</strong>
                    <span>${Utils.sanitizeHtml(admin.email)}</span>
                </div>
                
                <div class="admin-detail-item">
                    <i class="fas fa-phone"></i>
                    <strong>Phone:</strong>
                    <span>${Utils.sanitizeHtml(admin.phone)}</span>
                </div>
                
                <div class="admin-detail-item">
                    <i class="fas fa-building"></i>
                    <strong>Department:</strong>
                    <span>${Utils.sanitizeHtml(admin.department)}</span>
                </div>
                
                <div class="admin-detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <strong>Location:</strong>
                    <span>${Utils.sanitizeHtml(admin.location)}</span>
                </div>
                
                <div class="admin-detail-item">
                    <i class="fas fa-briefcase"></i>
                    <strong>Experience:</strong>
                    <span>${Utils.sanitizeHtml(admin.experience)}</span>
                </div>
                
                <div class="admin-detail-item">
                    <i class="fas fa-calendar"></i>
                    <strong>Status:</strong>
                    <span style="color: #28a745; font-weight: 600;">Active</span>
                </div>
            </div>
        `;
        
        return card;
    }
};

// Make AdminDashboard globally available
window.AdminDashboard = AdminDashboard;

// Admin Requests Module
const AdminRequests = {
    // Initialize admin requests module
    init() {
        console.log('AdminRequests initialized');
    },

    // Show access requests section
    show() {
        this.loadAccessRequests();
    },

    // Load access requests
    loadAccessRequests() {
        const requests = DataManager.getAllAccessRequests();
        const container = document.getElementById('accessRequestsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (requests.length === 0) {
            container.innerHTML = '<div class="no-requests">No access requests found.</div>';
            return;
        }
        
        // Group requests by status
        const pendingRequests = requests.filter(req => req.status === 'pending');
        const processedRequests = requests.filter(req => req.status !== 'pending');
        
        // Display pending requests first
        if (pendingRequests.length > 0) {
            const pendingSection = document.createElement('div');
            pendingSection.innerHTML = '<h3>Pending Requests</h3>';
            container.appendChild(pendingSection);
            
            pendingRequests.forEach(request => {
                const requestCard = this.createRequestCard(request);
                container.appendChild(requestCard);
            });
        }
        
        // Display processed requests
        if (processedRequests.length > 0) {
            const processedSection = document.createElement('div');
            processedSection.innerHTML = '<h3>Processed Requests</h3>';
            container.appendChild(processedSection);
            
            processedRequests.forEach(request => {
                const requestCard = this.createRequestCard(request);
                container.appendChild(requestCard);
            });
        }
    },

    // Create request card
    createRequestCard(request) {
        const card = document.createElement('div');
        card.className = `request-card ${request.status}`;
        
        const statusIcon = this.getStatusIcon(request.status);
        const statusColor = this.getStatusColor(request.status);
        
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
                        <p><i class="fas fa-building"></i> ${Utils.sanitizeHtml(request.department)}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${Utils.sanitizeHtml(request.location)}</p>
                        <p><i class="fas fa-briefcase"></i> ${Utils.sanitizeHtml(request.experience)} experience</p>
                    </div>
                </div>
                <div class="request-status">
                    <span class="status-badge" style="background-color: ${statusColor}">
                        <i class="fas ${statusIcon}"></i> ${Utils.formatStatus(request.status)}
                    </span>
                </div>
            </div>
            
            <div class="request-content">
                <div class="request-details">
                    <p><strong>Email:</strong> ${Utils.sanitizeHtml(request.email)}</p>
                    <p><strong>Phone:</strong> ${Utils.sanitizeHtml(request.phone)}</p>
                    <p><strong>Submitted:</strong> ${Utils.formatDateTime(request.submittedDate)}</p>
                </div>
                
                <div class="request-reason">
                    <h4>Reason for Access Request:</h4>
                    <p>${Utils.sanitizeHtml(request.reason)}</p>
                </div>
                
                ${request.status === 'pending' ? `
                    <div class="request-actions">
                        <button class="btn-success" onclick="AdminRequests.approveRequest(${request.id})">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn-danger" onclick="AdminRequests.rejectRequest(${request.id})">
                            <i class="fas fa-times"></i> Reject
                        </button>
                        <button class="btn-secondary" onclick="AdminRequests.viewRequestDetails(${request.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                ` : `
                    <div class="request-actions">
                        <button class="btn-secondary" onclick="AdminRequests.viewRequestDetails(${request.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        ${request.status === 'approved' ? `
                            <button class="btn-info" onclick="AdminRequests.createOfficerAccount(${request.id})">
                                <i class="fas fa-user-plus"></i> Create Officer Account
                            </button>
                        ` : ''}
                    </div>
                `}
            </div>
        `;
        
        return card;
    },

    // Get status icon
    getStatusIcon(status) {
        switch (status) {
            case 'pending': return 'fa-clock';
            case 'approved': return 'fa-check-circle';
            case 'rejected': return 'fa-times-circle';
            default: return 'fa-question-circle';
        }
    },

    // Get status color
    getStatusColor(status) {
        switch (status) {
            case 'pending': return '#ffc107';
            case 'approved': return '#28a745';
            case 'rejected': return '#dc3545';
            default: return '#6c757d';
        }
    },

    // Approve request
    approveRequest(requestId) {
        const request = DataManager.getAccessRequest(requestId);
        if (!request) {
            Notifications.error('Request not found');
            return;
        }
        
        // Update request status
        DataManager.updateAccessRequest(requestId, { 
            status: 'approved',
            approvedDate: new Date().toISOString()
        });
        
        Notifications.success(`Access request from ${request.name} has been approved!`);
        
        // Refresh display
        this.loadAccessRequests();
        
        // Update admin stats
        if (App.getModule('adminDashboard')) {
            App.getModule('adminDashboard').updateStats();
        }
    },

    // Reject request
    rejectRequest(requestId) {
        const request = DataManager.getAccessRequest(requestId);
        if (!request) {
            Notifications.error('Request not found');
            return;
        }
        
        // Update request status
        DataManager.updateAccessRequest(requestId, { 
            status: 'rejected',
            rejectedDate: new Date().toISOString()
        });
        
        Notifications.warning(`Access request from ${request.name} has been rejected.`);
        
        // Refresh display
        this.loadAccessRequests();
        
        // Update admin stats
        if (App.getModule('adminDashboard')) {
            App.getModule('adminDashboard').updateStats();
        }
    },

    // View request details
    viewRequestDetails(requestId) {
        const request = DataManager.getAccessRequest(requestId);
        if (!request) {
            Notifications.error('Request not found');
            return;
        }
        
        const modalContent = document.getElementById('issueModalContent');
        modalContent.innerHTML = `
            <h2>Access Request Details</h2>
            
            <div class="request-details-modal">
                <div class="request-header-modal">
                    <div class="request-avatar-large">
                        ${request.profileImage ? 
                            `<img src="${URL.createObjectURL(request.profileImage)}" alt="Profile">` : 
                            '<i class="fas fa-user"></i>'
                        }
                    </div>
                    <div class="request-info-modal">
                        <h3>${Utils.sanitizeHtml(request.name)}</h3>
                        <p><strong>Department:</strong> ${Utils.sanitizeHtml(request.department)}</p>
                        <p><strong>Location:</strong> ${Utils.sanitizeHtml(request.location)}</p>
                        <p><strong>Experience:</strong> ${Utils.sanitizeHtml(request.experience)}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${request.status}">${Utils.formatStatus(request.status)}</span></p>
                    </div>
                </div>
                
                <div class="request-details-content">
                    <h4>Contact Information</h4>
                    <p><strong>Email:</strong> ${Utils.sanitizeHtml(request.email)}</p>
                    <p><strong>Phone:</strong> ${Utils.sanitizeHtml(request.phone)}</p>
                    <p><strong>Submitted:</strong> ${Utils.formatDateTime(request.submittedDate)}</p>
                    
                    <h4>Reason for Access Request</h4>
                    <p>${Utils.sanitizeHtml(request.reason)}</p>
                </div>
                
                <div class="modal-actions">
                    ${request.status === 'pending' ? `
                        <button class="btn-success" onclick="AdminRequests.approveRequest(${request.id}); App.closeModal();">
                            <i class="fas fa-check"></i> Approve Request
                        </button>
                        <button class="btn-danger" onclick="AdminRequests.rejectRequest(${request.id}); App.closeModal();">
                            <i class="fas fa-times"></i> Reject Request
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="App.closeModal()">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('issueModal').style.display = 'block';
    },

    // Create officer account
    createOfficerAccount(requestId) {
        const request = DataManager.getAccessRequest(requestId);
        if (!request) {
            Notifications.error('Request not found');
            return;
        }
        
        if (request.status !== 'approved') {
            Notifications.error('Request must be approved before creating officer account');
            return;
        }
        
        // Check if officer already exists
        const existingOfficer = DataManager.getOfficerByEmail(request.email);
        if (existingOfficer) {
            Notifications.warning('Officer account already exists for this email');
            return;
        }
        
        // Create officer account
        const officer = DataManager.createOfficer({
            name: request.name,
            email: request.email,
            department: request.department,
            phone: request.phone,
            location: request.location,
            experience: request.experience
        });
        
        Notifications.success(`Officer account created for ${officer.name}`);
        
        // Refresh display
        this.loadAccessRequests();
    },

    // Get request statistics
    getRequestStats() {
        const requests = DataManager.getAllAccessRequests();
        const pending = requests.filter(req => req.status === 'pending').length;
        const approved = requests.filter(req => req.status === 'approved').length;
        const rejected = requests.filter(req => req.status === 'rejected').length;
        
        return { total: requests.length, pending, approved, rejected };
    }
};

// Make AdminRequests globally available
window.AdminRequests = AdminRequests;

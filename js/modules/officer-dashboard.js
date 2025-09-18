// Officer Dashboard Module
const OfficerDashboard = {
    // Initialize officer dashboard
    init() {
        this.setupEventListeners();
        console.log('OfficerDashboard initialized');
    },

    // Set up event listeners
    setupEventListeners() {
        // Status filter
        document.getElementById('officerStatusFilter')?.addEventListener('change', () => this.loadOfficerIssues());
    },

    // Show officer dashboard
    show() {
        const currentUser = App.getCurrentUser();
        document.getElementById('officerWelcome').textContent = `Welcome, ${currentUser.name || currentUser.email}`;
        
        this.updateStats();
        this.loadOfficerIssues();
    },

    // Update officer statistics
    updateStats() {
        const currentUser = App.getCurrentUser();
        const stats = DataManager.getOfficerIssueStats(currentUser.email);
        
        document.getElementById('officerAssignedCount').textContent = stats.assigned;
        document.getElementById('officerProgressCount').textContent = stats.inProgress;
        document.getElementById('officerResolvedCount').textContent = stats.resolved;
    },

    // Load officer issues
    loadOfficerIssues() {
        const currentUser = App.getCurrentUser();
        const assignedIssues = DataManager.getIssuesByOfficer(currentUser.email);
        
        // Apply status filter if exists
        const statusFilter = document.getElementById('officerStatusFilter')?.value;
        const filteredIssues = statusFilter ? 
            assignedIssues.filter(issue => issue.status === statusFilter) : 
            assignedIssues;
        
        this.displayIssues(filteredIssues);
    },

    // Display issues
    displayIssues(issues) {
        const container = document.getElementById('officerIssuesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (issues.length === 0) {
            container.innerHTML = '<div class="no-issues">No assigned issues found.</div>';
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
                    ${this.getActionButtons(issue)}
                </div>
            </div>
            <div class="issue-description">${Utils.sanitizeHtml(issue.description)}</div>
            <div class="issue-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${Utils.sanitizeHtml(issue.location)}</span>
                <span><i class="fas fa-layer-group"></i> ${issue.escalationLevel}</span>
                <span><i class="fas fa-user"></i> ${issue.submittedBy}</span>
            </div>
        `;
        
        return card;
    },

    // Get action buttons based on issue status
    getActionButtons(issue) {
        switch (issue.status) {
            case 'in-review':
                return `
                    <button class="btn-primary" onclick="OfficerDashboard.startIssue(${issue.id})">
                        <i class="fas fa-play"></i> Start Work
                    </button>
                    <button class="btn-secondary" onclick="OfficerDashboard.viewIssueDetails(${issue.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                `;
            case 'in-progress':
                return `
                    <button class="btn-success" onclick="OfficerDashboard.resolveIssue(${issue.id})">
                        <i class="fas fa-check"></i> Resolve
                    </button>
                    <button class="btn-secondary" onclick="OfficerDashboard.viewIssueDetails(${issue.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                `;
            case 'resolved':
                return `
                    <button class="btn-secondary" onclick="OfficerDashboard.viewIssueDetails(${issue.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                `;
            default:
                return `
                    <button class="btn-secondary" onclick="OfficerDashboard.viewIssueDetails(${issue.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                `;
        }
    },

    // Start working on issue
    startIssue(issueId) {
        const issue = DataManager.getIssue(issueId);
        if (!issue) {
            Notifications.error('Issue not found');
            return;
        }
        
        // Update issue status
        DataManager.updateIssue(issueId, { 
            status: 'in-progress',
            startedDate: new Date().toISOString()
        });
        
        Notifications.success('Issue status updated to In Progress');
        
        // Refresh display
        this.loadOfficerIssues();
        this.updateStats();
        
        // Update map if visible
        if (document.getElementById('officerMapContainer').style.display !== 'none') {
            MapManager.updateMapMarkers('officer');
        }
    },

    // Resolve issue
    resolveIssue(issueId) {
        const issue = DataManager.getIssue(issueId);
        if (!issue) {
            Notifications.error('Issue not found');
            return;
        }
        
        // Update issue status
        DataManager.updateIssue(issueId, { 
            status: 'resolved',
            resolvedDate: new Date().toISOString()
        });
        
        Notifications.success('Issue marked as resolved!');
        
        // Refresh display
        this.loadOfficerIssues();
        this.updateStats();
        
        // Update map if visible
        if (document.getElementById('officerMapContainer').style.display !== 'none') {
            MapManager.updateMapMarkers('officer');
        }
    },

    // View issue details
    viewIssueDetails(issueId) {
        const issue = DataManager.getIssue(issueId);
        if (!issue) {
            Notifications.error('Issue not found');
            return;
        }
        
        const modalContent = document.getElementById('issueModalContent');
        modalContent.innerHTML = `
            <h2>${Utils.sanitizeHtml(issue.title)}</h2>
            <div class="issue-meta">
                <span class="status-badge status-${issue.status}">${Utils.formatStatus(issue.status)}</span>
                <span class="urgency-badge urgency-${issue.urgency}">${Utils.formatUrgency(issue.urgency)}</span>
                <span>Submitted: ${Utils.formatDate(issue.submittedDate)}</span>
            </div>
            
            <div class="issue-details">
                <p><strong>Description:</strong> ${Utils.sanitizeHtml(issue.description)}</p>
                <p><strong>Location:</strong> ${Utils.sanitizeHtml(issue.location)}</p>
                <p><strong>Escalation Level:</strong> ${issue.escalationLevel}</p>
                <p><strong>Submitted By:</strong> ${issue.submittedBy}</p>
                <p><strong>Assigned To:</strong> ${issue.assignedTo}</p>
                
                ${issue.startedDate ? `<p><strong>Started:</strong> ${Utils.formatDateTime(issue.startedDate)}</p>` : ''}
                ${issue.resolvedDate ? `<p><strong>Resolved:</strong> ${Utils.formatDateTime(issue.resolvedDate)}</p>` : ''}
            </div>
            
            ${issue.photos.length > 0 ? `
                <div class="photo-preview">
                    <strong>Photos:</strong><br>
                    ${issue.photos.map(photo => `<img src="${photo}" alt="Issue Photo" style="width: 150px; height: 150px; object-fit: cover; margin: 5px; border-radius: 8px;">`).join('')}
                </div>
            ` : ''}
            
            <div class="modal-actions">
                ${issue.status === 'in-review' ? `
                    <button class="btn-primary" onclick="OfficerDashboard.startIssue(${issue.id}); App.closeModal();">
                        <i class="fas fa-play"></i> Start Work
                    </button>
                ` : ''}
                ${issue.status === 'in-progress' ? `
                    <button class="btn-success" onclick="OfficerDashboard.resolveIssue(${issue.id}); App.closeModal();">
                        <i class="fas fa-check"></i> Resolve Issue
                    </button>
                ` : ''}
                <button class="btn-secondary" onclick="App.closeModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;
        
        document.getElementById('issueModal').style.display = 'block';
    },

    // Get issue statistics for officer
    getIssueStatistics() {
        const currentUser = App.getCurrentUser();
        return DataManager.getOfficerIssueStats(currentUser.email);
    },

    // Get recent activity
    getRecentActivity() {
        const currentUser = App.getCurrentUser();
        const assignedIssues = DataManager.getIssuesByOfficer(currentUser.email);
        
        // Sort by date and return recent 5
        return assignedIssues
            .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
            .slice(0, 5);
    },

    // Update issue priority
    updateIssuePriority(issueId, priority) {
        const issue = DataManager.getIssue(issueId);
        if (!issue) {
            Notifications.error('Issue not found');
            return;
        }
        
        DataManager.updateIssue(issueId, { priority });
        Notifications.success('Issue priority updated');
        
        // Refresh display
        this.loadOfficerIssues();
    },

    // Add issue comment
    addIssueComment(issueId, comment) {
        const issue = DataManager.getIssue(issueId);
        if (!issue) {
            Notifications.error('Issue not found');
            return;
        }
        
        const comments = issue.comments || [];
        comments.push({
            id: Utils.generateId(),
            comment: comment,
            addedBy: App.getCurrentUser().email,
            addedDate: new Date().toISOString()
        });
        
        DataManager.updateIssue(issueId, { comments });
        Notifications.success('Comment added');
    }
};

// Make OfficerDashboard globally available
window.OfficerDashboard = OfficerDashboard;

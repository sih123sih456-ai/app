// User Dashboard Module
const UserDashboard = {
    // Initialize user dashboard
    init() {
        this.setupEventListeners();
        console.log('UserDashboard initialized');
    },

    // Set up event listeners
    setupEventListeners() {
        // This will be called when the dashboard is shown
        console.log('Event listeners will be set up when dashboard is shown');
    },

    // Set up event listeners when dashboard is shown
    setupEventListenersOnShow() {
        // Issue form submission
        const issueForm = document.getElementById('issueForm');
        if (issueForm && !issueForm.hasAttribute('data-listener-added')) {
            issueForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleIssueSubmission(e);
            });
            issueForm.setAttribute('data-listener-added', 'true');
            console.log('Issue form event listener added');
        }
        
        // Location selection
        const selectLocationBtn = document.getElementById('selectLocationBtn');
        if (selectLocationBtn && !selectLocationBtn.hasAttribute('data-listener-added')) {
            selectLocationBtn.addEventListener('click', () => {
                MapManager.showLocationMap();
                // Initialize map if not already done
                if (!MapManager.maps.userMap) {
                    setTimeout(() => {
                        MapManager.initializeUserMap();
                    }, 200);
                }
            });
            selectLocationBtn.setAttribute('data-listener-added', 'true');
        }
        
        // Photo upload
        const issuePhoto = document.getElementById('issuePhoto');
        if (issuePhoto && !issuePhoto.hasAttribute('data-listener-added')) {
            issuePhoto.addEventListener('change', (e) => this.handlePhotoPreview(e));
            issuePhoto.setAttribute('data-listener-added', 'true');
        }
        
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter && !statusFilter.hasAttribute('data-listener-added')) {
            statusFilter.addEventListener('change', () => this.loadUserIssues());
            statusFilter.setAttribute('data-listener-added', 'true');
        }
        
        // Chatbot
        const chatbotSend = document.getElementById('chatbotSend');
        if (chatbotSend && !chatbotSend.hasAttribute('data-listener-added')) {
            chatbotSend.addEventListener('click', () => this.sendChatbotMessage());
            chatbotSend.setAttribute('data-listener-added', 'true');
        }
        
        const chatbotInput = document.getElementById('chatbotInput');
        if (chatbotInput && !chatbotInput.hasAttribute('data-listener-added')) {
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendChatbotMessage();
            });
            chatbotInput.setAttribute('data-listener-added', 'true');
        }
    },

    // Show user dashboard
    show() {
        const currentUser = App.getCurrentUser();
        const welcomeElement = document.getElementById('userWelcome');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${currentUser.name || currentUser.email}`;
        }
        
        // Ensure hamburger menu is initialized
        if (App.modules.hamburgerMenu && App.modules.hamburgerMenu.init) {
            App.modules.hamburgerMenu.init();
        }
        
        // Set up event listeners when dashboard is shown
        this.setupEventListenersOnShow();
        
        // Debug: Check if form exists
        const issueForm = document.getElementById('issueForm');
        console.log('Issue form found:', !!issueForm);
        if (issueForm) {
            console.log('Issue form has listener:', issueForm.hasAttribute('data-listener-added'));
        }
        
        // Always show current location button since it's mandatory
        this.addCurrentLocationButton();
        this.showLocationRequiredMessage();
        
        this.updateStats();
        this.loadUserIssues();
        this.initializeChatbot();
        this.loadNotifications();
        this.updateEscalationLevels();
        this.updateStorageStatus();
    },

    // Load notifications
    loadNotifications() {
        const currentUser = App.getCurrentUser();
        const notifications = DataManager.getNotificationsForUser(currentUser.email);
        const unreadCount = DataManager.getUnreadNotificationCount(currentUser.email);
        
        // Update notification badge in header if exists
        const notificationBadge = document.getElementById('notificationBadge');
        if (notificationBadge) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
        
        // Show recent notifications
        if (notifications.length > 0) {
            this.showRecentNotifications(notifications.slice(0, 3));
        }
    },

    // Show recent notifications
    showRecentNotifications(notifications) {
        const notificationContainer = document.getElementById('recentNotifications');
        if (!notificationContainer) return;
        
        notificationContainer.innerHTML = '';
        
        notifications.forEach(notification => {
            const notificationDiv = document.createElement('div');
            notificationDiv.className = `notification-item ${notification.isRead ? 'read' : 'unread'}`;
            
            // Enhanced notification content based on type
            let enhancedMessage = notification.message;
            if (notification.type === 'officer_assigned' && notification.officerInfo) {
                enhancedMessage = `
                    <div class="officer-assignment-notification">
                        <div class="officer-info">
                            <strong>${notification.officerInfo.name}</strong>
                            <span class="specialization">${notification.officerInfo.specialization}</span>
                        </div>
                        <div class="officer-details">
                            <span class="rating">⭐ ${notification.officerInfo.rating}/5</span>
                            <span class="experience">${notification.officerInfo.experience}</span>
                        </div>
                        <div class="assignment-message">${notification.message}</div>
                    </div>
                `;
            }
            
            notificationDiv.innerHTML = `
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${enhancedMessage}</div>
                    <div class="notification-time">${Utils.formatDate(notification.createdAt)}</div>
                </div>
                <div class="notification-actions">
                    <button class="btn-sm" onclick="UserDashboard.markNotificationRead(${notification.id})">
                        ${notification.isRead ? 'Read' : 'Mark Read'}
                    </button>
                </div>
            `;
            notificationContainer.appendChild(notificationDiv);
        });
    },

    // Mark notification as read
    markNotificationRead(notificationId) {
        DataManager.markNotificationAsRead(notificationId);
        this.loadNotifications();
    },

    // Update escalation levels
    updateEscalationLevels() {
        DataManager.updateEscalationLevels();
        this.loadUserIssues(); // Refresh issues to show updated escalation levels
    },

    // Update user statistics
    updateStats() {
        const currentUser = App.getCurrentUser();
        const stats = DataManager.getUserIssueStats(currentUser.email);
        
        document.getElementById('userPendingCount').textContent = stats.pending;
        document.getElementById('userReviewCount').textContent = stats.inReview;
        document.getElementById('userResolvedCount').textContent = stats.resolved;
    },

    // Load user issues
    loadUserIssues() {
        const currentUser = App.getCurrentUser();
        const userIssues = DataManager.getIssuesByUser(currentUser.email);
        const statusFilter = document.getElementById('statusFilter').value;
        
        const filteredIssues = statusFilter ? 
            userIssues.filter(issue => issue.status === statusFilter) : 
            userIssues;
        
        this.displayIssues(filteredIssues);
    },

    // Display issues
    displayIssues(issues) {
        const container = document.getElementById('userIssuesList');
        container.innerHTML = '';
        
        if (issues.length === 0) {
            container.innerHTML = '<div class="no-issues">No issues found. <a href="#" onclick="App.switchDashboardSection(\'submit\')">Submit your first issue</a></div>';
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
        
        // Get escalation level with color coding
        const escalationLevel = issue.escalationLevel || 'Block';
        const escalationClass = this.getEscalationClass(escalationLevel);
        
        card.innerHTML = `
            <div class="issue-header">
                <div>
                    <div class="issue-title">${Utils.sanitizeHtml(issue.title)}</div>
                    <div class="issue-meta">
                        <span class="status-badge status-${issue.status}">${Utils.formatStatus(issue.status)}</span>
                        <span class="urgency-badge urgency-${issue.urgency}">${Utils.formatUrgency(issue.urgency)}</span>
                        <span class="escalation-badge ${escalationClass}">${escalationLevel}</span>
                        <span>${Utils.formatDate(issue.submittedDate)}</span>
                    </div>
                </div>
                <button class="btn-secondary" onclick="UserDashboard.viewIssueDetails(${issue.id})">View Details</button>
            </div>
            <div class="issue-description">${Utils.sanitizeHtml(issue.description)}</div>
            <div class="issue-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${Utils.sanitizeHtml(issue.location)}</span>
                <span><i class="fas fa-building"></i> ${issue.department || 'General Services'}</span>
                <span><i class="fas fa-layer-group"></i> <strong>Escalation:</strong> ${escalationLevel}</span>
                ${issue.assignedTo ? `<span><i class="fas fa-user-shield"></i> Assigned to Officer</span>` : ''}
            </div>
        `;
        
        return card;
    },

    // Get escalation class for styling
    getEscalationClass(level) {
        switch(level) {
            case 'Block': return 'escalation-block';
            case 'District': return 'escalation-district';
            case 'State': return 'escalation-state';
            case 'Court': return 'escalation-court';
            default: return 'escalation-block';
        }
    },

    // Handle issue submission
    handleIssueSubmission(e) {
        e.preventDefault();
        console.log('Form submission started - handleIssueSubmission called');
        
        const title = document.getElementById('issueTitle').value.trim();
        const description = document.getElementById('issueDescription').value.trim();
        const location = document.getElementById('issueLocation').value.trim();
        const urgency = document.getElementById('issueUrgency').value;
        
        console.log('Form data:', { title, description, location, urgency });
        
        // Validation
        if (!title || !description || !urgency) {
            Notifications.error('Please fill in all required fields');
            return;
        }
        
        if (title.length < 5) {
            Notifications.error('Title must be at least 5 characters long');
            return;
        }
        
        if (description.length < 10) {
            Notifications.error('Description must be at least 10 characters long');
            return;
        }
        
        // Location validation - MANDATORY: User must use current location
        let finalLocation = location;
        let coordinates = MapManager.getCurrentLocationCoords();
        
        // Check if user has provided current location
        if (!coordinates) {
            Notifications.error('Current location is mandatory. Please allow location access or use the "Use Current Location" button.');
            this.showLocationRequiredMessage();
            return;
        }
        
        // Use current location coordinates as the primary location
        finalLocation = `Current Location: ${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`;
        
        // If user also provided text location, append it for reference
        if (location && location.trim()) {
            finalLocation += ` (${location.trim()})`;
        }
        
        // Get current user
        const currentUser = App.getCurrentUser();
        console.log('Current user:', currentUser);
        
        if (!currentUser) {
            Notifications.error('User not found. Please login again.');
            return;
        }
        
        // Auto-detect department before creating issue
        const issueData = {
            title,
            description,
            location: finalLocation,
            coordinates: coordinates || [40.7128, -74.0060],
            urgency,
            submittedBy: currentUser.email,
            photos: this.getPhotoPreviews()
        };
        
        const detectedDepartment = DataManager.determineDepartment(issueData);
        
        // Show department detection result to user
        this.showDepartmentDetection(detectedDepartment, title);
        
        // Create issue with detected department
        const issue = DataManager.createIssue(issueData);
        
        console.log('Issue created:', issue);
        
        // Check if issue was created successfully
        if (issue && issue.id) {
            Notifications.success(`Issue submitted successfully! Auto-assigned to ${detectedDepartment} department.`);
        } else {
            Notifications.warning('Issue submitted but there may have been storage issues. Please check your issues list.');
        }
        
        // Reset form
        e.target.reset();
        document.getElementById('photoPreview').innerHTML = '';
        MapManager.clearCurrentLocation();
        
        // Hide location input again
        const locationInput = document.getElementById('issueLocation');
        if (locationInput) {
            locationInput.style.display = 'none';
        }
        
        // Update stats and reload issues
        this.updateStats();
        this.loadUserIssues();
    },

    // Show department detection result
    showDepartmentDetection(department, title) {
        // Create a temporary notification showing department detection
        const notification = document.createElement('div');
        notification.className = 'department-detection-notification';
        notification.innerHTML = `
            <div class="detection-content">
                <i class="fas fa-brain"></i>
                <div class="detection-text">
                    <strong>Smart Department Detection</strong><br>
                    Based on your issue "${title}", we've automatically assigned it to <strong>${department}</strong>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    },

    // Handle photo preview
    async handlePhotoPreview(e) {
        const file = e.target.files[0];
        if (file) {
            try {
                // Validate file
                ImageProcessor.validateImageFile(file);
                
                // Show loading
                Notifications.info('Processing image for GPS extraction...', 'info');
                
                // Process image for GPS only
                const results = await ImageProcessor.processImage(file);
                
                // Display image preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '100px';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '8px';
                    img.style.margin = '5px';
                    img.style.border = '2px solid #e0e0e0';
                    img.style.cursor = 'pointer';
                    
                    document.getElementById('photoPreview').appendChild(img);
                };
                reader.readAsDataURL(file);
                
                // Process GPS data from EXIF or OCR
                if (results.gpsData) {
                    const locationInput = document.getElementById('issueLocation');
                    if (locationInput) {
                        locationInput.value = `${results.gpsData.source}: ${results.gpsData.latitude.toFixed(6)}, ${results.gpsData.longitude.toFixed(6)}`;
                        locationInput.style.display = 'none'; // Hide location input since coordinates found
                    }
                    
                    // Update map
                    if (MapManager.maps.userMap) {
                        MapManager.selectLocation({
                            lat: results.gpsData.latitude,
                            lng: results.gpsData.longitude
                        });
                    }
                    
                    // Set coordinates in MapManager
                    MapManager.currentLocation = [results.gpsData.latitude, results.gpsData.longitude];
                    
                    if (results.gpsData.source === 'EXIF') {
                        Notifications.success('GPS location extracted from camera photo!', 'success');
                    } else if (results.gpsData.source === 'OCR') {
                        Notifications.success('Coordinates found in image text!', 'success');
                    }
                } else {
                    // No coordinates found in image - user must use current location
                    Notifications.warning('No coordinates found in image. Current location is mandatory - please use the "Use Current Location" button.', 'warning');
                    
                    // Show location required message
                    this.showLocationRequiredMessage();
                }
                
            } catch (error) {
                Notifications.error(error.message || 'Error processing image');
                e.target.value = '';
            }
        }
    },

    // Add current location button
    addCurrentLocationButton() {
        const locationContainer = document.querySelector('.location-input');
        if (locationContainer && !document.getElementById('currentLocationBtn')) {
            const currentLocationBtn = document.createElement('button');
            currentLocationBtn.id = 'currentLocationBtn';
            currentLocationBtn.type = 'button';
            currentLocationBtn.className = 'btn-primary';
            currentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use Current Location (Required)';
            currentLocationBtn.addEventListener('click', () => this.getCurrentLocation());
            locationContainer.appendChild(currentLocationBtn);
        }
    },

    // Show location required message
    showLocationRequiredMessage() {
        const locationContainer = document.querySelector('.location-input');
        if (locationContainer) {
            // Remove existing message
            const existingMessage = document.getElementById('locationRequiredMessage');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            // Add new message
            const message = document.createElement('div');
            message.id = 'locationRequiredMessage';
            message.className = 'location-required-message';
            message.innerHTML = `
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 10px; margin: 10px 0; color: #856404;">
                    <strong><i class="fas fa-exclamation-triangle"></i> Current Location Required</strong><br>
                    For accurate issue reporting, please use your current location. Click the button below to get your GPS coordinates.
                </div>
            `;
            locationContainer.appendChild(message);
            
            // Ensure current location button is visible
            this.addCurrentLocationButton();
        }
    },

    // Get current location
    async getCurrentLocation() {
        try {
            const location = await ImageProcessor.getCurrentLocation();
            const locationInput = document.getElementById('issueLocation');
            if (locationInput) {
                locationInput.value = `Current: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
            }
            
            // Set coordinates in MapManager for form submission
            MapManager.currentLocation = [location.latitude, location.longitude];
            
            // Update map
            if (MapManager.maps.userMap) {
                MapManager.selectLocation({
                    lat: location.latitude,
                    lng: location.longitude
                });
            }
            
            // Remove the location required message since we now have location
            const locationMessage = document.getElementById('locationRequiredMessage');
            if (locationMessage) {
                locationMessage.remove();
            }
            
            Notifications.success('Current location obtained! You can now submit your issue.', 'success');
        } catch (error) {
            Notifications.error('Unable to get current location. Please check your browser permissions and try again.', 'error');
            this.showLocationRequiredMessage();
        }
    },

    // Get photo previews
    getPhotoPreviews() {
        const previews = [];
        document.querySelectorAll('#photoPreview img').forEach(img => {
            previews.push(img.src);
        });
        return previews;
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
            <p><strong>Description:</strong> ${Utils.sanitizeHtml(issue.description)}</p>
            <p><strong>Location:</strong> ${Utils.sanitizeHtml(issue.location)}</p>
            <p><strong>Escalation Level:</strong> ${issue.escalationLevel}</p>
            ${issue.assignedTo ? `<p><strong>Assigned To:</strong> ${issue.assignedTo}</p>` : ''}
            ${issue.photos.length > 0 ? `
                <div class="photo-preview">
                    <strong>Photos:</strong><br>
                    ${issue.photos.map(photo => `<img src="${photo}" alt="Issue Photo" style="width: 150px; height: 150px; object-fit: cover; margin: 5px; border-radius: 8px;">`).join('')}
                </div>
            ` : ''}
        `;
        
        document.getElementById('issueModal').style.display = 'block';
    },

    // Initialize chatbot
    initializeChatbot() {
        // Initialize chatbot for user role
        if (App.getModule('chatbot')) {
            App.getModule('chatbot').initializeForRole('user');
        }
    },

    // Send chatbot message
    sendChatbotMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addChatbotMessage(message, 'user');
        input.value = '';
        
        // Get response from chatbot module
        const response = App.getModule('chatbot').getResponse(message, 'user');
        setTimeout(() => {
            this.addChatbotMessage(response, 'bot');
        }, 1000);
    },

    // Add chatbot message
    addChatbotMessage(message, sender) {
        const messages = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        messageDiv.innerHTML = sender === 'bot' ? 
            `<strong>CivicBot:</strong> ${Utils.sanitizeHtml(message)}` : 
            Utils.sanitizeHtml(message);
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    },

    // Update storage status
    updateStorageStatus() {
        try {
            const storageInfo = DataManager.getStorageInfo();
            const storageStatus = document.getElementById('storageStatus');
            const storageUsage = document.getElementById('storageUsage');
            
            if (storageInfo && storageStatus && storageUsage) {
                storageUsage.textContent = `Storage: ${storageInfo.totalSizeFormatted}`;
                
                // Show storage status if usage is high (>100KB)
                if (storageInfo.totalSize > 100 * 1024) {
                    storageStatus.style.display = 'flex';
                } else {
                    storageStatus.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error updating storage status:', error);
        }
    }
};

// Make UserDashboard globally available
window.UserDashboard = UserDashboard;

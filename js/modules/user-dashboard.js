// User Dashboard Module
const UserDashboard = {
    // Initialize user dashboard
    init() {
        this.setupEventListeners();
        console.log('UserDashboard initialized');
    },

    // Set up event listeners
    setupEventListeners() {
        // Issue form submission
        document.getElementById('issueForm').addEventListener('submit', (e) => this.handleIssueSubmission(e));
        
        // Location selection
        document.getElementById('selectLocationBtn').addEventListener('click', () => MapManager.showLocationMap());
        
        // Photo upload
        document.getElementById('issuePhoto').addEventListener('change', (e) => this.handlePhotoPreview(e));
        
        // Status filter
        document.getElementById('statusFilter').addEventListener('change', () => this.loadUserIssues());
        
        // Chatbot
        document.getElementById('chatbotSend').addEventListener('click', () => this.sendChatbotMessage());
        document.getElementById('chatbotInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatbotMessage();
        });
    },

    // Show user dashboard
    show() {
        const currentUser = App.getCurrentUser();
        const welcomeElement = document.getElementById('userWelcome');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${currentUser.name || currentUser.email}`;
        }
        
        this.updateStats();
        this.loadUserIssues();
        this.initializeChatbot();
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
                <button class="btn-secondary" onclick="UserDashboard.viewIssueDetails(${issue.id})">View Details</button>
            </div>
            <div class="issue-description">${Utils.sanitizeHtml(issue.description)}</div>
            <div class="issue-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${Utils.sanitizeHtml(issue.location)}</span>
                <span><i class="fas fa-building"></i> ${issue.department || 'General Services'}</span>
                <span><i class="fas fa-layer-group"></i> ${issue.escalationLevel}</span>
                ${issue.assignedTo ? `<span><i class="fas fa-user-shield"></i> Assigned to Officer</span>` : ''}
            </div>
        `;
        
        return card;
    },

    // Handle issue submission
    handleIssueSubmission(e) {
        e.preventDefault();
        
        const title = document.getElementById('issueTitle').value.trim();
        const description = document.getElementById('issueDescription').value.trim();
        const location = document.getElementById('issueLocation').value.trim();
        const urgency = document.getElementById('issueUrgency').value;
        
        // Validation
        if (!title || !description || !location || !urgency) {
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
        
        // Get current user
        const currentUser = App.getCurrentUser();
        
        // Create issue
        const issue = DataManager.createIssue({
            title,
            description,
            location,
            coordinates: MapManager.getCurrentLocationCoords() || [40.7128, -74.0060],
            urgency,
            submittedBy: currentUser.email,
            photos: this.getPhotoPreviews()
        });
        
        Notifications.success('Issue submitted successfully!');
        
        // Reset form
        e.target.reset();
        document.getElementById('photoPreview').innerHTML = '';
        MapManager.clearCurrentLocation();
        
        // Update stats and reload issues
        this.updateStats();
        this.loadUserIssues();
    },

    // Handle photo preview
    async handlePhotoPreview(e) {
        const file = e.target.files[0];
        if (file) {
            try {
                // Validate file
                ImageProcessor.validateImageFile(file);
                
                // Show loading
                Notifications.info('Processing image for GPS and text extraction...', 'info');
                
                // Process image for GPS and OCR
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
                    
                    // Add click handler to process image
                    img.addEventListener('click', () => {
                        this.processImageForLocation(file);
                        this.processImageForText(file);
                    });
                    
                    document.getElementById('photoPreview').appendChild(img);
                };
                reader.readAsDataURL(file);
                
                // Process GPS data
                if (results.gpsData) {
                    const locationInput = document.getElementById('issueLocation');
                    if (locationInput) {
                        locationInput.value = `${results.gpsData.latitude.toFixed(6)}, ${results.gpsData.longitude.toFixed(6)}`;
                    }
                    
                    // Update map
                    if (MapManager.maps.userMap) {
                        MapManager.selectLocation({
                            lat: results.gpsData.latitude,
                            lng: results.gpsData.longitude
                        });
                    }
                    
                    Notifications.success('GPS location extracted from image!', 'success');
                }
                
                // Process OCR text
                if (results.ocrText) {
                    const titleInput = document.getElementById('issueTitle');
                    const descriptionInput = document.getElementById('issueDescription');
                    
                    if (titleInput && results.ocrText.length > 0) {
                        titleInput.value = results.ocrText;
                    }
                    
                    if (descriptionInput && results.ocrText.length > 0) {
                        descriptionInput.value = `Issue identified from image: ${results.ocrText}`;
                    }
                    
                    Notifications.success('Text extracted from image!', 'success');
                }
                
            } catch (error) {
                Notifications.error(error.message || 'Error processing image');
                e.target.value = '';
            }
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
        const messages = document.getElementById('chatbotMessages');
        messages.innerHTML = `
            <div class="chatbot-message bot">
                <strong>CivicBot:</strong> Hello! I'm here to help you with civic issues. You can ask me about:
                <br>• Issue status updates
                <br>• How to submit a new issue
                <br>• Your submitted issues
                <br>• General guidance
            </div>
        `;
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
    }
};

// Make UserDashboard globally available
window.UserDashboard = UserDashboard;

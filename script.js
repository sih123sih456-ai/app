// Global Variables
let currentUser = null;
let currentRole = null;
let issues = [];
let accessRequests = [];
let maps = {};
let currentMap = null;
let currentLocation = null;

// Sample data for demonstration
const sampleIssues = [
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

const sampleAccessRequests = [
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    issues = [...sampleIssues];
    accessRequests = [...sampleAccessRequests];
    
    initializeEventListeners();
    showPage('loginPage');
});

// Event Listeners
function initializeEventListeners() {
    // Login page events
    document.getElementById('userToggle').addEventListener('click', () => switchRole('user'));
    document.getElementById('adminToggle').addEventListener('click', () => switchRole('admin'));
    
    document.getElementById('userLoginTab').addEventListener('click', () => switchAuthTab('user', 'login'));
    document.getElementById('userRegisterTab').addEventListener('click', () => switchAuthTab('user', 'register'));
    document.getElementById('adminLoginTab').addEventListener('click', () => switchAuthTab('admin', 'login'));
    document.getElementById('adminRequestTab').addEventListener('click', () => switchAuthTab('admin', 'request'));
    
    // Form submissions
    document.getElementById('userLoginForm').addEventListener('submit', handleUserLogin);
    document.getElementById('userRegisterForm').addEventListener('submit', handleUserRegister);
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    document.getElementById('adminRequestForm').addEventListener('submit', handleAdminRequest);
    
    // Dashboard navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.getAttribute('data-section');
            switchDashboardSection(section);
        });
    });
    
    // Issue form
    document.getElementById('issueForm').addEventListener('submit', handleIssueSubmission);
    document.getElementById('selectLocationBtn').addEventListener('click', showLocationMap);
    document.getElementById('issuePhoto').addEventListener('change', handlePhotoPreview);
    
    // Filters
    document.getElementById('statusFilter').addEventListener('change', filterUserIssues);
    document.getElementById('adminStatusFilter').addEventListener('change', filterAdminIssues);
    document.getElementById('adminUrgencyFilter').addEventListener('change', filterAdminIssues);
    
    // Logout buttons
    document.getElementById('userLogout').addEventListener('click', logout);
    document.getElementById('adminLogout').addEventListener('click', logout);
    document.getElementById('officerLogout').addEventListener('click', logout);
    
    // Chatbot
    document.getElementById('chatbotSend').addEventListener('click', sendChatbotMessage);
    document.getElementById('chatbotInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatbotMessage();
    });
    
    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModal();
    });
}

// Role and Auth Management
function switchRole(role) {
    document.getElementById('userToggle').classList.toggle('active', role === 'user');
    document.getElementById('adminToggle').classList.toggle('active', role === 'admin');
    document.getElementById('userAuth').classList.toggle('active', role === 'user');
    document.getElementById('adminAuth').classList.toggle('active', role === 'admin');
}

function switchAuthTab(role, tab) {
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
}

// Authentication Handlers
function handleUserLogin(e) {
    e.preventDefault();
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    
    // Simple validation - in real app, this would be server-side
    if (email && password) {
        currentUser = { email, role: 'user' };
        currentRole = 'user';
        showToast('Login successful!', 'success');
        showUserDashboard();
    } else {
        showToast('Please fill in all fields', 'error');
    }
}

function handleUserRegister(e) {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userRegEmail').value;
    const password = document.getElementById('userRegPassword').value;
    const phone = document.getElementById('userPhone').value;
    
    if (name && email && password && phone) {
        currentUser = { name, email, role: 'user' };
        currentRole = 'user';
        showToast('Registration successful!', 'success');
        showUserDashboard();
    } else {
        showToast('Please fill in all fields', 'error');
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    if (email === 'admin@gmail.com' && password === 'admin123') {
        currentUser = { email, role: 'admin' };
        currentRole = 'admin';
        showToast('Admin login successful!', 'success');
        showAdminDashboard();
    } else {
        showToast('Invalid credentials', 'error');
    }
}

function handleAdminRequest(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const request = {
        id: accessRequests.length + 1,
        name: document.getElementById('adminName').value,
        email: document.getElementById('adminRegEmail').value,
        department: document.getElementById('adminDept').value,
        phone: document.getElementById('adminPhone').value,
        location: document.getElementById('adminLocation').value,
        experience: document.getElementById('adminExperience').value,
        reason: document.getElementById('adminReason').value,
        profileImage: document.getElementById('adminProfileImage').files[0],
        status: 'pending',
        submittedDate: new Date().toISOString()
    };
    
    accessRequests.push(request);
    showToast('Access request submitted successfully!', 'success');
    e.target.reset();
}

// Dashboard Management
function showUserDashboard() {
    showPage('userDashboard');
    document.getElementById('userWelcome').textContent = `Welcome, ${currentUser.name || currentUser.email}`;
    updateUserStats();
    loadUserIssues();
    initializeChatbot();
}

function showAdminDashboard() {
    showPage('adminDashboard');
    document.getElementById('adminWelcome').textContent = `Welcome, Admin`;
    updateAdminStats();
    loadAdminIssues();
    loadAccessRequests();
    initializeAdminMap();
}

function showOfficerDashboard() {
    showPage('officerDashboard');
    document.getElementById('officerWelcome').textContent = `Welcome, Officer`;
    updateOfficerStats();
    loadOfficerIssues();
    initializeOfficerMap();
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function switchDashboardSection(sectionId) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-section') === sectionId);
    });
    
    // Update sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    // Initialize specific sections
    if (sectionId === 'admin-map' || sectionId === 'officer-map') {
        setTimeout(() => {
            if (sectionId === 'admin-map') initializeAdminMap();
            else if (sectionId === 'officer-map') initializeOfficerMap();
        }, 100);
    }
}

// Issue Management
function handleIssueSubmission(e) {
    e.preventDefault();
    
    const issue = {
        id: issues.length + 1,
        title: document.getElementById('issueTitle').value,
        description: document.getElementById('issueDescription').value,
        location: document.getElementById('issueLocation').value,
        coordinates: currentLocation || [40.7128, -74.0060],
        urgency: document.getElementById('issueUrgency').value,
        status: 'pending',
        submittedBy: currentUser.email,
        submittedDate: new Date().toISOString(),
        photos: getPhotoPreviews(),
        assignedTo: null,
        escalationLevel: 'Block'
    };
    
    issues.push(issue);
    showToast('Issue submitted successfully!', 'success');
    e.target.reset();
    document.getElementById('photoPreview').innerHTML = '';
    currentLocation = null;
    
    // Update stats and lists
    updateUserStats();
    loadUserIssues();
}

function getPhotoPreviews() {
    const previews = [];
    document.querySelectorAll('#photoPreview img').forEach(img => {
        previews.push(img.src);
    });
    return previews;
}

function handlePhotoPreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            img.style.margin = '5px';
            document.getElementById('photoPreview').appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

// Map Functions
function showLocationMap() {
    const mapContainer = document.getElementById('mapContainer');
    mapContainer.style.display = mapContainer.style.display === 'none' ? 'block' : 'none';
    
    if (!maps.userMap) {
        initializeUserMap();
    }
}

function initializeUserMap() {
    const mapContainer = document.getElementById('mapContainer');
    maps.userMap = L.map('mapContainer').setView([40.7128, -74.0060], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(maps.userMap);
    
    maps.userMap.on('click', function(e) {
        currentLocation = [e.latlng.lat, e.latlng.lng];
        document.getElementById('issueLocation').value = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
        
        // Clear existing markers
        maps.userMap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                maps.userMap.removeLayer(layer);
            }
        });
        
        // Add new marker
        L.marker([e.latlng.lat, e.latlng.lng]).addTo(maps.userMap)
            .bindPopup('Selected Location').openPopup();
    });
}

function initializeAdminMap() {
    const mapContainer = document.getElementById('adminMapContainer');
    if (!mapContainer) return;
    
    if (maps.adminMap) {
        maps.adminMap.remove();
    }
    
    maps.adminMap = L.map('adminMapContainer').setView([40.7128, -74.0060], 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(maps.adminMap);
    
    // Add issue markers
    issues.forEach(issue => {
        if (issue.coordinates) {
            const color = getUrgencyColor(issue.urgency);
            const marker = L.circleMarker(issue.coordinates, {
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                radius: 8
            }).addTo(maps.adminMap);
            
            marker.bindPopup(`
                <strong>${issue.title}</strong><br>
                <span class="urgency-${issue.urgency}">${issue.urgency.toUpperCase()}</span><br>
                <span class="status-${issue.status}">${issue.status.replace('-', ' ').toUpperCase()}</span>
            `);
        }
    });
}

function initializeOfficerMap() {
    const mapContainer = document.getElementById('officerMapContainer');
    if (!mapContainer) return;
    
    if (maps.officerMap) {
        maps.officerMap.remove();
    }
    
    maps.officerMap = L.map('officerMapContainer').setView([40.7128, -74.0060], 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(maps.officerMap);
    
    // Add assigned issue markers
    const assignedIssues = issues.filter(issue => issue.assignedTo === currentUser.email);
    assignedIssues.forEach(issue => {
        if (issue.coordinates) {
            const color = getUrgencyColor(issue.urgency);
            const marker = L.circleMarker(issue.coordinates, {
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                radius: 8
            }).addTo(maps.officerMap);
            
            marker.bindPopup(`
                <strong>${issue.title}</strong><br>
                <span class="urgency-${issue.urgency}">${issue.urgency.toUpperCase()}</span><br>
                <span class="status-${issue.status}">${issue.status.replace('-', ' ').toUpperCase()}</span>
            `);
        }
    });
}

function getUrgencyColor(urgency) {
    switch (urgency) {
        case 'high': return '#dc3545';
        case 'medium': return '#ffc107';
        case 'low': return '#28a745';
        default: return '#6c757d';
    }
}

// Data Loading and Display
function updateUserStats() {
    const userIssues = issues.filter(issue => issue.submittedBy === currentUser.email);
    document.getElementById('userPendingCount').textContent = userIssues.filter(i => i.status === 'pending').length;
    document.getElementById('userReviewCount').textContent = userIssues.filter(i => i.status === 'in-review').length;
    document.getElementById('userResolvedCount').textContent = userIssues.filter(i => i.status === 'resolved').length;
}

function updateAdminStats() {
    document.getElementById('adminPendingCount').textContent = issues.filter(i => i.status === 'pending').length;
    document.getElementById('adminReviewCount').textContent = issues.filter(i => i.status === 'in-review').length;
    document.getElementById('adminResolvedCount').textContent = issues.filter(i => i.status === 'resolved').length;
    document.getElementById('adminRequestCount').textContent = accessRequests.filter(r => r.status === 'pending').length;
}

function updateOfficerStats() {
    const assignedIssues = issues.filter(issue => issue.assignedTo === currentUser.email);
    document.getElementById('officerAssignedCount').textContent = assignedIssues.length;
    document.getElementById('officerProgressCount').textContent = assignedIssues.filter(i => i.status === 'in-progress').length;
    document.getElementById('officerResolvedCount').textContent = assignedIssues.filter(i => i.status === 'resolved').length;
}

function loadUserIssues() {
    const userIssues = issues.filter(issue => issue.submittedBy === currentUser.email);
    const statusFilter = document.getElementById('statusFilter').value;
    const filteredIssues = statusFilter ? userIssues.filter(issue => issue.status === statusFilter) : userIssues;
    
    displayIssues(filteredIssues, 'userIssuesList');
}

function loadAdminIssues() {
    const statusFilter = document.getElementById('adminStatusFilter').value;
    const urgencyFilter = document.getElementById('adminUrgencyFilter').value;
    
    let filteredIssues = issues;
    if (statusFilter) filteredIssues = filteredIssues.filter(issue => issue.status === statusFilter);
    if (urgencyFilter) filteredIssues = filteredIssues.filter(issue => issue.urgency === urgencyFilter);
    
    displayIssues(filteredIssues, 'adminIssuesList', true);
}

function loadOfficerIssues() {
    const assignedIssues = issues.filter(issue => issue.assignedTo === currentUser.email);
    displayIssues(assignedIssues, 'officerIssuesList', false, true);
}

function displayIssues(issuesList, containerId, showActions = false, isOfficer = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    issuesList.forEach(issue => {
        const issueCard = document.createElement('div');
        issueCard.className = `issue-card ${issue.urgency}`;
        issueCard.innerHTML = `
            <div class="issue-header">
                <div>
                    <div class="issue-title">${issue.title}</div>
                    <div class="issue-meta">
                        <span class="status-badge status-${issue.status}">${issue.status.replace('-', ' ')}</span>
                        <span class="urgency-badge urgency-${issue.urgency}">${issue.urgency}</span>
                        <span>${new Date(issue.submittedDate).toLocaleDateString()}</span>
                    </div>
                </div>
                ${showActions ? `
                    <div class="issue-actions">
                        <button class="btn-primary" onclick="assignIssue(${issue.id})">Assign</button>
                        <button class="btn-secondary" onclick="viewIssueDetails(${issue.id})">View</button>
                    </div>
                ` : ''}
                ${isOfficer ? `
                    <div class="issue-actions">
                        <button class="btn-primary" onclick="updateIssueStatus(${issue.id}, 'in-progress')">Start</button>
                        <button class="btn-success" onclick="updateIssueStatus(${issue.id}, 'resolved')">Resolve</button>
                    </div>
                ` : ''}
            </div>
            <div class="issue-description">${issue.description}</div>
            <div class="issue-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${issue.location}</span>
                <span><i class="fas fa-layer-group"></i> ${issue.escalationLevel}</span>
            </div>
        `;
        container.appendChild(issueCard);
    });
}

function loadAccessRequests() {
    const container = document.getElementById('accessRequestsList');
    container.innerHTML = '';
    
    accessRequests.forEach(request => {
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        requestCard.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <div class="request-avatar">
                        ${request.profileImage ? 
                            `<img src="${URL.createObjectURL(request.profileImage)}" alt="Profile">` : 
                            '<i class="fas fa-user"></i>'
                        }
                    </div>
                    <div class="request-details">
                        <h3>${request.name}</h3>
                        <p>${request.department} • ${request.location}</p>
                        <p>Experience: ${request.experience}</p>
                    </div>
                </div>
                <div class="request-actions">
                    <button class="btn-success" onclick="approveRequest(${request.id})">Approve</button>
                    <button class="btn-danger" onclick="rejectRequest(${request.id})">Reject</button>
                </div>
            </div>
            <div class="request-details">
                <p><strong>Email:</strong> ${request.email}</p>
                <p><strong>Phone:</strong> ${request.phone}</p>
                <p><strong>Reason:</strong> ${request.reason}</p>
            </div>
        `;
        container.appendChild(requestCard);
    });
}

// Filter Functions
function filterUserIssues() {
    loadUserIssues();
}

function filterAdminIssues() {
    loadAdminIssues();
}

// Action Functions
function assignIssue(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
        issue.assignedTo = 'officer@example.com'; // In real app, this would be selected
        issue.status = 'in-review';
        showToast('Issue assigned successfully!', 'success');
        loadAdminIssues();
        updateAdminStats();
    }
}

function updateIssueStatus(issueId, status) {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
        issue.status = status;
        showToast(`Issue status updated to ${status.replace('-', ' ')}`, 'success');
        loadOfficerIssues();
        updateOfficerStats();
    }
}

function approveRequest(requestId) {
    const request = accessRequests.find(r => r.id === requestId);
    if (request) {
        request.status = 'approved';
        showToast('Access request approved!', 'success');
        loadAccessRequests();
        updateAdminStats();
    }
}

function rejectRequest(requestId) {
    const request = accessRequests.find(r => r.id === requestId);
    if (request) {
        request.status = 'rejected';
        showToast('Access request rejected', 'warning');
        loadAccessRequests();
        updateAdminStats();
    }
}

function viewIssueDetails(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
        const modalContent = document.getElementById('issueModalContent');
        modalContent.innerHTML = `
            <h2>${issue.title}</h2>
            <div class="issue-meta">
                <span class="status-badge status-${issue.status}">${issue.status.replace('-', ' ')}</span>
                <span class="urgency-badge urgency-${issue.urgency}">${issue.urgency}</span>
                <span>Submitted: ${new Date(issue.submittedDate).toLocaleDateString()}</span>
            </div>
            <p><strong>Description:</strong> ${issue.description}</p>
            <p><strong>Location:</strong> ${issue.location}</p>
            <p><strong>Escalation Level:</strong> ${issue.escalationLevel}</p>
            ${issue.assignedTo ? `<p><strong>Assigned To:</strong> ${issue.assignedTo}</p>` : ''}
            ${issue.photos.length > 0 ? `
                <div class="photo-preview">
                    ${issue.photos.map(photo => `<img src="${photo}" alt="Issue Photo">`).join('')}
                </div>
            ` : ''}
        `;
        document.getElementById('issueModal').style.display = 'block';
    }
}

function closeModal() {
    document.getElementById('issueModal').style.display = 'none';
}

// Chatbot Functions
function initializeChatbot() {
    const messages = document.getElementById('chatbotMessages');
    messages.innerHTML = `
        <div class="chatbot-message bot">
            <strong>CivicBot:</strong> Hello! I'm here to help you with civic issues. You can ask me about:
            <br>• Issue status updates
            <br>• How to submit a new issue
            <br>• Your assigned issues
            <br>• General guidance
        </div>
    `;
}

function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (message) {
        addChatbotMessage(message, 'user');
        input.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const response = getChatbotResponse(message);
            addChatbotMessage(response, 'bot');
        }, 1000);
    }
}

function addChatbotMessage(message, sender) {
    const messages = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    messageDiv.innerHTML = sender === 'bot' ? `<strong>CivicBot:</strong> ${message}` : message;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function getChatbotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('status') || lowerMessage.includes('update')) {
        const userIssues = issues.filter(issue => issue.submittedBy === currentUser.email);
        if (userIssues.length === 0) {
            return "You haven't submitted any issues yet. Submit your first issue to track its status!";
        }
        
        let response = "Here's the status of your issues:\n";
        userIssues.forEach(issue => {
            response += `• ${issue.title}: ${issue.status.replace('-', ' ').toUpperCase()}\n`;
        });
        return response;
    }
    
    if (lowerMessage.includes('submit') || lowerMessage.includes('new issue')) {
        return "To submit a new issue:\n1. Go to the 'Submit Issue' tab\n2. Fill in the title and description\n3. Select urgency level\n4. Choose location on the map\n5. Upload photos if available\n6. Click 'Submit Issue'";
    }
    
    if (lowerMessage.includes('assigned') || lowerMessage.includes('officer')) {
        return "I can help you check your assigned issues. Go to the 'Track Issues' tab to see all your submitted issues and their current status.";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('guidance')) {
        return "I can help you with:\n• Checking issue status\n• Submitting new issues\n• Understanding the escalation process\n• General civic reporting guidance\n\nWhat would you like to know?";
    }
    
    return "I understand you're asking about: '" + message + "'. Could you be more specific? I can help with issue status, submissions, or general guidance.";
}

// Utility Functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function logout() {
    currentUser = null;
    currentRole = null;
    showPage('loginPage');
    showToast('Logged out successfully', 'info');
}

// Initialize maps when needed
function initializeMaps() {
    if (currentRole === 'admin' && document.getElementById('adminMapContainer')) {
        initializeAdminMap();
    }
    if (currentRole === 'officer' && document.getElementById('officerMapContainer')) {
        initializeOfficerMap();
    }
}

// Auto-refresh data every 30 seconds
setInterval(() => {
    if (currentUser) {
        switch (currentRole) {
            case 'user':
                updateUserStats();
                loadUserIssues();
                break;
            case 'admin':
                updateAdminStats();
                loadAdminIssues();
                break;
            case 'officer':
                updateOfficerStats();
                loadOfficerIssues();
                break;
        }
    }
}, 30000);

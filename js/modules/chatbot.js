// Enhanced Chatbot Module with Predefined Questions
const ChatbotModule = {
    isInitialized: false,
    conversationHistory: [],
    predefinedQuestions: [
        {
            id: 'status',
            question: 'Check my issue status',
            icon: 'fas fa-list-alt',
            category: 'Issues'
        },
        {
            id: 'submit',
            question: 'How to submit a new issue?',
            icon: 'fas fa-plus-circle',
            category: 'Help'
        },
        {
            id: 'escalation',
            question: 'What is issue escalation?',
            icon: 'fas fa-layer-group',
            category: 'Process'
        },
        {
            id: 'departments',
            question: 'Which department handles my issue?',
            icon: 'fas fa-building',
            category: 'Help'
        },
        {
            id: 'urgent',
            question: 'How to report urgent issues?',
            icon: 'fas fa-exclamation-triangle',
            category: 'Emergency'
        },
        {
            id: 'photos',
            question: 'Should I include photos?',
            icon: 'fas fa-camera',
            category: 'Help'
        },
        {
            id: 'location',
            question: 'Why is location required?',
            icon: 'fas fa-map-marker-alt',
            category: 'Help'
        },
        {
            id: 'tracking',
            question: 'How to track my issues?',
            icon: 'fas fa-search',
            category: 'Issues'
        }
    ],

    // Initialize chatbot
    init() {
        this.setupEventListeners();
        console.log('ChatbotModule initialized');
    },

    // Set up event listeners
    setupEventListeners() {
        // Chatbot send button
        document.getElementById('chatbotSend')?.addEventListener('click', () => this.sendMessage());
        
        // Chatbot input enter key
        document.getElementById('chatbotInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    },

    // Send message
    sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';
        
        // Get response
        this.getResponse(message);
    },

    // Add message to chat
    addMessage(message, sender) {
        const messages = document.getElementById('chatbotMessages');
        if (!messages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `<strong>CivicBot:</strong> ${Utils.sanitizeHtml(message)}`;
        } else {
            messageDiv.innerHTML = Utils.sanitizeHtml(message);
        }
        
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    },

    // Get response with predefined answers
    async getResponse(message) {
        // Add to conversation history
        this.conversationHistory.push({ role: 'user', content: message });
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
        
        // Hide typing indicator
        this.hideTypingIndicator();
        
        // Get response based on message
        const response = this.getPredefinedResponse(message);
        
        // Add bot response to conversation history
        this.conversationHistory.push({ role: 'assistant', content: response });
        
        // Add response to chat
        this.addMessage(response, 'bot');
        
        // Show predefined questions after response
        setTimeout(() => {
            this.showPredefinedQuestions();
        }, 1000);
    },

    // Get predefined response based on message
    getPredefinedResponse(message) {
        const lowerMessage = message.toLowerCase();
        const currentUser = App.getCurrentUser();
        const currentRole = App.getCurrentRole();
        
        // Check for specific question IDs
        if (lowerMessage.includes('status') || lowerMessage.includes('check my issue')) {
            return this.getStatusResponse(currentUser, currentRole);
        }
        
        if (lowerMessage.includes('submit') || lowerMessage.includes('new issue')) {
            return this.getSubmitResponse();
        }
        
        if (lowerMessage.includes('escalation') || lowerMessage.includes('escalate')) {
            return this.getEscalationResponse();
        }
        
        if (lowerMessage.includes('department') || lowerMessage.includes('which department')) {
            return this.getDepartmentResponse();
        }
        
        if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency')) {
            return this.getUrgentResponse();
        }
        
        if (lowerMessage.includes('photo') || lowerMessage.includes('image')) {
            return this.getPhotoResponse();
        }
        
        if (lowerMessage.includes('location') || lowerMessage.includes('gps')) {
            return this.getLocationResponse();
        }
        
        if (lowerMessage.includes('track') || lowerMessage.includes('follow')) {
            return this.getTrackingResponse();
        }
        
        if (lowerMessage.includes('help') || lowerMessage.includes('guidance')) {
            return this.getHelpResponse(currentRole);
        }
        
        // Default response
        return this.getDefaultResponse();
    },

    // Get status response
    getStatusResponse(user, role) {
        if (role === 'user') {
            const userIssues = DataManager.getIssuesByUser(user.email);
            if (userIssues.length === 0) {
                return "You haven't submitted any issues yet. Click 'Submit Issue' to report your first civic issue!";
            }
            
            let response = `You have ${userIssues.length} issue(s) in the system:\n\n`;
            userIssues.forEach((issue, index) => {
                response += `${index + 1}. **${issue.title}**\n`;
                response += `   Status: ${Utils.formatStatus(issue.status)}\n`;
                response += `   Department: ${issue.department}\n`;
                response += `   Submitted: ${Utils.formatDate(issue.submittedDate)}\n\n`;
            });
            return response;
        } else if (role === 'officer') {
            const officerIssues = DataManager.getIssuesByOfficer(user.email);
            if (officerIssues.length === 0) {
                return "You don't have any assigned issues at the moment.";
            }
            
            let response = `You have ${officerIssues.length} assigned issue(s):\n\n`;
            officerIssues.forEach((issue, index) => {
                response += `${index + 1}. **${issue.title}**\n`;
                response += `   Status: ${Utils.formatStatus(issue.status)}\n`;
                response += `   Urgency: ${Utils.formatUrgency(issue.urgency)}\n\n`;
            });
            return response;
        }
        
        return "I can help you check issue status. Please make sure you're logged in to see your issues.";
    },

    // Get submit response
    getSubmitResponse() {
        return `To submit a new issue, follow these steps:

1. **Fill in the details:**
   • Write a clear, descriptive title
   • Provide detailed description
   • Select urgency level (High/Medium/Low)

2. **Add location:**
   • Click "Select on Map" to choose location
   • Or use "Use Current Location" for GPS coordinates

3. **Upload photos (optional but recommended):**
   • Take photos of the issue
   • Photos help officers understand the problem better

4. **Submit:**
   • Review all information
   • Click "Submit Issue"

The system will automatically assign your issue to the appropriate department based on the content!`;
    },

    // Get escalation response
    getEscalationResponse() {
        return `Issues follow a 4-level escalation system:

🟢 **Block Level** (0-7 days)
   • Local authority handles the issue
   • Initial response and assessment

🟡 **District Level** (7-14 days)
   • District authorities take over
   • Higher priority and resources

🟠 **State Level** (14-30 days)
   • State intervention required
   • Maximum resources allocated

🔴 **Court Level** (30+ days)
   • Legal resolution process
   • Final escalation for unresolved issues

Issues automatically escalate based on severity, response time, and citizen complaints.`;
    },

    // Get department response
    getDepartmentResponse() {
        return `Our system automatically assigns issues to the right department:

🏗️ **Waste Water Department**
   • Sewer issues, drainage problems, wastewater

🛣️ **Road Construction Department**
   • Potholes, road damage, street construction

🏢 **Public Works**
   • Infrastructure, sidewalks, bridges

🌱 **Environmental Services**
   • Garbage, waste management, pollution

🚦 **Transportation**
   • Traffic signals, parking, transit

🏞️ **Parks & Recreation**
   • Parks, playgrounds, recreational facilities

⚡ **Utilities**
   • Electricity, power lines, gas

💧 **Water Department**
   • Water supply, leaks, water quality

The system uses AI to analyze your issue description and automatically route it to the correct department!`;
    },

    // Get urgent response
    getUrgentResponse() {
        return `For urgent issues, follow these steps:

🚨 **Immediate Actions:**
1. Select "High" urgency level
2. Provide detailed description
3. Include photos if safe to do so
4. Use current location for accuracy

⚡ **Urgent Issue Types:**
• Safety hazards (broken sidewalks, dangerous potholes)
• Water leaks or flooding
• Electrical hazards
• Blocked emergency routes
• Structural damage

📞 **Emergency Contact:**
For life-threatening situations, call emergency services first, then report through our system.

The system prioritizes urgent issues and assigns them to available officers immediately.`;
    },

    // Get photo response
    getPhotoResponse() {
        return `Photos are highly recommended and help in several ways:

📸 **Why include photos:**
• Officers can see the exact problem
• Faster issue assessment
• Better resource allocation
• Evidence for resolution tracking

📱 **Photo tips:**
• Take clear, well-lit photos
• Include multiple angles
• Show the full context
• Avoid dangerous situations

🔍 **GPS extraction:**
• Photos with GPS data help with precise location
• Camera photos often include location metadata
• System can extract coordinates automatically

Photos significantly improve issue resolution time and accuracy!`;
    },

    // Get location response
    getLocationResponse() {
        return `Location is mandatory for several important reasons:

📍 **Why location is required:**
• Officers need to find the exact issue
• Prevents duplicate reports
• Enables proper resource allocation
• Helps with priority assessment

🗺️ **Location options:**
1. **Current Location** (Recommended)
   • Uses GPS for precise coordinates
   • Most accurate method

2. **Map Selection**
   • Click on map to select location
   • Visual confirmation of position

3. **Manual Entry**
   • Enter address or coordinates
   • Backup option

🎯 **Accuracy matters:**
Precise location helps officers respond faster and allocate resources efficiently.`;
    },

    // Get tracking response
    getTrackingResponse() {
        return `Track your issues easily:

📊 **Dashboard Overview:**
• See all your submitted issues
• Check status at a glance
• View escalation levels

📋 **Issue Details:**
• Click "View Details" on any issue
• See complete information
• Track progress updates

🔔 **Notifications:**
• Get notified when status changes
• Officer assignment alerts
• Resolution confirmations

📱 **Real-time Updates:**
• Status changes instantly
• Escalation level updates
• Officer assignment notifications

💬 **Chat Support:**
• Ask me about any issue
• Get clarification on status
• Receive guidance and help

Your issues are always visible in the "Track Issues" section!`;
    },

    // Get help response
    getHelpResponse(role) {
        let response = "I'm here to help! Here's what I can assist you with:\n\n";
        
        if (role === 'user') {
            response += "👤 **For Citizens:**\n";
            response += "• Submit new civic issues\n";
            response += "• Check status of your issues\n";
            response += "• Understand the process\n";
            response += "• Get guidance on reporting\n";
            response += "• Learn about departments\n";
        } else if (role === 'admin') {
            response += "👨‍💼 **For Administrators:**\n";
            response += "• Manage all issues\n";
            response += "• Assign issues to officers\n";
            response += "• Approve access requests\n";
            response += "• View system statistics\n";
        } else if (role === 'officer') {
            response += "👮‍♂️ **For Officers:**\n";
            response += "• View assigned issues\n";
            response += "• Update issue status\n";
            response += "• Manage workload\n";
            response += "• Access issue details\n";
        }
        
        response += "\n💡 **Quick Actions:**\n";
        response += "• Click any question below for instant help\n";
        response += "• Type your specific question\n";
        response += "• I'll provide detailed guidance\n\n";
        response += "What would you like to know?";
        
        return response;
    },

    // Get default response
    getDefaultResponse() {
        return `I understand you're asking about: "${message}"

I can help you with:
• Issue status and tracking
• How to submit new issues
• Understanding the process
• Department information
• General guidance

Please click one of the questions below or ask me something more specific!`;
    },

    // Call Gemini API
    async callGeminiAPI(message) {
        const currentUser = App.getCurrentUser();
        const currentRole = App.getCurrentRole();
        
        // Prepare context for the AI
        const context = this.buildContext(currentUser, currentRole);
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: `${context}\n\nUser message: ${message}`
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };
        
        const response = await fetch(`${Config.GEMINI_API_URL}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid API response format');
        }
    },

    // Build context for AI
    buildContext(user, role) {
        let context = `You are CivicBot, an AI assistant for a civic issue reporting system. You help users with:
- Issue status updates
- How to submit new issues
- General guidance about civic reporting
- System navigation help

Current user role: ${role}
User: ${user ? user.name || user.email : 'Guest'}

System capabilities:
- Users can submit issues with photos, location, and urgency levels
- Issues go through escalation levels: Block → District → State → Court
- Statuses: Pending → In Review → In Progress → Resolved
- Officers can be assigned to issues
- Admins can manage all issues and approve access requests

Please provide helpful, concise responses. If you need specific data, mention that the user should check their dashboard.`;

        // Add role-specific context
        if (role === 'user') {
            const userIssues = DataManager.getIssuesByUser(user.email);
            context += `\n\nUser's current issues: ${userIssues.length} total`;
            if (userIssues.length > 0) {
                const statusCounts = userIssues.reduce((acc, issue) => {
                    acc[issue.status] = (acc[issue.status] || 0) + 1;
                    return acc;
                }, {});
                context += `\nStatus breakdown: ${JSON.stringify(statusCounts)}`;
            }
        } else if (role === 'admin') {
            const stats = DataManager.getIssueStats();
            context += `\n\nSystem statistics: ${JSON.stringify(stats)}`;
        } else if (role === 'officer') {
            const officerStats = DataManager.getOfficerIssueStats(user.email);
            context += `\n\nOfficer statistics: ${JSON.stringify(officerStats)}`;
        }

        return context;
    },

    // Fallback response when API is not available
    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        const currentUser = App.getCurrentUser();
        const currentRole = App.getCurrentRole();
        
        // Issue status queries
        if (lowerMessage.includes('status') || lowerMessage.includes('update')) {
            if (currentRole === 'user') {
                const userIssues = DataManager.getIssuesByUser(currentUser.email);
                if (userIssues.length === 0) {
                    return "You haven't submitted any issues yet. Submit your first issue to track its status!";
                }
                
                let response = "Here's the status of your issues:\n";
                userIssues.forEach(issue => {
                    response += `• ${issue.title}: ${Utils.formatStatus(issue.status)}\n`;
                });
                return response;
            } else if (currentRole === 'officer') {
                const officerIssues = DataManager.getIssuesByOfficer(currentUser.email);
                if (officerIssues.length === 0) {
                    return "You don't have any assigned issues at the moment.";
                }
                
                let response = "Here are your assigned issues:\n";
                officerIssues.forEach(issue => {
                    response += `• ${issue.title}: ${Utils.formatStatus(issue.status)}\n`;
                });
                return response;
            }
        }
        
        // Submission help
        if (lowerMessage.includes('submit') || lowerMessage.includes('new issue')) {
            return "To submit a new issue:\n1. Go to the 'Submit Issue' tab\n2. Fill in the title and description\n3. Select urgency level (High/Medium/Low)\n4. Choose location on the map or enter manually\n5. Upload photos if available\n6. Click 'Submit Issue'";
        }
        
        // Escalation help
        if (lowerMessage.includes('escalation') || lowerMessage.includes('escalate')) {
            return "Issues follow this escalation path:\n1. Block Level - Local authority handling\n2. District Level - District authorities\n3. State Level - State intervention\n4. Court Level - Legal resolution\n\nIssues automatically escalate based on severity and response time.";
        }
        
        // General help
        if (lowerMessage.includes('help') || lowerMessage.includes('guidance')) {
            let response = "I can help you with:\n";
            if (currentRole === 'user') {
                response += "• Checking issue status\n• Submitting new issues\n• Understanding the process\n• General guidance";
            } else if (currentRole === 'admin') {
                response += "• Managing all issues\n• Approving access requests\n• Assigning issues to officers\n• System overview";
            } else if (currentRole === 'officer') {
                response += "• Viewing assigned issues\n• Updating issue status\n• Managing workload\n• Issue details";
            }
            response += "\n\nWhat would you like to know?";
            return response;
        }
        
        // Default response
        return "I understand you're asking about: '" + message + "'. Could you be more specific? I can help with issue status, submissions, or general guidance about the civic reporting system.";
    },

    // Initialize chatbot for specific role
    initializeForRole(role) {
        const messages = document.getElementById('chatbotMessages');
        if (!messages) return;
        
        let welcomeMessage = "Hello! I'm CivicBot, your AI assistant for the civic issue reporting system. ";
        let capabilities = [];
        
        switch (role) {
            case 'user':
                capabilities = [
                    "Submit new civic issues with photos and location",
                    "Check status of your submitted issues",
                    "Get guidance on issue categories and departments",
                    "Understand the escalation process",
                    "Learn about the reporting system"
                ];
                break;
            case 'admin':
                capabilities = [
                    "Manage all civic issues across the system",
                    "Approve or reject officer access requests",
                    "Assign issues to appropriate officers",
                    "View system statistics and analytics",
                    "Monitor issue resolution progress"
                ];
                break;
            case 'officer':
                capabilities = [
                    "View and manage assigned issues",
                    "Update issue status and progress",
                    "Track your workload and performance",
                    "Access issue details and photos",
                    "Communicate with citizens about issues"
                ];
                break;
        }
        
        const capabilitiesList = capabilities.map(cap => `• ${cap}`).join('\n');
        
        messages.innerHTML = `
            <div class="chatbot-message bot">
                <strong>CivicBot:</strong> ${welcomeMessage}
                <br><br>
                <strong>I can help you with:</strong><br>
                ${capabilitiesList}
                <br><br>
                <em>Click any question below or type your own question!</em>
            </div>
        `;
        
        // Show predefined questions
        this.showPredefinedQuestions();
        
        // Update status indicator
        this.updateStatus('online');
    },

    // Show predefined questions
    showPredefinedQuestions() {
        const messages = document.getElementById('chatbotMessages');
        if (!messages) return;
        
        // Remove existing questions if any
        const existingQuestions = document.getElementById('predefinedQuestions');
        if (existingQuestions) {
            existingQuestions.remove();
        }
        
        // Group questions by category
        const groupedQuestions = this.predefinedQuestions.reduce((acc, question) => {
            if (!acc[question.category]) {
                acc[question.category] = [];
            }
            acc[question.category].push(question);
            return acc;
        }, {});
        
        // Create questions container
        const questionsContainer = document.createElement('div');
        questionsContainer.id = 'predefinedQuestions';
        questionsContainer.className = 'predefined-questions';
        
        let questionsHTML = '<div class="questions-header"><strong>💡 Quick Questions:</strong></div>';
        
        // Add questions by category
        Object.entries(groupedQuestions).forEach(([category, questions]) => {
            questionsHTML += `<div class="question-category">
                <div class="category-title">${category}</div>
                <div class="questions-grid">`;
            
            questions.forEach(question => {
                questionsHTML += `
                    <button class="question-btn" onclick="ChatbotModule.handlePredefinedQuestion('${question.id}')">
                        <i class="${question.icon}"></i>
                        <span>${question.question}</span>
                    </button>
                `;
            });
            
            questionsHTML += '</div></div>';
        });
        
        questionsContainer.innerHTML = questionsHTML;
        messages.appendChild(questionsContainer);
        messages.scrollTop = messages.scrollHeight;
    },

    // Handle predefined question click
    handlePredefinedQuestion(questionId) {
        const question = this.predefinedQuestions.find(q => q.id === questionId);
        if (question) {
            // Add user message
            this.addMessage(question.question, 'user');
            
            // Get and add response
            const response = this.getPredefinedResponse(question.question);
            this.addMessage(response, 'bot');
            
            // Show questions again after a delay
            setTimeout(() => {
                this.showPredefinedQuestions();
            }, 1000);
        }
    },

    // Update chatbot status
    updateStatus(status) {
        const statusElement = document.getElementById('chatbotStatus');
        if (statusElement) {
            statusElement.className = `chatbot-status ${status}`;
            statusElement.querySelector('span').textContent = status === 'online' ? 'Online' : 'Offline';
        }
    },

    // Show typing indicator
    showTypingIndicator() {
        const messages = document.getElementById('chatbotMessages');
        if (!messages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-typing';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <span>CivicBot is typing</span>
            <div class="chatbot-typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        messages.appendChild(typingDiv);
        messages.scrollTop = messages.scrollHeight;
    },

    // Hide typing indicator
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    },

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
        const messages = document.getElementById('chatbotMessages');
        if (messages) {
            messages.innerHTML = '';
        }
    },

    // Get conversation history
    getHistory() {
        return this.conversationHistory;
    },

    // Set API key
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.isInitialized = true;
    },

    // Check if API is available
    isApiAvailable() {
        return Config.isApiKeyConfigured();
    }
};

// Make ChatbotModule globally available
window.ChatbotModule = ChatbotModule;

// Chatbot Module with Gemini API Integration
const ChatbotModule = {
    apiKey: null,
    isInitialized: false,
    conversationHistory: [],

    // Initialize chatbot
    init() {
        this.setupEventListeners();
        this.loadApiKey();
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

    // Load API key from config
    loadApiKey() {
        this.apiKey = Config.getApiKey();
        
        if (!Config.isApiKeyConfigured()) {
            console.warn('Gemini API key not configured. Using fallback responses.');
        }
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

    // Get response from Gemini API or fallback
    async getResponse(message) {
        // Add to conversation history
        this.conversationHistory.push({ role: 'user', content: message });
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            let response;
            
            // Simulate thinking time
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
            
            if (this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
                response = await this.callGeminiAPI(message);
            } else {
                response = this.getFallbackResponse(message);
            }
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add bot response to conversation history
            this.conversationHistory.push({ role: 'assistant', content: response });
            
            // Add response to chat
            this.addMessage(response, 'bot');
            
        } catch (error) {
            console.error('Error getting chatbot response:', error);
            this.hideTypingIndicator();
            this.updateStatus('offline');
            
            const errorResponse = 'I apologize, but I\'m having trouble processing your request right now. Please try again later.';
            this.addMessage(errorResponse, 'bot');
            
            // Reset status after a delay
            setTimeout(() => this.updateStatus('online'), 5000);
        }
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
                <em>Just ask me anything! I'm here to make your civic reporting experience smooth and efficient.</em>
            </div>
        `;
        
        // Update status indicator
        this.updateStatus('online');
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

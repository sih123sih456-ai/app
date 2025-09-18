# Civic Issue Reporting System

A comprehensive front-end web prototype for a civic issue reporting system supporting User (Citizen) and Admin/Officer roles with a clean, minimal, responsive, and highly user-friendly UI.

## Features

### 🔐 Authentication System
- **Dual Role Login**: Toggle between Citizen and Admin/Officer roles
- **Citizen Registration**: Full registration with name, email, password, and phone
- **Admin Login**: Default credentials (admin@gmail.com / admin123)
- **Access Requests**: Admins can submit access requests with profile details

### 👥 User (Citizen) Dashboard
- **Issue Submission**: Submit issues with title, description, photo upload, location selection, and urgency levels
- **Interactive Map**: Click-to-select location with visual map integration
- **Photo Upload**: Drag-and-drop photo upload with preview functionality
- **Issue Tracking**: Track submitted issues with status updates (Pending/In Review/Resolved)
- **Escalation Paths**: Visual escalation levels (Block → District → State → Court)
- **Statistics Overview**: Dashboard with pending, in-review, and resolved issue counts

### 🛡️ Admin Dashboard
- **Issue Management**: View all submitted issues with filtering options
- **Access Request Approval**: Approve/reject officer access requests
- **Issue Assignment**: Assign issues to officers
- **Interactive Map**: View all issues on a map with urgency-colored markers
- **Statistics**: Comprehensive overview of all system metrics

### 👮 Officer Dashboard
- **Assigned Issues**: View only issues assigned to the officer
- **Status Updates**: Update issue status (In Progress/Resolved)
- **Interactive Map**: View assigned issues on map with clickable markers
- **Statistics**: Track assigned, in-progress, and resolved issues

### 🤖 Smart Chatbot
- **Issue Status Queries**: Ask about current issue status
- **Submission Guidance**: Get help with submitting new issues
- **General Support**: Receive guidance on civic reporting processes
- **Contextual Responses**: Intelligent responses based on user queries

### 🗺️ Map Integration
- **Location Selection**: Interactive map for precise location selection
- **Urgency Markers**: Color-coded markers (Red: High, Yellow: Medium, Green: Low)
- **Clickable Markers**: Click markers to view issue details
- **Responsive Maps**: Optimized for both desktop and mobile devices

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large buttons and touch-optimized interactions
- **Adaptive Layout**: Flexible grid system that adapts to screen size
- **Cross-Platform**: Works on desktop, tablet, and mobile devices

### 🔔 Notification System
- **Toast Notifications**: Real-time notifications for actions and updates
- **Success/Error/Warning**: Color-coded notification types
- **Auto-Dismiss**: Notifications automatically disappear after 5 seconds
- **Non-Intrusive**: Positioned to not interfere with user workflow

## Technical Features

### Frontend Technologies
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with Flexbox and Grid layouts
- **Vanilla JavaScript**: No framework dependencies for maximum compatibility
- **Leaflet Maps**: Open-source mapping library for interactive maps
- **Font Awesome**: Professional icon library

### Key Functionalities
- **Form Validation**: Client-side validation with user-friendly error messages
- **File Upload**: Image upload with preview and validation
- **Local Storage**: Persistent data storage (simulated backend)
- **Real-time Updates**: Auto-refresh data every 30 seconds
- **Modal Dialogs**: Issue details and confirmation dialogs
- **Filtering System**: Advanced filtering for issues and requests

## Getting Started

1. **Clone or Download** the project files
2. **Open** `index.html` in a modern web browser
3. **Test the System**:
   - Use Citizen role to register and submit issues
   - Use Admin role (admin@gmail.com / admin123) to manage issues
   - Test the chatbot for guidance
   - Try the interactive maps and photo uploads

## Usage Guide

### For Citizens
1. **Register/Login**: Create an account or login with existing credentials
2. **Submit Issues**: Use the "Submit Issue" tab to report civic problems
3. **Track Progress**: Monitor your issues in the "Track Issues" tab
4. **Get Help**: Use the chatbot for guidance and support

### For Admins
1. **Login**: Use admin@gmail.com / admin123
2. **Manage Issues**: View and assign issues in the "All Issues" tab
3. **Approve Requests**: Review access requests in the "Access Requests" tab
4. **Monitor Map**: View all issues geographically in the "Issue Map" tab

### For Officers
1. **Login**: Use approved officer credentials
2. **View Assignments**: Check assigned issues in the dashboard
3. **Update Status**: Mark issues as in-progress or resolved
4. **Map View**: See assigned issues on the interactive map

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
civic-issue-reporter/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # Documentation
```

## Features in Detail

### Issue Submission Process
1. **Title & Description**: Clear, descriptive issue reporting
2. **Urgency Selection**: High/Medium/Low priority levels
3. **Location Selection**: Manual input or interactive map selection
4. **Photo Evidence**: Upload multiple photos with preview
5. **Automatic Tracking**: Issues are automatically tracked with unique IDs

### Escalation System
- **Block Level**: Initial local authority handling
- **District Level**: Escalation to district authorities
- **State Level**: State-level intervention
- **Court Level**: Legal resolution pathway

### Map Features
- **Interactive Selection**: Click anywhere on map to select location
- **Marker System**: Visual representation of issue locations
- **Color Coding**: Urgency-based color scheme
- **Popup Details**: Click markers for issue information
- **Responsive Design**: Adapts to different screen sizes

### Chatbot Capabilities
- **Status Queries**: "What's the status of my issues?"
- **Submission Help**: "How do I submit a new issue?"
- **General Guidance**: "What can you help me with?"
- **Contextual Responses**: Intelligent responses based on user role and data

## Future Enhancements

- **Backend Integration**: Connect to real database and API
- **Real-time Notifications**: WebSocket integration for live updates
- **Advanced Filtering**: More sophisticated search and filter options
- **Report Generation**: PDF reports and analytics
- **Mobile App**: Native mobile application
- **Multi-language Support**: Internationalization
- **Advanced Mapping**: Heat maps and clustering
- **Email Notifications**: Automated email updates

## License

This project is open source and available under the MIT License.

## Support

For questions or support, please refer to the chatbot within the application or contact the development team.
"# civilapp" 
"# civilapp" 

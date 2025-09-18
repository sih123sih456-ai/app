# 🏛️ Civic Issue Reporting System

A comprehensive, responsive web application for reporting and managing civic issues with AI-powered assistance, GPS location extraction, and multi-role support.

## ✨ Features

### 🎯 Core Functionality
- **Multi-Role Support**: Citizen, Admin, and Officer dashboards
- **Issue Reporting**: Submit issues with photos, location, and urgency levels
- **GPS Integration**: Automatic location extraction from uploaded images
- **Department Assignment**: Smart categorization based on issue content
- **Real-time Tracking**: Track issue status and progress
- **Map Integration**: Visual issue mapping with Leaflet.js
- **AI Chatbot**: Gemini AI-powered assistance for all users

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Smooth touch interactions on mobile devices
- **Hamburger Menu**: Intuitive navigation with smooth animations
- **Adaptive Layout**: Content adjusts perfectly to any device

### 🤖 AI-Powered Features
- **Smart Chatbot**: Context-aware assistance using Gemini API
- **Auto-Department Detection**: AI determines appropriate department
- **OCR Text Extraction**: Extract text from uploaded images
- **Intelligent Responses**: Role-specific guidance and support

### 🗄️ Backend Architecture
- **Node.js + Express**: Robust server-side framework
- **MongoDB**: Scalable database with Mongoose ODM
- **JWT Authentication**: Secure token-based auth
- **RESTful API**: Well-structured API endpoints
- **File Upload**: Secure image handling with validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Modern web browser

### Frontend Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd civic-issue-reporting
   ```

2. **Open the application**
   - Simply open `index.html` in your browser
   - Or use a local server: `python -m http.server 8000`

3. **Configure Gemini API** (Optional)
   - Copy `js/config.js` and add your Gemini API key
   - Or use the fallback responses without API key

### Backend Setup
1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp config.example.env .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 🎨 UI/UX Features

### 🎭 Beautiful Design
- **Gradient Backgrounds**: Modern, eye-catching gradients
- **Smooth Animations**: Fluid transitions and hover effects
- **Card-Based Layout**: Clean, organized information display
- **Color-Coded Status**: Intuitive visual status indicators

### 📱 Mobile Optimization
- **Responsive Grid**: Adapts to any screen size
- **Touch Gestures**: Swipe and tap interactions
- **Mobile Overlay**: Smooth sidebar navigation
- **Optimized Images**: Fast loading on mobile networks

### 🌐 Multi-Language Support
- **English & Tamil**: Full translation support
- **RTL Ready**: Prepared for right-to-left languages
- **Dynamic Translation**: Real-time language switching

## 🔧 Technical Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox/Grid
- **JavaScript (ES6+)**: Modular, clean code
- **Leaflet.js**: Interactive maps
- **Font Awesome**: Beautiful icons

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **Multer**: File upload handling

### AI Integration
- **Google Gemini API**: Advanced AI responses
- **EXIF.js**: GPS data extraction
- **Tesseract.js**: OCR text recognition

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: ['user', 'admin', 'officer'],
  department: String,
  status: ['active', 'inactive', 'pending']
}
```

### Issues Collection
```javascript
{
  title: String,
  description: String,
  location: String,
  coordinates: { latitude: Number, longitude: Number },
  urgency: ['low', 'medium', 'high'],
  status: ['pending', 'in-review', 'in-progress', 'resolved'],
  department: String,
  submittedBy: ObjectId,
  assignedTo: ObjectId,
  photos: Array,
  statusHistory: Array
}
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication
- **Input Validation**: Server-side validation
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin security
- **Helmet.js**: Security headers

## 📈 Performance Optimizations

- **Image Compression**: Optimized file sizes
- **Lazy Loading**: Efficient resource loading
- **Caching**: Browser and server-side caching
- **Database Indexing**: Optimized queries
- **CDN Ready**: Static asset optimization

## 🧪 Testing

### Frontend Testing
- Open browser developer tools
- Test responsive design at different breakpoints
- Verify all interactive elements work
- Check mobile touch interactions

### Backend Testing
```bash
cd backend
npm test
```

## 🚀 Deployment

### Frontend Deployment
1. Upload files to any web server
2. Ensure HTTPS for production
3. Configure CORS for your domain

### Backend Deployment
1. Set up MongoDB database
2. Configure environment variables
3. Deploy to cloud platform (Heroku, AWS, etc.)
4. Set up SSL certificates

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token

### Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue by ID
- `PATCH /api/issues/:id/status` - Update issue status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/issues` - Get user's issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with city systems
- [ ] Machine learning for issue prediction
- [ ] Voice input support
- [ ] Offline functionality

---

**Built with ❤️ for better civic engagement and community service.**
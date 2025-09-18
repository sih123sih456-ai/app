# 🚀 Backend Setup Guide

This guide will help you set up the Node.js backend for the Civic Issue Reporting System.

## 📋 Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `.env` file with connection string

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp config.example.env .env
   ```

2. Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/civic-issues

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d

   # AI Configuration
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

### 4. Create Required Directories

```bash
mkdir uploads
mkdir logs
```

### 5. Start the Server

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

## 🔧 Configuration Details

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment mode | No | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `GEMINI_API_KEY` | Gemini AI API key | No | - |

### Database Configuration

The application uses MongoDB with the following collections:
- `users` - User accounts and profiles
- `issues` - Civic issues and reports
- `accessrequests` - Officer access requests

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

#### Issues
- `GET /api/issues` - Get all issues (with filtering)
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get specific issue
- `PATCH /api/issues/:id/status` - Update issue status
- `PATCH /api/issues/:id/assign` - Assign issue to officer

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/issues` - Get user's issues

#### Admin
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/requests` - Get access requests
- `POST /api/admin/requests/:id/approve` - Approve access request

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Manual Testing
1. Start the server
2. Use Postman or curl to test endpoints
3. Check MongoDB for data persistence

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Logs
- Application logs: `logs/app.log`
- Error logs: Console output
- Access logs: Morgan middleware

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure production MongoDB URI

2. **Security**
   - Enable HTTPS
   - Configure CORS properly
   - Set up rate limiting
   - Use environment variables for secrets

3. **Performance**
   - Enable compression
   - Set up caching
   - Configure database indexes
   - Use CDN for static files

4. **Monitoring**
   - Set up error tracking
   - Configure logging
   - Monitor database performance
   - Set up health checks

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloud Deployment

#### Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy with Git
4. Add MongoDB addon

#### AWS
1. Use Elastic Beanstalk
2. Configure RDS for MongoDB
3. Set up load balancer
4. Configure auto-scaling

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

#### MongoDB Connection Error
- Check if MongoDB is running
- Verify connection string
- Check network connectivity
- Verify authentication credentials

#### JWT Token Error
- Check JWT_SECRET is set
- Verify token format
- Check token expiration

#### File Upload Issues
- Check upload directory permissions
- Verify file size limits
- Check MIME type validation

### Debug Mode

```bash
DEBUG=* npm run dev
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)

## 🤝 Support

If you encounter issues:
1. Check the logs
2. Review this guide
3. Check GitHub issues
4. Create a new issue with details

---

**Happy coding! 🚀**

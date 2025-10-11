# Configuration Guide

## Environment Configuration

This application uses environment variables for configuration. All settings are centralized in the `.env` file.

### Required Environment Variables

```bash
# Backend API Configuration (REQUIRED)
NEXT_PUBLIC_API_BASE_URL=https://beopn.pemudanambangan.site/api/v1
NEXT_PUBLIC_BACKEND_URL=https://beopn.pemudanambangan.site

# Environment Mode
NODE_ENV=production

# API Configuration
NEXT_PUBLIC_USE_FALLBACK_DATA=false
NEXT_PUBLIC_API_TIMEOUT_DEFAULT=15000
NEXT_PUBLIC_API_TIMEOUT_FINANCE=30000
NEXT_PUBLIC_API_RETRY_ATTEMPTS=3
NEXT_PUBLIC_API_RETRY_DELAY=1000
NEXT_PUBLIC_CACHE_DURATION=300000
```

### Configuration Details

#### Backend Configuration
- **NEXT_PUBLIC_API_BASE_URL**: Main API endpoint for all data requests
- **NEXT_PUBLIC_BACKEND_URL**: Base URL for file uploads and media

#### Performance Settings
- **NEXT_PUBLIC_API_TIMEOUT_DEFAULT**: Standard request timeout (15 seconds)
- **NEXT_PUBLIC_API_TIMEOUT_FINANCE**: Extended timeout for financial data (30 seconds)
- **NEXT_PUBLIC_API_RETRY_ATTEMPTS**: Number of retry attempts on failure (3)
- **NEXT_PUBLIC_API_RETRY_DELAY**: Delay between retries in milliseconds (1 second)
- **NEXT_PUBLIC_CACHE_DURATION**: Data cache duration in milliseconds (5 minutes)

#### Fallback Configuration
- **NEXT_PUBLIC_USE_FALLBACK_DATA**: Enable mock data when API is unavailable

## Environment-Specific Configurations

### Development Environment
```bash
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_USE_FALLBACK_DATA=true
```

### Staging Environment
```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://staging-api.example.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://staging-api.example.com
NEXT_PUBLIC_USE_FALLBACK_DATA=false
```

### Production Environment
```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://api.example.com
NEXT_PUBLIC_USE_FALLBACK_DATA=false
```

## Backend API Requirements

### Expected API Endpoints

The application expects the following API endpoints to be available:

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

#### Members
- `GET /members` - List all members
- `GET /members/{id}` - Get member details
- `POST /members` - Create new member
- `PUT /members/{id}` - Update member
- `DELETE /members/{id}` - Delete member

#### Events
- `GET /events` - List events
- `GET /events/{id}` - Get event details
- `POST /events` - Create event
- `PUT /events/{id}` - Update event
- `DELETE /events/{id}` - Delete event

#### Attendance
- `GET /events/{id}/attendance` - Get event attendance
- `POST /events/{id}/attendance` - Mark attendance

#### Finance
- `GET /finance/reports` - Financial reports
- `GET /finance/transactions` - Transaction history

#### Files
- `POST /uploads` - File upload
- `GET /files/{id}` - Download file

### API Response Format

The backend should return responses in this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## CORS Configuration

The backend must allow CORS requests from your frontend domain:

```javascript
// Example CORS configuration
{
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

## Authentication Configuration

### Session Management
- The application uses session-based authentication
- Sessions are managed by the backend
- No JWT tokens are stored in localStorage

### Login Flow
1. User submits login form
2. Frontend sends credentials to `/auth/login`
3. Backend validates and creates session
4. Frontend redirects to dashboard

### Logout Flow
1. User clicks logout
2. Frontend calls `/auth/logout`
3. Backend destroys session
4. Frontend redirects to login

## File Upload Configuration

### Upload Settings
- Maximum file size: 10MB
- Allowed formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
- Upload endpoint: `/uploads`

### File Storage
Files should be stored securely on the backend with:
- Unique filenames to prevent conflicts
- Proper file type validation
- Size limits enforcement
- Virus scanning (recommended)

## Database Configuration

### Required Tables
The backend should have these main entities:
- `users` - User accounts
- `members` - Organization members
- `events` - Events and meetings
- `attendance` - Event attendance records
- `transactions` - Financial transactions
- `files` - File metadata

## Performance Recommendations

### Backend Performance
- Use database indexing on frequently queried fields
- Implement caching for static data
- Use pagination for large datasets
- Optimize database queries

### API Response Times
- Target response times under 500ms
- Financial endpoints may take up to 30 seconds
- Implement timeout handling for long operations

## Security Configuration

### API Security
- Use HTTPS in production
- Implement rate limiting
- Validate all input data
- Use parameterized queries to prevent SQL injection

### Frontend Security
- All API URLs use HTTPS
- No sensitive data stored in localStorage
- CSRF protection through same-origin policy

## Monitoring and Logging

### Recommended Monitoring
- API response times
- Error rates
- User activity
- System resource usage

### Logging
- Log all API requests
- Log authentication events
- Log errors with stack traces
- Implement log rotation

## Backup and Recovery

### Database Backups
- Daily automated backups
- Store backups in secure location
- Test backup restoration regularly

### File Backups
- Backup uploaded files separately
- Implement versioning for critical files

## Troubleshooting Configuration

### Common Configuration Issues

1. **API Connection Failed**
   - Check `NEXT_PUBLIC_API_BASE_URL` is correct
   - Verify backend server is running
   - Check CORS configuration

2. **File Upload Errors**
   - Verify upload endpoint URL
   - Check file size limits
   - Ensure proper file permissions

3. **Authentication Issues**
   - Check session configuration
   - Verify CORS allows credentials
   - Check cookie settings

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide more detailed error messages and logging.

---

**Important**: Always use HTTPS in production and keep your environment variables secure.

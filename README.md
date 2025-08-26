# Access Request Management Dashboard

A comprehensive full-stack web application for managing access requests with real-time analytics, interactive dashboards, and comprehensive reporting capabilities.

## 🌟 Features

### Dashboard Analytics
- **Real-time Metrics**: Total requests, pending requests, average processing time, approval rates
- **Interactive Charts**: Monthly trends, status distribution, request types breakdown
- **Department Performance**: Comparative analysis across departments
- **Processing Performance**: SLA tracking and approval rate trends

### Request Management
- **Comprehensive Tracking**: Full lifecycle management from submission to completion
- **Advanced Filtering**: By date range, department, system, status, and priority
- **Status Management**: Pending, Approved, Rejected, Cancelled workflows
- **Comments & History**: Full audit trail with stakeholder communication

### Reporting & Export
- **Data Export**: CSV and JSON formats with filtered data
- **Custom Date Ranges**: Flexible reporting periods
- **Performance Metrics**: SLA compliance and processing time analysis

### User Experience
- **Responsive Design**: Mobile-first approach with cross-device compatibility
- **Interactive UI**: Hover effects, smooth animations, and intuitive navigation
- **Real-time Updates**: Live data refresh and filtering
- **Accessibility**: WCAG compliant design patterns

## 🛠 Technology Stack

### Frontend
- **HTML5/CSS3**: Semantic markup with modern CSS Grid and Flexbox
- **Vanilla JavaScript**: ES6+ features with modular architecture
- **Chart.js**: Interactive and responsive data visualizations
- **Responsive Design**: Mobile-first CSS with breakpoints

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database with advanced features
- **RESTful API**: Standard HTTP methods with JSON responses

### Security & Performance
- **Helmet.js**: Security headers and protection
- **Rate Limiting**: API endpoint protection
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: Request sanitization and validation
- **Database Indexing**: Optimized query performance

## 📁 Project Structure

```
access-request-dashboard/
├── index.html                 # Main HTML file
├── css/
│   └── styles.css            # Main stylesheet
├── js/
│   ├── data.js              # Data management and filtering
│   ├── charts.js            # Chart.js configurations
│   └── main.js              # Application logic and event handlers
├── backend/
│   └── api.js               # Express.js API server
├── database/
│   ├── schema.sql           # PostgreSQL database schema
│   └── sample_data.sql      # Sample data for testing
├── package.json             # Node.js dependencies
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/access-request-dashboard.git
   cd access-request-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup PostgreSQL database**
   ```bash
   # Create database
   createdb access_request_db
   
   # Run schema migration
   psql -d access_request_db -f database/schema.sql
   
   # Insert sample data
   psql -d access_request_db -f database/sample_data.sql
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the application**
   ```bash
   # Start backend server
   npm run dev
   
   # Open frontend in browser
   # Navigate to index.html or serve via local server
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=access_request_db
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## 📊 Database Schema

### Core Tables
- **departments**: Organization departments and managers
- **systems**: IT systems requiring access management
- **users**: Application users with roles and permissions
- **access_requests**: Main request tracking with full lifecycle
- **request_comments**: Communication and audit trail
- **approval_workflows**: Multi-level approval processes

### Key Features
- **UUID Support**: Unique identifiers for security
- **Enum Types**: Constrained values for data integrity
- **Automatic Triggers**: Processing time calculation and timestamps
- **Materialized Views**: Optimized dashboard queries
- **Audit Logging**: Complete change history tracking

## 🔧 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Key Endpoints

#### Dashboard Metrics
```http
GET /api/dashboard/metrics
Query Parameters: startDate, endDate, department, system
```

#### Request Management
```http
GET    /api/requests              # List requests with pagination
POST   /api/requests              # Create new request
GET    /api/requests/:id          # Get request details
PATCH  /api/requests/:id/status   # Update request status
```

#### Analytics
```http
GET /api/dashboard/monthly-trend      # Monthly request trends
GET /api/dashboard/status-distribution # Status breakdown
GET /api/dashboard/department-performance # Department metrics
```

#### Data Export
```http
GET /api/export?format=csv&startDate=2023-01-01
```

### Response Format
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2023-07-15T10:30:00.000Z"
}
```

## 🎨 Frontend Architecture

### Modular JavaScript Structure
- **data.js**: Data management, filtering, and processing logic
- **charts.js**: Chart.js configuration and chart management
- **main.js**: Application controller and event handling

### CSS Architecture
- **Mobile-first responsive design**
- **CSS Grid and Flexbox layouts**
- **CSS custom properties for theming**
- **Component-based styling approach**

### Key Classes
- `DashboardApp`: Main application controller
- `DataManager`: Data filtering and processing
- `ChartManager`: Chart creation and updates

## 🔒 Security Features

### Backend Security
- **Helmet.js**: Security headers protection
- **Rate Limiting**: API abuse prevention
- **Input Validation**: SQL injection prevention
- **CORS Configuration**: Cross-origin request control

### Database Security
- **Parameterized Queries**: SQL injection prevention
- **Role-based Access**: User permission levels
- **Audit Logging**: Complete change tracking
- **Data Encryption**: Sensitive data protection

## 🚀 Deployment

### Production Setup

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Environment configuration**
   ```bash
   NODE_ENV=production
   DB_SSL=true
   ```

3. **Database migration**
   ```bash
   npm run migrate
   ```

4. **Start production server**
   ```bash
   npm start
   ```

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

```bash
docker build -t access-request-dashboard .
docker run -p 3000:3000 access-request-dashboard
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Coverage
- Unit tests for API endpoints
- Integration tests for database operations
- Frontend component testing
- End-to-end workflow testing

## 📈 Performance Optimization

### Database
- **Indexed Queries**: Optimized search performance
- **Materialized Views**: Pre-computed dashboard metrics
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Analyzed and optimized slow queries

### Frontend
- **Lazy Loading**: On-demand chart initialization
- **Debounced Filtering**: Reduced API calls
- **Caching Strategy**: Browser and application-level caching
- **Minification**: Compressed assets for production

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- **ESLint**: JavaScript linting and formatting
- **Prettier**: Code formatting consistency
- **JSDoc**: Function and class documentation
- **Conventional Commits**: Standardized commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Database Connection Error**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists and schema is applied

**Chart Not Displaying**
- Check browser console for JavaScript errors
- Verify Chart.js CDN is accessible
- Ensure data format matches chart requirements

**API 500 Errors**
- Check server logs for detailed error messages
- Verify database connection and query syntax
- Check request parameter validation

### Getting Help
- 📧 Email: support@yourcompany.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/access-request-dashboard/issues)
- 📖 Wiki: [Project Wiki](https://github.com/yourusername/access-request-dashboard/wiki)

## 🗺️ Roadmap

### Upcoming Features
- [ ] **Real-time Notifications**: WebSocket integration for live updates
- [ ] **Advanced Analytics**: Machine learning insights and predictions
- [ ] **Mobile App**: React Native companion application
- [ ] **SSO Integration**: SAML/OAuth authentication
- [ ] **Workflow Builder**: Visual workflow designer
- [ ] **Reporting Templates**: Pre-built report templates
- [ ] **API Versioning**: Backward compatibility support
- [ ] **Multi-tenant Support**: Organization separation

### Version History
- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Enhanced filtering and export capabilities
- **v1.2.0**: Performance optimizations and security updates

---

Built with ❤️ for efficient access request management
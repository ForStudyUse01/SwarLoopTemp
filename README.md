# SwarLoop - Mood-Aware Music Streaming Platform

SwarLoop is a production-quality full-stack application that provides mood-aware music streaming and wellbeing services. The platform uses AI to suggest songs that help users regulate emotions, reduce anxiety, and improve mental well-being.

## 🌟 Features

### Core Features
- **Mood-Based Music Recommendations**: AI-powered suggestions based on emotional state
- **Multi-Modal Mood Detection**: Self-reporting, text analysis, and voice analysis
- **Personalized Playlists**: Create, edit, and share custom playlists
- **Wellness Content**: Articles and guided meditations for mental health
- **Admin Dashboard**: Complete content management system
- **Real-time Analytics**: Track user engagement and mood patterns

### Technical Features
- **Secure Authentication**: JWT-based auth with refresh tokens
- **Scalable Architecture**: Microservices with containerized deployment
- **AI/ML Integration**: Python-based mood detection and recommendation engine
- **Real-time Updates**: WebSocket support for live features
- **Privacy-First**: GDPR/India privacy compliance with data minimization

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   ML Service    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Python)      │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   PostgreSQL    │    │   Redis          │
│   (Reverse      │    │   (Database)    │    │   (Cache)        │
│    Proxy)       │    │   Port: 5432    │    │   Port: 6379     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for ML service)
- PostgreSQL 15+ (if running locally)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/swarloop.git
   cd swarloop
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Initialize the database**
   ```bash
   # Run database migrations
   docker-compose exec backend npx prisma migrate dev
   
   # Seed the database with sample data
   docker-compose exec backend npm run seed
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs
   - ML Service: http://localhost:8000

### Demo Credentials
- **Admin**: admin@swarloop.com / admin123
- **User**: user@swarloop.com / user123

## 🛠️ Development Setup

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### ML Service Development
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Authentication and profile information
- **Music**: Track metadata and audio features
- **Playlists**: User-created music collections
- **MoodEvents**: Mood tracking and analysis
- **Recommendations**: AI-generated suggestions
- **Articles**: Wellness content
- **Meditations**: Guided audio sessions

## 🤖 AI/ML Features

### Mood Detection Pipeline
1. **Self-Reporting**: Primary mood input method
2. **Text Analysis**: NLP-based emotion detection from journal entries
3. **Voice Analysis**: Audio feature extraction for mood detection
4. **Ensemble Method**: Weighted combination of all signals

### Recommendation Engine
- **Content-Based**: Audio features and metadata similarity
- **Collaborative Filtering**: User behavior patterns
- **Hybrid Approach**: Combines multiple recommendation strategies
- **Explainability**: Provides reasoning for each recommendation

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Music Endpoints
- `GET /api/music` - Browse music library
- `GET /api/music/:id` - Get track details
- `POST /api/music` - Add new track (Admin)

### Recommendation Endpoints
- `POST /api/recommendations` - Get mood-based recommendations
- `GET /api/recommendations/history` - Recommendation history

### Admin Endpoints
- `GET /api/admin/metrics` - Platform analytics
- `GET /api/admin/users` - User management
- `POST /api/admin/users/:id/ban` - Ban/unban users

Full API documentation is available at `/api-docs` when running the application.

## 🧪 Testing

### Run All Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# ML service tests
cd ml-service && python -m pytest
```

### Test Coverage
- Backend: Unit tests, integration tests, API tests
- Frontend: Component tests, integration tests, E2E tests
- ML Service: Model tests, API tests, performance tests

## 🚀 Deployment

### Production Deployment

1. **Environment Variables**
   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@host:5432/swarloop
   REDIS_URL=redis://host:6379
   
   # JWT Secrets
   JWT_SECRET=your-production-secret
   JWT_REFRESH_SECRET=your-production-refresh-secret
   
   # AWS S3
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET=swarloop-assets
   ```

2. **Docker Production Build**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Database Migration**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend npm run seed
   ```

### Cloud Deployment Options

#### AWS Deployment
- **ECS**: Container orchestration
- **RDS**: Managed PostgreSQL
- **ElastiCache**: Managed Redis
- **S3**: File storage
- **CloudFront**: CDN

#### GCP Deployment
- **Cloud Run**: Serverless containers
- **Cloud SQL**: Managed PostgreSQL
- **Memorystore**: Managed Redis
- **Cloud Storage**: File storage

## 📈 Monitoring & Observability

### Metrics
- Request rates and latency
- Error rates and response codes
- Database performance
- ML model accuracy
- User engagement metrics

### Logging
- Structured JSON logging
- Centralized log aggregation
- Error tracking with Sentry
- Performance monitoring

### Health Checks
- Application health endpoints
- Database connectivity
- Redis connectivity
- ML service availability

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Rate limiting and account lockout

### Data Protection
- HTTPS everywhere
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Privacy Compliance
- GDPR compliance
- Data minimization
- User consent management
- Data export and deletion
- Privacy by design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Music therapy research and methodologies
- Open source AI/ML libraries
- Community contributors and testers
- Mental health professionals and advisors

## 📞 Support

- **Documentation**: [docs.swarloop.com](https://docs.swarloop.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/swarloop/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/swarloop/discussions)
- **Email**: support@swarloop.com

---

**SwarLoop** - Music that understands you. 🎵💙

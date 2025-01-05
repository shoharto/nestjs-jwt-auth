

# NestJS JWT Authentication API

A robust authentication system built with NestJS, featuring JWT authentication, email verification, and refresh tokens.

## Features

- JWT Authentication
- Email Verification
- Password Reset
- Refresh Tokens
- Swagger API Documentation
- TypeORM with PostgreSQL
- SendGrid Email Integration

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- SendGrid API Key

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd nestjs-jwt-auth
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file in the root directory with the following variables:
```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=nest_jwt_auth

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_sender@example.com

# App
APP_URL=http://localhost:3000
```

4. Run database migrations
```bash
npm run migration:run
```

5. Start the application
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users/profile` - Get user profile

## API Documentation

The API documentation is available through Swagger UI when running the application:
- Development: http://localhost:3000/api/docs



## Database Migrations

```bash
# Generate migration
npm run migration:generate src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## License


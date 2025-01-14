# NestJS JWT Authentication API

A robust authentication system built with NestJS, featuring JWT authentication, email verification, and refresh tokens.

## Features

- JWT Authentication
- Email Verification
- Password Reset
- Refresh Tokens
- Swagger API Documentation
- TypeORM with PostgreSQL
- Multiple Email Service Providers (SendGrid, Brevo)

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

# Email Configuration
EMAIL_PROVIDER=sendgrid  # or 'brevo'
SENDGRID_API_KEY=your_sendgrid_api_key
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_verified_sender@example.com
EMAIL_FROM_NAME=Your App Name
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
All endpoints are versioned and prefixed with `/api/v1/`:


### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/change-password` - Change password

### Users
- `GET /api/v1/users/profile` - Get user profile
- `GET /api/v1/users` - Get all users

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


# Node.js API Server with Bearer Authentication

A production-ready Node.js API server featuring bearer token authentication, SQLite storage, and comprehensive security measures.

## Features

- Express.js framework for robust route handling and middleware
- SQLite database with better-sqlite3 for fast, reliable storage
- Bearer token authentication with secure token generation and validation
- Request validation with express-validator
- Rate limiting to prevent abuse
- Security headers with Helmet.js
- Structured logging with Winston
- Environment configuration with dotenv
- Process management with PM2 for production environments

## Security Measures

- HTTPS ready (required in production)
- Secure token generation and storage
- Parameterized database queries 
- Token hashing with bcrypt
- Brute force protection via rate limiting
- Secure HTTP headers
- CORS configuration
- Request validation
- Centralized error handling

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm (v6+)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/power-process.git
cd power-process
```

2. Install dependencies
```
npm install
```

3. Create and configure your environment file
```
cp .env.example .env
```

4. Edit `.env` file with your specific configuration
   - Set `TOKEN_SECRET` to a secure random string in production
   - Configure other environment settings as needed

### Usage

#### Development Mode

```
npm run dev
```

#### Production Mode

```
npm start
```

### Token Management

#### Generate a Token

```
npm run generate-token -- --description "API access for Client X" --days 90
```

Options:
- `--description` - Purpose of the token
- `--days` - Number of days until expiration

#### Using Tokens in Requests

Add the token to your API requests using the Authorization header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## API Endpoints

### Authentication

- `GET /auth/tokens` - List all active tokens (requires authentication)
- `POST /auth/tokens/revoke/:id` - Revoke a token (requires authentication)
- `POST /auth/validate` - Validate the current token (requires authentication)

### API Resources

- `GET /api/protected` - Protected resource example (requires authentication)
- `GET /api/public` - Public resource example
- `GET /api/optional-auth` - Resource with optional authentication

### System

- `GET /system/health` - Health check (database status, uptime)
- `GET /system/info` - Detailed system information (requires authentication)

## Project Structure

```
project/
├── config/            # Configuration files
├── middleware/        # Express middleware
├── models/            # Database models
├── routes/            # API routes
├── services/          # Business logic
├── utils/             # Utility functions
├── scripts/           # Utility scripts
├── app.js             # Express application setup
├── server.js          # Server startup file
└── package.json       # Dependencies and scripts
```

## Development

### Running Tests

```
npm test
```

### Linting

```
npm run lint
```

## Deployment

For production deployment, it's recommended to:

1. Use PM2 for process management
```
npm install -g pm2
pm2 start server.js --name "api-server"
```

2. Use HTTPS in production (either via a reverse proxy like Nginx or directly)
3. Set up proper security measures (firewall, etc.)
4. Configure automated backups for the SQLite database
5. Set up monitoring and alerting

## License

This project is licensed under the MIT License - see the LICENSE file for details.
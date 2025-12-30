# Environment Variables Documentation

## Overview

This document describes all environment variables used in the CLSU NEXUS Queue Management System.

## Backend Environment Variables

### Required Variables

#### Server Configuration
```env
NODE_ENV=production          # Environment: production, development, test
PORT=3000                    # Server port (default: 3000)
```

#### Database Configuration
```env
DB_HOST=localhost            # PostgreSQL host
DB_PORT=5432                 # PostgreSQL port (default: 5432)
DB_NAME=clsu_nexus           # Database name
DB_USER=postgres             # Database user
DB_PASSWORD=your_password    # Database password
```

#### JWT Configuration
```env
JWT_SECRET=your_secret_key   # Secret key for JWT tokens (REQUIRED - use strong random string)
JWT_EXPIRE=7d                # Token expiration (default: 7d)
```

### Optional Variables

#### CORS Configuration
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
# Comma-separated list of allowed origins
```

#### Logging
```env
LOG_LEVEL=info               # Log level: error, warn, info, debug
```

#### Performance
```env
DB_POOL_MAX=20               # Maximum database connections (default: 20)
DB_POOL_IDLE_TIMEOUT=30000   # Idle timeout in ms (default: 30000)
```

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clsu_nexus
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
LOG_LEVEL=debug
```

### Production
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clsu_nexus_prod
DB_USER=clsu_nexus_user
DB_PASSWORD=strong_secure_password_here
JWT_SECRET=very_secure_random_string_min_32_characters
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
LOG_LEVEL=info
```

### Test
```env
NODE_ENV=test
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clsu_nexus_test
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=test-secret-key-for-jest
JWT_EXPIRE=7d
```

## Web Dashboard Environment Variables

### Next.js Configuration
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
# Public API URL (accessible from browser)
```

### Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Mobile App Environment Variables

### React Native Configuration
```env
API_BASE_URL=http://localhost:3000
# API base URL for mobile app
```

### Production
```env
API_BASE_URL=https://api.yourdomain.com
```

## Security Best Practices

### 1. Never Commit Secrets
- Add `.env` to `.gitignore`
- Use `.env.example` for documentation
- Never commit actual secrets to version control

### 2. Use Strong Secrets
- JWT_SECRET: Minimum 32 characters, random
- DB_PASSWORD: Strong password (12+ characters, mixed case, numbers, symbols)

### 3. Environment Separation
- Use different databases for dev/staging/production
- Use different JWT secrets for each environment
- Never use production secrets in development

### 4. Secret Management
- Consider using secret management services (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly
- Use environment-specific secrets

## Generating Secure Secrets

### JWT Secret
```bash
# Generate random 64-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Password
```bash
# Generate strong password
openssl rand -base64 32
```

## Environment File Template

Create `.env.example` in `backend/`:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clsu_nexus
DB_USER=postgres
DB_PASSWORD=

# JWT
JWT_SECRET=
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info
```

## Validation

The application should validate required environment variables on startup:

```javascript
const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  process.exit(1);
}
```

## Troubleshooting

### Issue: "Missing environment variable"
- Check `.env` file exists
- Verify variable names are correct
- Ensure no typos in variable names
- Check file is in correct location

### Issue: "Database connection failed"
- Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- Check database server is running
- Verify network connectivity
- Check firewall rules

### Issue: "JWT verification failed"
- Verify JWT_SECRET is set
- Ensure JWT_SECRET matches between services
- Check JWT_SECRET hasn't changed

---

**Last Updated**: December 2024  
**Version**: 1.0


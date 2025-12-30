# Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the CLSU NEXUS Queue Management System to a production environment.

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ / CentOS 7+ / Windows Server 2019+
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: 14.0 or higher
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: Minimum 20GB (50GB+ recommended)
- **CPU**: 2+ cores recommended

### Domain and SSL
- Domain name configured
- SSL certificate (Let's Encrypt recommended)
- DNS records configured

### Services
- PostgreSQL database server
- Nginx (for reverse proxy)
- PM2 or systemd (for process management)
- Git (for code deployment)

## Deployment Architecture

```
Internet
   ↓
[Domain/DNS]
   ↓
[Nginx Reverse Proxy] (Port 80/443)
   ↓
[Node.js Backend] (Port 3000)
   ↓
[PostgreSQL Database] (Port 5432)
```

## Step 1: Server Setup

### 1.1 Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 1.2 Install Node.js
```bash
# Using NodeSource repository (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.3 Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib -y

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib -y
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 1.4 Install Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.5 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## Step 2: Database Setup

### 2.1 Create Production Database
```bash
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE clsu_nexus_prod;
CREATE USER clsu_nexus_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE clsu_nexus_prod TO clsu_nexus_user;
\q
```

### 2.2 Run Migrations
```bash
cd /path/to/project/backend
psql -U clsu_nexus_user -d clsu_nexus_prod -f ../database/migrations/001_initial_schema.sql
psql -U clsu_nexus_user -d clsu_nexus_prod -f ../database/migrations/002_create_system_settings.sql
psql -U clsu_nexus_user -d clsu_nexus_prod -f ../database/migrations/003_add_queue_prefix_to_services.sql
psql -U clsu_nexus_user -d clsu_nexus_prod -f ../database/migrations/004_add_performance_indexes.sql
```

## Step 3: Application Deployment

### 3.1 Clone Repository
```bash
cd /var/www
sudo git clone <your-repository-url> clsu-nexus
sudo chown -R $USER:$USER clsu-nexus
cd clsu-nexus
```

### 3.2 Install Dependencies
```bash
# Backend
cd backend
npm install --production

# Web Dashboard
cd ../web-dashboard
npm install
npm run build

# Mobile app (if building)
cd ../mobile
npm install
```

### 3.3 Configure Environment Variables

Create `.env` file in `backend/`:
```bash
cd backend
cp .env.example .env
nano .env
```

**Production `.env` configuration:**
```env
# Server
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clsu_nexus_prod
DB_USER=clsu_nexus_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# CORS (update with your domain)
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com

# Other settings
LOG_LEVEL=info
```

### 3.4 Start Application with PM2
```bash
cd backend
pm2 start server.js --name clsu-nexus-api
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

## Step 4: Nginx Configuration

### 4.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/clsu-nexus
```

**Configuration:**
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web Dashboard
server {
    listen 80;
    server_name admin.yourdomain.com;

    root /var/www/clsu-nexus/web-dashboard/out;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /_next/static {
        alias /var/www/clsu-nexus/web-dashboard/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/clsu-nexus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: SSL Certificate (Let's Encrypt)

### 5.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d api.yourdomain.com -d admin.yourdomain.com
```

### 5.3 Auto-renewal
Certbot automatically sets up auto-renewal. Verify:
```bash
sudo certbot renew --dry-run
```

## Step 6: Firewall Configuration

### 6.1 Configure UFW (Ubuntu)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 6.2 Configure Firewalld (CentOS)
```bash
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Step 7: Monitoring and Logging

### 7.1 PM2 Monitoring
```bash
pm2 monit
pm2 logs clsu-nexus-api
```

### 7.2 Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 7.3 Database Backup
Create backup script:
```bash
sudo nano /usr/local/bin/backup-database.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/clsu-nexus"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U clsu_nexus_user clsu_nexus_prod > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/backup-database.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-database.sh
```

## Step 8: Security Hardening

### 8.1 Database Security
- Change default PostgreSQL port (optional)
- Restrict database access to localhost
- Use strong passwords
- Regular security updates

### 8.2 Application Security
- Keep dependencies updated
- Use environment variables for secrets
- Enable HTTPS only
- Implement rate limiting
- Regular security audits

### 8.3 Server Security
- Disable root login
- Use SSH keys
- Keep system updated
- Install fail2ban
- Regular security patches

## Step 9: Post-Deployment Verification

### 9.1 Health Checks
```bash
# API Health
curl https://api.yourdomain.com/api/health

# Database connection
curl https://api.yourdomain.com/api/test
```

### 9.2 Functional Tests
- Test user registration
- Test queue request
- Test admin dashboard
- Test counter operations
- Test display board

### 9.3 Performance Tests
- Check response times
- Monitor resource usage
- Test under load
- Verify caching works

## Step 10: Maintenance

### 10.1 Regular Tasks
- **Daily**: Check logs, monitor performance
- **Weekly**: Review backups, check disk space
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Performance review, optimization

### 10.2 Updates and Deployments
```bash
# Pull latest code
cd /var/www/clsu-nexus
git pull origin main

# Update dependencies
cd backend && npm install --production
cd ../web-dashboard && npm install && npm run build

# Restart application
pm2 restart clsu-nexus-api

# Run migrations if needed
psql -U clsu_nexus_user -d clsu_nexus_prod -f database/migrations/XXX_new_migration.sql
```

## Troubleshooting

### Common Issues

**Issue**: Application won't start
- Check PM2 logs: `pm2 logs clsu-nexus-api`
- Verify environment variables
- Check database connection
- Verify port availability

**Issue**: 502 Bad Gateway
- Check if Node.js app is running: `pm2 status`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify proxy configuration

**Issue**: Database connection errors
- Verify database is running: `sudo systemctl status postgresql`
- Check database credentials
- Verify firewall rules
- Check database logs

**Issue**: SSL certificate issues
- Verify domain DNS points to server
- Check certificate expiration: `sudo certbot certificates`
- Renew if needed: `sudo certbot renew`

## Rollback Procedure

If deployment fails:

1. **Stop new version**:
   ```bash
   pm2 stop clsu-nexus-api
   ```

2. **Restore previous version**:
   ```bash
   cd /var/www/clsu-nexus
   git checkout <previous-commit-hash>
   ```

3. **Restart**:
   ```bash
   pm2 restart clsu-nexus-api
   ```

4. **Restore database** (if needed):
   ```bash
   psql -U clsu_nexus_user -d clsu_nexus_prod < backup.sql
   ```

## Production Checklist

- [ ] Server setup complete
- [ ] Database created and migrated
- [ ] Application deployed
- [ ] Environment variables configured
- [ ] PM2 process manager configured
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Monitoring set up
- [ ] Backup system configured
- [ ] Security hardening applied
- [ ] Health checks passing
- [ ] Functional tests passing
- [ ] Performance verified
- [ ] Documentation updated

## Support and Maintenance

### Monitoring Tools
- PM2 monitoring dashboard
- Nginx access/error logs
- PostgreSQL logs
- System resource monitoring

### Contact Information
- **System Administrator**: _________________________
- **Database Administrator**: _________________________
- **Support Email**: _________________________

---

**Last Updated**: December 2024  
**Version**: 1.0


# Production Deployment Checklist

Use this checklist to ensure a smooth and secure production deployment.

## Pre-Deployment

### Server Setup
- [ ] Server provisioned with required specifications
- [ ] Operating system updated
- [ ] Node.js installed (v18+)
- [ ] PostgreSQL installed (v14+)
- [ ] Nginx installed and configured
- [ ] PM2 installed globally
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] SSH access configured securely

### Domain and SSL
- [ ] Domain name registered and configured
- [ ] DNS records pointing to server
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] SSL certificate auto-renewal configured
- [ ] HTTPS redirect configured

### Database
- [ ] Production database created
- [ ] Database user created with appropriate permissions
- [ ] Strong database password set
- [ ] Database backups configured
- [ ] Backup restoration tested

### Security
- [ ] Strong JWT secret generated (32+ characters)
- [ ] Strong database password set
- [ ] SSH key authentication configured
- [ ] Root login disabled (if applicable)
- [ ] Fail2ban installed and configured
- [ ] Security updates applied

## Deployment

### Code Deployment
- [ ] Repository cloned to server
- [ ] Latest code pulled from main branch
- [ ] Dependencies installed (production mode)
- [ ] Web dashboard built for production
- [ ] Environment variables configured
- [ ] `.env` file secured (not in git)

### Database Setup
- [ ] All migrations run successfully
- [ ] Performance indexes created
- [ ] Database connection tested
- [ ] Sample data loaded (if needed)

### Application Configuration
- [ ] PM2 process manager configured
- [ ] Application started with PM2
- [ ] PM2 auto-start configured
- [ ] Log rotation configured
- [ ] Health check endpoint working

### Nginx Configuration
- [ ] Reverse proxy configured
- [ ] SSL certificate installed
- [ ] HTTP to HTTPS redirect working
- [ ] Static files served correctly
- [ ] Nginx configuration tested
- [ ] Nginx reloaded successfully

## Post-Deployment

### Verification
- [ ] API health check passing
- [ ] Database connection working
- [ ] User registration working
- [ ] User login working
- [ ] Queue request working
- [ ] Admin dashboard accessible
- [ ] Counter dashboard working
- [ ] Display board working
- [ ] WebSocket connections working

### Performance
- [ ] Response times acceptable (<200ms average)
- [ ] Database queries optimized
- [ ] Caching working correctly
- [ ] No memory leaks detected
- [ ] CPU usage normal
- [ ] Load testing completed

### Security
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation working
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] Security headers configured

### Monitoring
- [ ] PM2 monitoring set up
- [ ] Log aggregation configured
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Alerting configured
- [ ] Dashboard accessible

### Backup and Recovery
- [ ] Database backup script created
- [ ] Backup automation configured (cron)
- [ ] Backup restoration tested
- [ ] Backup storage verified
- [ ] Recovery procedure documented

## Documentation

- [ ] Deployment guide reviewed
- [ ] Environment variables documented
- [ ] API documentation updated
- [ ] User guide available
- [ ] Admin guide available
- [ ] Troubleshooting guide available
- [ ] Contact information documented

## Training

- [ ] Admin users trained
- [ ] Counter staff trained
- [ ] Support team trained
- [ ] Documentation shared

## Go-Live

### Final Checks
- [ ] All checklist items completed
- [ ] Stakeholder approval obtained
- [ ] Rollback plan ready
- [ ] Support team on standby
- [ ] Monitoring active

### Launch
- [ ] DNS switched to production
- [ ] Application accessible
- [ ] All services operational
- [ ] Initial monitoring review
- [ ] User notifications sent

### Post-Launch
- [ ] Monitor for first 24 hours
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Gather initial user feedback
- [ ] Address any critical issues

## Maintenance Schedule

### Daily
- [ ] Check application logs
- [ ] Monitor error rates
- [ ] Check system resources
- [ ] Review backup status

### Weekly
- [ ] Review performance metrics
- [ ] Check disk space
- [ ] Review security logs
- [ ] Test backup restoration

### Monthly
- [ ] Update dependencies
- [ ] Security patches
- [ ] Performance review
- [ ] Capacity planning

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation review
- [ ] Disaster recovery test

## Emergency Contacts

**System Administrator**: _________________________  
**Database Administrator**: _________________________  
**DevOps Team**: _________________________  
**Support Email**: _________________________  
**Emergency Hotline**: _________________________

## Rollback Procedure

If critical issues occur:

1. **Immediate Actions**:
   - [ ] Identify issue severity
   - [ ] Notify stakeholders
   - [ ] Assess rollback necessity

2. **Rollback Steps**:
   - [ ] Stop current version: `pm2 stop clsu-nexus-api`
   - [ ] Restore previous version from backup
   - [ ] Restore database if needed
   - [ ] Restart application
   - [ ] Verify functionality

3. **Post-Rollback**:
   - [ ] Document issue
   - [ ] Fix in development
   - [ ] Test fix thoroughly
   - [ ] Plan re-deployment

---

**Checklist Version**: 1.0  
**Last Updated**: December 2024


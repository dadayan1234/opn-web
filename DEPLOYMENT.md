# OPN Web - Deployment Guide

## Production Deployment

### Option 1: Vercel (Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/opn-web.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit https://vercel.com
   - Connect GitHub repository
   - Configure environment variables
   - Deploy automatically

3. **Environment Variables di Vercel**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.com/api/v1
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.com
   NODE_ENV=production
   ```

### Option 2: Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Environment Variables**: Same as Vercel

### Option 3: VPS/Traditional Server

1. **Server Setup**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Upload files to server
   scp -r opn-web-main/ user@server:/var/www/
   
   # On server
   cd /var/www/opn-web-main
   npm install --production
   npm run build
   
   # Start with PM2
   pm2 start npm --name "opn-web" -- start
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration** (Optional)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
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
   ```

## Environment Configuration per Environment

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_USE_FALLBACK_DATA=false
```

### Staging
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://staging-api.example.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://staging-api.example.com
NEXT_PUBLIC_USE_FALLBACK_DATA=false
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://api.example.com
NEXT_PUBLIC_USE_FALLBACK_DATA=false
NEXT_PUBLIC_API_TIMEOUT_DEFAULT=15000
NEXT_PUBLIC_API_TIMEOUT_FINANCE=30000
NEXT_PUBLIC_API_RETRY_ATTEMPTS=3
NEXT_PUBLIC_API_RETRY_DELAY=1000
NEXT_PUBLIC_CACHE_DURATION=300000
```

## Domain & SSL Setup

### With Cloudflare (Recommended)
1. Point domain to deployment (Vercel/Netlify)
2. Enable SSL/TLS encryption
3. Configure caching rules

### Manual SSL (for VPS)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring & Maintenance

### Health Check Endpoint
The app includes `/api/v1/health` endpoint for monitoring.

### Log Monitoring
```bash
# PM2 logs
pm2 logs opn-web

# System logs
tail -f /var/log/nginx/access.log
```

### Performance Monitoring
- Use Vercel Analytics (if using Vercel)
- Google PageSpeed Insights
- GTmetrix for performance testing

## Backup Strategy

### Database Backup (Backend)
Ensure your backend has proper backup procedures.

### Application Backup
```bash
# Backup application files
tar -czf opn-web-backup-$(date +%Y%m%d).tar.gz /var/www/opn-web-main

# Backup to cloud storage (optional)
aws s3 cp opn-web-backup-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` to version control
2. **HTTPS**: Always use SSL in production
3. **API Security**: Ensure backend has proper authentication
4. **CORS**: Configure proper CORS settings on backend
5. **Rate Limiting**: Implement rate limiting on API endpoints

## Troubleshooting Production Issues

### Common Issues

1. **Build Fails**
   ```bash
   # Check Node.js version
   node --version  # Should be 18+
   
   # Clear cache
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **API Connection Issues**
   - Verify environment variables
   - Check network connectivity
   - Validate SSL certificates
   - Check CORS configuration

3. **Performance Issues**
   - Enable caching
   - Optimize images
   - Use CDN for static assets
   - Monitor API response times

### Rollback Procedure
```bash
# With PM2
pm2 stop opn-web
# Restore previous version
pm2 start opn-web

# With Vercel/Netlify
# Use their dashboard to rollback to previous deployment
```

---

**Important**: Always test deployment in staging environment before production!

# TourVoyage Deployment Guide

## Railway Deployment

### Prerequisites
- Railway account (https://railway.app)
- Railway CLI installed: `npm install -g @railway/cli`
- Git repository with the project

### Quick Deployment

1. **Clone and Setup**
   ```bash
   git clone <your-repository-url>
   cd tour-voyage-main
   npm install
   ```

2. **Deploy using Railway CLI**
   ```bash
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   
   # Add PostgreSQL database
   railway add postgresql
   
   # Deploy
   railway up
   ```

3. **Environment Variables**
   Set these in Railway dashboard or CLI:
   ```
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key_here
   FRONTEND_URL=https://your-app-name.railway.app
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

4. **Initialize Database**
   ```bash
   # Run database initialization
   railway run npm run init-db
   ```

### Manual Deployment Steps

1. **Create Railway Project**
   - Go to Railway dashboard
   - Click "New Project"
   - Connect your Git repository

2. **Add PostgreSQL**
   - In project settings, click "New Service"
   - Select "PostgreSQL"
   - Note the DATABASE_URL from service settings

3. **Set Environment Variables**
   - Go to project settings → Variables
   - Add the following:
     - `NODE_ENV=production`
     - `JWT_SECRET` (generate a random string)
     - `FRONTEND_URL=https://your-app-name.railway.app`

4. **Configure Build and Start Commands**
   Railway automatically detects Node.js and uses `package.json` scripts.

5. **Deploy**
   - Click "Deploy" button or push to your repository

### Environment Variables Explained

- `NODE_ENV`: Set to `production` for production environment
- `JWT_SECRET`: Secret key for JWT token signing (use a long random string)
- `FRONTEND_URL`: Your deployed frontend URL
- `DATABASE_URL`: PostgreSQL connection string (provided by Railway)
- `PORT`: Railway automatically sets this (default: 3000)

### Database Setup

After deployment, initialize the database:

1. **Access Railway Console**
   ```bash
   railway open console
   ```

2. **Run Database Initialization**
   ```bash
   npm run init-db
   ```

This will create all necessary tables and insert sample data.

### Admin Access

After deployment:
1. Visit `https://your-app-name.railway.app/admin-login.html`
2. Login with:
   - Email: `admin@tourvoyage.com`
   - Password: `admin123`

### Troubleshooting

#### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL environment variable
   - Ensure PostgreSQL service is running

2. **JWT Token Error**
   - Verify JWT_SECRET is set and long enough
   - Check token expiration settings

3. **CORS Error**
   - Ensure FRONTEND_URL matches your deployed URL
   - Check CORS configuration in `server.js`

4. **Build Failure**
   - Check `package.json` dependencies
   - Verify Node.js version compatibility

#### Logs and Monitoring

- View logs: `railway logs`
- Monitor performance in Railway dashboard
- Check build status in deployment tab

### Custom Domain (Optional)

1. **In Railway Dashboard:**
   - Go to Settings → Custom Domains
   - Add your domain name

2. **DNS Configuration:**
   - Add CNAME record pointing to `railway.app`

### Backup and Recovery

- **Database Backups**: Railway automatically backs up PostgreSQL
- **Manual Export**: Use `pg_dump` via Railway console
- **Restore**: Use `psql` to restore from backup

### Scaling

- **Automatic Scaling**: Railway automatically scales based on traffic
- **Database Scaling**: Upgrade PostgreSQL plan in service settings

### Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS**: Railway provides automatic SSL certificates
3. **Database**: Use strong passwords and connection strings
4. **JWT**: Use long, random secrets and appropriate expiration

### Performance Optimization

1. **Frontend**: Enable gzip compression
2. **Database**: Add indexes for frequently queried columns
3. **Caching**: Implement Redis for session storage
4. **CDN**: Use Railway's built-in CDN for static assets

### Monitoring and Analytics

- Railway provides built-in monitoring
- Consider adding:
  - Error tracking (Sentry)
  - Performance monitoring (New Relic)
  - Custom analytics

### Support

- Railway documentation: https://docs.railway.app
- Node.js best practices: https://nodejs.org/en/docs/
- PostgreSQL documentation: https://www.postgresql.org/docs/

# TourVoyage 2.0 - Full Deployment Guide

## 🚀 Railway Deployment (Updated)

### Prerequisites
- Railway account (https://railway.app)
- Railway CLI installed: `npm install -g @railway/cli`
- Git repository with the project
- External services accounts (Cloudinary, Gmail, Payme/Click)

### 📋 External Services Setup

#### 1. Cloudinary Setup
1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Get credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret
4. Configure upload presets for images

#### 2. Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail
2. Go to Google Account → Security → App passwords
3. Generate new app password
4. Save the password securely

#### 3. Payment Setup (Optional)
**For Payme:**
1. Register at [Payme.uz](https://payme.uz)
2. Create merchant account
3. Get Merchant ID and API Key
4. Set callback URL: `https://your-app.railway.app/api/payments/payme/callback`

**For Click:**
1. Register at [Click.uz](https://click.uz)
2. Create merchant account
3. Get Service ID, User ID, Secret Key
4. Set callback URL: `https://your-app.railway.app/api/payments/click/callback`

### 🚀 Quick Deployment

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

3. **Set Environment Variables**
   ```bash
   # Basic settings
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=$(openssl rand -base64 32)
   railway variables set FRONTEND_URL=https://$(railway domain).railway.app
   
   # Cloudinary
   railway variables set CLOUDINARY_CLOUD_NAME=your_cloud_name
   railway variables set CLOUDINARY_API_KEY=your_api_key
   railway variables set CLOUDINARY_API_SECRET=your_api_secret
   
   # Email
   railway variables set EMAIL_HOST=smtp.gmail.com
   railway variables set EMAIL_PORT=587
   railway variables set EMAIL_USER=your_email@gmail.com
   railway variables set EMAIL_PASS=your_app_password
   railway variables set EMAIL_FROM=noreply@tourvoyage.com
   
   # Payment (optional)
   railway variables set PAYME_MERCHANT_ID=your_payme_id
   railway variables set PAYME_KEY=your_payme_key
   railway variables set CLICK_MERCHANT_ID=your_click_id
   railway variables set CLICK_SERVICE_ID=your_click_service_id
   railway variables set CLICK_USER_ID=your_click_user_id
   railway variables set CLICK_SECRET_KEY=your_click_secret
   ```

4. **Initialize Database**
   ```bash
   # Run database initialization
   railway run npm run init-db
   ```

### 🔧 Manual Deployment Steps

1. **Create Railway Project**
   - Go to Railway dashboard
   - Click "New Project"
   - Connect your Git repository

2. **Add Services**
   - Click "New Service"
   - Select "PostgreSQL"
   - Note the DATABASE_URL from service settings

3. **Configure Environment Variables**
   Go to project settings → Variables and add all required variables

4. **Configure Build Settings**
   Railway automatically detects Node.js and uses package.json scripts

5. **Deploy**
   Click "Deploy" button or push to your repository

### 📊 Environment Variables Explained

#### Required Variables
```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-app.railway.app
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your_long_random_secret_key
```

#### Optional Variables
```
# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@tourvoyage.com

# Payment (Payme/Click)
PAYME_MERCHANT_ID=your_merchant_id
PAYME_KEY=your_payme_key
CLICK_MERCHANT_ID=your_merchant_id
CLICK_SERVICE_ID=your_service_id
CLICK_USER_ID=your_user_id
CLICK_SECRET_KEY=your_secret_key
```

### 🗄️ Database Setup

After deployment, initialize the database:

1. **Access Railway Console**
   ```bash
   railway open console
   ```

2. **Run Database Initialization**
   ```bash
   npm run init-db
   ```

This will create all necessary tables including:
- users
- tours
- bookings
- messages
- chat_messages
- notifications
- payments (NEW!)

### 🔐 Admin Access

After deployment:
1. Visit `https://your-app.railway.app/admin-login.html`
2. Login with:
   - Email: `admin@tourvoyage.com`
   - Password: `admin123`

### 🧪 Testing Deployment

1. **Basic Functionality**
   - User registration and login
   - Tour browsing and booking
   - Admin panel access

2. **New Features**
   - Image upload (admin panel)
   - Payment flow (if configured)
   - Email notifications
   - Joi validation errors

3. **API Testing**
   ```bash
   # Health check
   curl https://your-app.railway.app/api/health
   
   # Get tours
   curl https://your-app.railway.app/api/tours
   ```

### 🔍 Troubleshooting

#### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL environment variable
   - Ensure PostgreSQL service is running
   - Verify database name and credentials

2. **Email Not Sending**
   - Check EMAIL_USER and EMAIL_PASS
   - Ensure Gmail app password is correct
   - Verify 2-factor authentication is enabled

3. **Image Upload Failed**
   - Check Cloudinary credentials
   - Verify CLOUDINARY_CLOUD_NAME is correct
   - Check file size and format restrictions

4. **Payment Callback Issues**
   - Verify callback URLs are correct
   - Check Payme/Click merchant settings
   - Ensure payment credentials are valid

5. **Validation Errors**
   - Check Joi validation schemas
   - Verify input formats match requirements
   - Review error messages for details

6. **Build Failure**
   - Check package.json dependencies
   - Verify Node.js version compatibility
   - Review build logs in Railway dashboard

#### Logs and Monitoring

- **View logs**: `railway logs`
- **Monitor performance**: Railway dashboard
- **Check build status**: Deployment tab
- **Database logs**: PostgreSQL service logs

### 📈 Scaling and Performance

1. **Automatic Scaling**
   - Railway automatically scales based on traffic
   - Database scales independently

2. **Performance Optimization**
   - Cloudinary CDN for images
   - Database indexes for queries
   - Email queue for notifications

3. **Monitoring**
   - Railway built-in metrics
   - Custom health checks
   - Error tracking (consider Sentry)

### 🔒 Security Considerations

1. **Environment Variables**
   - Never commit secrets to Git
   - Use Railway's secure variable storage
   - Rotate secrets regularly

2. **Database Security**
   - Railway provides encrypted connections
   - Use strong passwords
   - Limit database access

3. **API Security**
   - JWT tokens with expiration
   - Rate limiting enabled
   - HTTPS automatically provided

4. **Payment Security**
   - Callback signature verification
   - Secure merchant credentials
   - HTTPS for all payment flows

### 🔄 CI/CD Pipeline

1. **Automatic Deployment**
   - Connect GitHub repository
   - Deploy on push to main branch
   - Use preview deployments for testing

2. **Testing Pipeline**
   ```yaml
   # Example GitHub Actions
   name: Deploy to Railway
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: railway-app/railway-action@v1
           with:
             api-token: ${{ secrets.RAILWAY_TOKEN }}
   ```

### 📊 Monitoring and Analytics

1. **Built-in Monitoring**
   - Railway dashboard metrics
   - Response time tracking
   - Error rate monitoring

2. **Custom Monitoring**
   - Add health check endpoints
   - Implement custom logging
   - Use external monitoring services

3. **Analytics**
   - User behavior tracking
   - Booking conversion rates
   - Payment success rates

### 💾 Backup and Recovery

1. **Database Backups**
   - Railway automatic backups
   - Manual backup options
   - Point-in-time recovery

2. **Data Export**
   ```bash
   # Export data
   pg_dump $DATABASE_URL > backup.sql
   
   # Import data
   psql $DATABASE_URL < backup.sql
   ```

3. **Asset Backup**
   - Cloudinary automatic backups
   - Git repository for code
   - Environment variables backup

### 🌍 Multi-Region Deployment

1. **Region Selection**
   - Choose nearest Railway region
   - Consider user location
   - Latency optimization

2. **CDN Configuration**
   - Cloudinary global CDN
   - Railway edge locations
   - Static asset optimization

### 📱 Mobile Optimization

1. **Responsive Design**
   - Bootstrap 5 mobile-first
   - Touch-friendly interfaces
   - Progressive Web App features

2. **Performance**
   - Image optimization
   - Lazy loading
   - Service worker caching

### 🔧 Advanced Configuration

1. **Custom Domains**
   - Add custom domain in Railway
   - Configure DNS records
   - SSL certificates automatic

2. **Webhooks**
   - Payment service webhooks
   - Email service webhooks
   - Custom event handling

3. **Third-party Integrations**
   - Google Analytics
   - Social media sharing
   - SMS notifications (optional)

### 📚 Documentation Updates

1. **API Documentation**
   - Update API endpoints
   - Document new features
   - Provide examples

2. **User Documentation**
   - Feature guides
   - Troubleshooting steps
   - FAQ section

3. **Developer Documentation**
   - Setup instructions
   - Architecture overview
   - Contribution guidelines

### 🎯 Success Metrics

1. **Technical Metrics**
   - 99.9% uptime
   - <2 second page load
   - 100% API success rate

2. **Business Metrics**
   - User registration rate
   - Booking conversion rate
   - Payment success rate

3. **User Satisfaction**
   - Email deliverability
   - Support response time
   - User feedback score

---

## 🆕 Version 2.0 Features

### ✅ Completed Features
- **Joi Validation**: Comprehensive input validation
- **Cloudinary Integration**: Image upload and management
- **Payment System**: Payme/Click integration
- **Email Notifications**: Automated email system
- **Enhanced Security**: Rate limiting, input sanitization
- **Performance Optimization**: CDN, caching, database indexes

### 🔧 Technical Improvements
- **Modular Architecture**: Better code organization
- **Error Handling**: Comprehensive error management
- **API Documentation**: Clear endpoint documentation
- **Testing**: Better test coverage
- **Monitoring**: Enhanced logging and metrics

### 📈 Business Impact
- **User Experience**: Smoother booking flow
- **Trust**: Professional email notifications
- **Convenience**: Multiple payment options
- **Scalability**: Cloud-based image storage
- **Security**: Robust validation and protection

TourVoyage 2.0 is now production-ready with enterprise-level features! 🚀

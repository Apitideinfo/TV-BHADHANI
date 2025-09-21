# TV App Backend - Render Deployment Guide

## Prerequisites
1. Push your code to GitHub, GitLab, or Bitbucket
2. Create a Render account at [render.com](https://render.com)
3. Set up a MySQL database (use external provider like PlanetScale, Railway, or AWS RDS)

## Deployment Steps

### 1. Create a Database
Since Render doesn't offer MySQL directly, use one of these options:
- **PlanetScale** (recommended for MySQL)
- **Railway** 
- **AWS RDS**
- **Google Cloud SQL**

### 2. Deploy to Render
1. Go to [render.com](https://render.com) and sign in
2. Click **New +** → **Web Service**
3. Connect your repository
4. Configure the service:
   - **Name**: `tvapp-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd tvapp-backend && npm install`
   - **Start Command**: `cd tvapp-backend && npm start`
   - **Instance Type**: Free or paid tier

### 3. Environment Variables
Add these in Render's Environment Variables section:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Set environment |
| `DB_HOST` | `your-db-host` | Database hostname |
| `DB_USER` | `your-db-user` | Database username |
| `DB_PASSWORD` | `your-db-password` | Database password |
| `DB_NAME` | `tv_database` | Database name |
| `JWT_SECRET` | `your-strong-secret` | JWT signing secret |
| `PORT` | `10000` | Port (auto-set by Render) |

### 4. Database Setup
1. Run the migration scripts from `db-setup/` folder on your database
2. Ensure your database allows connections from Render's IP ranges

### 5. Test Deployment
- Visit your Render URL (e.g., `https://tvapp-backend.onrender.com`)
- You should see: `{"status": "OK", "message": "TV App Backend is running"}`

## Security Notes
- ✅ `.env` files are excluded from git
- ✅ Production SSL configuration added
- ✅ Environment variables properly configured
- ✅ Rate limiting enabled
- ✅ Helmet security headers added

## Troubleshooting
- Check Render logs for connection issues
- Verify database credentials
- Ensure database accepts external connections
- Check that all environment variables are set

## Frontend Deployment
Don't forget to update your React Native app's API endpoints to point to your new Render URL!
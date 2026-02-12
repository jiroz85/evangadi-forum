# Evangadi Forum Deployment Guide

## Prerequisites
- GitHub account
- Vercel account
- Supabase account

## Step 1: Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and set project name: `evangadi-forum`
   - Set a strong database password
   - Choose region closest to your users

2. **Setup Database Schema**
   - Go to SQL Editor in your Supabase project
   - Copy and paste the contents of `supabase-setup.sql`
   - Run the SQL script

3. **Get Credentials**
   - Go to Settings > API
   - Copy:
     - Project URL
     - anon key
     - service_role_key

## Step 2: Backend Deployment

1. **Update Environment Variables**
   - Copy `backend/.env.supabase` to `backend/.env`
   - Fill in your Supabase credentials:
     ```
     SUPABASE_URL=https://your-project-id.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     JWT_SECRET=generate_a_random_secret_here
     ```

2. **Deploy to Vercel**
   - Push code to GitHub
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `backend`
   - Add environment variables in Vercel settings
   - Deploy

## Step 3: Frontend Deployment

1. **Update API URL**
   - In `frontend/.env.production`, set:
     ```
     REACT_APP_API_URL=https://your-backend-url.vercel.app
     ```

2. **Deploy to Vercel**
   - In Vercel dashboard, add another project
   - Set root directory to `frontend`
   - Add `REACT_APP_API_URL` environment variable
   - Deploy

## Step 4: Testing

1. **Test Registration**
   - Visit your frontend URL
   - Try to register a new user
   - Check Supabase Authentication > Users to see if user was created

2. **Test Login**
   - Login with your registered user
   - Verify JWT token is working

3. **Test Forum Features**
   - Create a question
   - Post an answer
   - Verify data appears in Supabase tables

## Environment Variables Summary

### Backend (Vercel)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key from Supabase
- `JWT_SECRET`: Random secret for JWT tokens
- `PORT`: 5000 (default)

### Frontend (Vercel)
- `REACT_APP_API_URL`: Your deployed backend URL

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure backend CORS allows your frontend URL
   - Check environment variables are correctly set

2. **Database Connection**
   - Verify Supabase URL and keys are correct
   - Check if database schema was properly created

3. **Authentication Issues**
   - Ensure Supabase Auth is enabled
   - Check email verification settings
   - Verify JWT secret matches between frontend and backend

4. **Build Errors**
   - Make sure all dependencies are installed
   - Check for syntax errors in server files
   - Verify environment variable names

## Production Considerations

1. **Security**
   - Never expose service role key on frontend
   - Use environment variables for all secrets
   - Enable Row Level Security (RLS) in Supabase

2. **Performance**
   - Monitor Supabase usage limits
   - Implement caching where appropriate
   - Use CDN for static assets

3. **Scaling**
   - Monitor Vercel function execution time
   - Consider Supabase Pro plan for higher limits
   - Implement proper error handling

## Next Steps

1. Set up custom domains
2. Configure SSL certificates
3. Set up monitoring and analytics
4. Implement proper logging
5. Add automated testing

# Deployment Guide for Furrchum Care Connect

This guide will walk you through deploying the Furrchum Care Connect application to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository with your code (GitHub, GitLab, or Bitbucket)

## Step 1: Push your code to a Git repository

Make sure your latest code is pushed to your Git repository.

## Step 2: Connect to Vercel

1. Log in to your Vercel account
2. Click "Add New..." > "Project"
3. Import your Git repository
4. Select the "furrchum-care-connect" repository

## Step 3: Configure project settings

Vercel will automatically detect that this is a Vite project. You can keep the default settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Step 4: Set up environment variables

Add the following environment variables in the Vercel dashboard:

```
VITE_SUPABASE_URL=https://lrcsczyxdjhrfycxnjxi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyY3Njenl4ZGpocmZ5Y3huanhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5OTIxNTgsImV4cCI6MjA2MzU2ODE1OH0.ED4Spv0D-JWpvY7Dxwv_WG-eSE6vYKazKZr9RHVF19E
VITE_WHEREBY_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmFwcGVhci5pbiIsImF1ZCI6Imh0dHBzOi8vYXBpLmFwcGVhci5pbi92MSIsImV4cCI6OTAwNzE5OTI1NDc0MDk5MSwiaWF0IjoxNzQ4MTEwMDA4LCJvcmdhbml6YXRpb25JZCI6MzE2MjE1LCJqdGkiOiIxODMyZTQ0OC01MDUzLTQ3ZTUtOTFlZC0wZDBmNmVjMDk0YWYifQ.gIewodxwfMmU9a9ol3kgB1StTRoPX4vk95FeO38V4HM
VITE_WHEREBY_API_URL=https://api.whereby.dev/v1
VITE_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

Replace `your-app-name.vercel.app` with your actual Vercel deployment URL once it's generated.

## Step 5: Deploy

Click the "Deploy" button to start the deployment process. Vercel will build and deploy your application.

## Step 6: Verify deployment

Once the deployment is complete:

1. Click on the generated URL to open your application
2. Test the key functionality:
   - User authentication
   - Pet management
   - Appointment booking
   - Video calls with Whereby integration
   - Prescription management

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs in the Vercel dashboard
2. Verify that all environment variables are correctly set
3. Ensure your code builds successfully locally with `npm run build`

## Continuous Deployment

Vercel automatically sets up continuous deployment. Any changes pushed to your main branch will trigger a new deployment.

## Custom Domain (Optional)

To add a custom domain to your Vercel deployment:

1. Go to your project settings in Vercel
2. Navigate to the "Domains" tab
3. Click "Add" and follow the instructions to add your domain

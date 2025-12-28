# Deployment Guide

This guide covers deploying VanshVriksh to production using Vercel.

## Prerequisites

- GitHub repository with the code pushed
- Vercel account (free tier is sufficient)
- PostgreSQL database (Vercel Postgres or Neon.tech)
- Cloudinary account configured

## CI/CD Pipeline

### GitHub Actions

The project includes automated CI checks that run on every push and pull request:

**Quality Checks (`.github/workflows/ci.yml`)**
- ✅ ESLint - Code quality and best practices
- ✅ Prettier - Code formatting consistency
- ✅ TypeScript - Type safety verification
- ✅ Build - Ensures the app builds successfully
- ✅ Dependency Review - Security checks on PRs

**Workflow Status**

View workflow runs at: `https://github.com/YOUR-USERNAME/vanshvriksh/actions`

### Adding Status Badge to README

Add this to your README.md:

```markdown
[![CI](https://github.com/YOUR-USERNAME/vanshvriksh/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR-USERNAME/vanshvriksh/actions/workflows/ci.yml)
```

Replace `YOUR-USERNAME` with your GitHub username.

## Deploying to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "chore: prepare for deployment"

# Add remote and push
git remote add origin https://github.com/YOUR-USERNAME/vanshvriksh.git
git branch -M main
git push -u origin main
```

### Step 2: Set Up Production Database

#### Option A: Vercel Postgres (Recommended)

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Storage** → **Create Database**
3. Select **Postgres**
4. Choose region close to your users
5. Create database
6. Copy the `DATABASE_URL` from the `.env.local` tab

#### Option B: Neon.tech

1. Log in to [Neon.tech](https://neon.tech/)
2. Create a new project
3. Copy the connection string
4. Use it as `DATABASE_URL`

### Step 3: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **Import Project**
3. Select your GitHub repository: `vanshvriksh`
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (auto-detected)

### Step 4: Configure Environment Variables

Add these environment variables in Vercel project settings:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**To add environment variables:**
1. Go to **Project Settings** → **Environment Variables**
2. Add each variable above
3. Select **Production**, **Preview**, and **Development** environments
4. Click **Save**

### Step 5: Deploy

Click **Deploy** button.

Vercel will:
1. ✅ Install dependencies
2. ✅ Run the build command
3. ✅ Deploy to CDN
4. ✅ Provide a production URL

### Step 6: Run Database Migrations

After first deployment, you need to initialize the database:

**Using Vercel CLI:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to project
vercel link

# Run Prisma commands in production
vercel env pull .env.production
npx prisma generate
npx prisma db push
```

**Or manually via SQL:**

Run the Prisma schema against your production database using a database client.

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches and PRs

### Preview Deployments

Every PR gets a unique preview URL:
- `https://vanshvriksh-git-feature-branch-username.vercel.app`
- Perfect for testing before merging

## Custom Domain (Optional)

### Adding Custom Domain

1. Go to **Project Settings** → **Domains**
2. Enter your domain: `familytree.yourdomain.com`
3. Follow DNS configuration instructions
4. Vercel will auto-provision SSL certificate

### DNS Configuration

Add these records to your DNS:

```
Type: CNAME
Name: familytree (or @)
Value: cname.vercel-dns.com
```

## Monitoring and Logs

### View Deployment Logs

1. Go to **Deployments** tab
2. Click on a deployment
3. View **Build Logs** and **Function Logs**

### Performance Monitoring

Vercel provides:
- **Analytics**: Page views, unique visitors
- **Web Vitals**: Core Web Vitals metrics
- **Real-time Logs**: Server function execution

Enable in: **Project Settings** → **Analytics**

## Security Best Practices

### Environment Variables

- ✅ Never commit `.env` files
- ✅ Use Vercel's encrypted environment variables
- ✅ Rotate `NEXTAUTH_SECRET` periodically
- ✅ Keep database credentials secure

### Database Security

- ✅ Use connection pooling (Prisma handles this)
- ✅ Enable SSL for database connections
- ✅ Limit database access to Vercel IPs (if using external DB)
- ✅ Regular backups (Vercel Postgres auto-backups)

### CORS and Headers

Vercel automatically configures:
- ✅ HTTPS enforcement
- ✅ Security headers
- ✅ CDN caching

## Rollback

If a deployment has issues:

1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

## Performance Optimization

### Vercel Edge Network

Your app is deployed to Vercel's global CDN:
- Static assets cached at edge
- API routes run in serverless functions
- Images optimized automatically

### Monitoring Performance

Check **Analytics** → **Web Vitals** for:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

Target: All metrics in "Good" range

## Costs

### Free Tier Includes:
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless function execution
- Automatic HTTPS
- Preview deployments

### Paid Features (if needed):
- **Pro Plan** ($20/month):
  - 1 TB bandwidth
  - Advanced analytics
  - Team collaboration
- **Database**:
  - Vercel Postgres free tier: Sufficient for development
  - Neon.tech free tier: 10 GB storage

## Troubleshooting

### Build Failures

**Problem**: Build fails in Vercel

**Solutions**:
1. Check build logs for specific error
2. Verify all environment variables are set
3. Ensure `DATABASE_URL` is valid (can be dummy for build)
4. Test build locally: `npm run build`

### Database Connection Issues

**Problem**: Can't connect to database in production

**Solutions**:
1. Verify `DATABASE_URL` is correct
2. Check database is accessible from internet
3. Ensure SSL mode is correct
4. Test connection string locally

### Environment Variables Not Working

**Problem**: App behavior different in production

**Solutions**:
1. Verify all env vars are set in Vercel
2. Check env var names (case-sensitive)
3. Re-deploy after changing env vars
4. Use `NEXT_PUBLIC_` prefix for client-side variables

### 404 Errors

**Problem**: Pages return 404 in production

**Solutions**:
1. Check file names and paths (case-sensitive)
2. Verify dynamic routes use correct syntax
3. Clear Vercel cache and redeploy
4. Check build output for missing pages

## Post-Deployment Checklist

- [ ] All pages load correctly
- [ ] Authentication works (login/signup)
- [ ] Database operations work (CRUD)
- [ ] Image uploads work (Cloudinary)
- [ ] Tree visualization renders
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Error monitoring set up

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)
- [GitHub Actions + Vercel](https://vercel.com/guides/how-can-i-use-github-actions-with-vercel)

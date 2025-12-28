# VanshVriksh - Setup Guide

## Current Progress ✅

- ✅ Phase 0: Professional Project Setup
- ✅ Phase 1: Next.js with TypeScript Strict Mode
- ✅ Phase 2: Database Schema with Prisma
- ✅ Phase 3: Authentication System (NextAuth.js)

---

## Next Step: Database Setup 🗄️

Before you can test the authentication, you need to set up the database.

### Option 1: Neon.tech (Recommended - FREE)

1. **Sign up for Neon.tech**
   - Go to [neon.tech](https://neon.tech)
   - Sign up (free tier - no credit card required)

2. **Create a new project**
   - Project name: `vanshvriksh`
   - Region: Choose closest to you (e.g., US East)

3. **Copy the connection string**
   - Go to your project dashboard
   - Click "Connection String"
   - Copy the PostgreSQL connection string
   - It looks like: `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/vanshvriksh?sslmode=require`

4. **Set up environment variables**
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   ```

   Edit `.env.local` and add:
   ```env
   DATABASE_URL="your-neon-connection-string-here"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   ```

5. **Generate NEXTAUTH_SECRET**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as `NEXTAUTH_SECRET` in `.env.local`

6. **Push database schema**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

7. **Verify database**
   ```bash
   npx prisma studio
   ```
   This opens a visual database browser at http://localhost:5555

---

### Option 2: Local PostgreSQL

If you have PostgreSQL installed locally:

1. **Create database**
   ```bash
   createdb vanshvriksh
   ```

2. **Update .env.local**
   ```env
   DATABASE_URL="postgresql://yourusername:yourpassword@localhost:5432/vanshvriksh"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="run: openssl rand -base64 32"
   ```

3. **Push schema**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## Test the Application 🧪

Once the database is set up:

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Test authentication**
   - Visit http://localhost:3000
   - Click "Get Started"
   - Create an account
   - Sign in
   - You should be redirected to `/dashboard` (404 for now - we'll build it next!)

---

## What's Next?

After database setup, we'll build:
- ✅ Dashboard with stats
- ✅ Add/Edit/Delete family members
- ✅ Tree visualization
- ✅ Image uploads
- ✅ Professional UI polish

---

## Troubleshooting

### Error: "Can't reach database server"
- Check your DATABASE_URL is correct
- For Neon.tech, ensure `?sslmode=require` is at the end

### Error: "NEXTAUTH_SECRET is not defined"
- Make sure you copied `.env.example` to `.env.local`
- Run `openssl rand -base64 32` and add the output

### Error: "Prisma Client not generated"
- Run `npx prisma generate`

### Database changes not reflecting
- Run `npx prisma db push` again
- Or `npx prisma migrate dev` for migrations

---

**Need help?** Check the [main README](./README.md) or create an issue on GitHub.

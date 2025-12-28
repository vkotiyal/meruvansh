# VanshVriksh MVP - Solo Developer Plan

## Executive Summary

**Goal**: Build a functional family tree app for 1-2 families in 2-4 weeks with ~$0-20/month costs

**Team**: Just you + AI assistance (me!)

**Timeline**: 2-4 weeks (part-time work)

**Budget**: $0-20/month (using free tiers)

**Tech Stack**: Simplified, developer-friendly, minimal setup

---

## What We're Building (MVP Scope)

### Core Features Only

```
✓ User can sign up/login (email + password)
✓ User can create ONE family tree
✓ User can add/edit/delete family members (nodes)
✓ User can set parent-child relationships
✓ User can view tree in simple visualization
✓ User can upload profile pictures
✓ Basic information per person (name, email, phone, birth date, address)

✗ Multiple trees per user (future)
✗ Tree invitations (future)
✗ RBAC (future)
✗ Node verification (future)
✗ Advanced visualization (future)
✗ Bulk import (future)
✗ Search (future)
```

### Simplified User Flow

```
1. User signs up with email/password
2. User creates their family tree (auto-created on signup)
3. User adds themselves as root node
4. User adds family members:
   - Add parent (tree grows upward)
   - Add child (tree grows downward)
   - Add spouse/sibling
5. User views tree visualization
6. Done!
```

---

## Simplified Tech Stack

### What We're Using (Simple & Free)

```
Frontend:
├── Next.js 14 (React framework)
├── TypeScript (type safety)
├── Tailwind CSS (styling)
├── Shadcn/ui (pre-built components)
├── React Flow (tree visualization)
└── Deployed on: Vercel (FREE)

Backend:
├── Next.js API Routes (no separate backend!)
├── Prisma (database ORM)
├── PostgreSQL database
└── Deployed on: Vercel (same app!)

Database:
├── Neon.tech (FREE PostgreSQL with 500MB)
OR
├── Supabase (FREE PostgreSQL + Auth + Storage)

File Storage:
├── Cloudinary (FREE 25GB/month)
OR
├── Supabase Storage (FREE 1GB)

Authentication:
├── NextAuth.js (FREE, open source)
└── Email/Password (simple)

Hosting:
└── Vercel (FREE for hobby projects)

Total Monthly Cost: $0
```

### What We're NOT Using (Too Complex for MVP)

```
✗ AWS (expensive, complex setup)
✗ Separate backend server (unnecessary)
✗ Docker (overkill for MVP)
✗ Terraform (no infrastructure to manage)
✗ Kubernetes/ECS (way overkill)
✗ Redis (not needed yet)
✗ AWS Cognito (NextAuth is simpler)
✗ Multiple environments (just production)
```

---

## 4-Week Implementation Plan

### Week 1: Setup & Authentication

**Days 1-2: Project Setup**
```bash
# I'll guide you through:
✓ Create Next.js app with TypeScript
✓ Set up Tailwind CSS
✓ Install Shadcn/ui components
✓ Set up Git repository
✓ Deploy to Vercel (get live URL immediately)

Estimated time: 4-6 hours
```

**Days 3-5: Database & Authentication**
```bash
# I'll guide you through:
✓ Create Neon/Supabase database (free tier)
✓ Set up Prisma
✓ Create database schema (simplified)
✓ Set up NextAuth.js
✓ Build login/signup pages
✓ Test authentication

Estimated time: 8-10 hours
```

**Days 6-7: Basic UI**
```bash
# I'll guide you through:
✓ Create dashboard layout
✓ Create navigation
✓ Create user profile page
✓ Add logout functionality

Estimated time: 4-6 hours
```

**Week 1 Deliverable**: Working app with authentication ✓

---

### Week 2: Core Features

**Days 8-10: Family Tree Data Model**
```bash
# I'll guide you through:
✓ Create Node model (family members)
✓ Create Person model (personal info)
✓ Set up relationships (parent-child)
✓ Create API routes for CRUD operations
✓ Test with Postman/Thunder Client

Estimated time: 8-10 hours
```

**Days 11-13: Add/Edit Family Members**
```bash
# I'll guide you through:
✓ Create "Add Member" form
✓ Create "Edit Member" form
✓ Implement parent selection
✓ Implement child addition
✓ Add form validation
✓ Test all operations

Estimated time: 10-12 hours
```

**Day 14: List View**
```bash
# I'll guide you through:
✓ Display family members in a list
✓ Add search/filter
✓ Add member cards
✓ Add click to edit

Estimated time: 4-6 hours
```

**Week 2 Deliverable**: Can add/edit/delete family members ✓

---

### Week 3: Visualization & Images

**Days 15-18: Tree Visualization**
```bash
# I'll guide you through:
✓ Install React Flow
✓ Convert data to tree structure
✓ Render basic tree
✓ Add zoom/pan controls
✓ Make it look good
✓ Add click to view details

Estimated time: 12-15 hours
```

**Days 19-21: Profile Pictures**
```bash
# I'll guide you through:
✓ Set up Cloudinary/Supabase Storage
✓ Create image upload component
✓ Add image cropping
✓ Display images in tree
✓ Handle image deletion

Estimated time: 8-10 hours
```

**Week 3 Deliverable**: Beautiful tree visualization with photos ✓

---

### Week 4: Polish & Launch

**Days 22-24: Polish**
```bash
# I'll guide you through:
✓ Improve UI/UX
✓ Add loading states
✓ Add error handling
✓ Improve mobile responsiveness
✓ Add helpful tooltips
✓ Fix bugs

Estimated time: 8-10 hours
```

**Days 25-26: Testing**
```bash
# I'll guide you through:
✓ Test all features
✓ Test on different devices
✓ Test edge cases
✓ Get feedback from family
✓ Fix critical bugs

Estimated time: 6-8 hours
```

**Days 27-28: Launch**
```bash
# I'll guide you through:
✓ Add family members
✓ Invite 1-2 families to use
✓ Monitor for issues
✓ Celebrate! 🎉

Estimated time: 4-6 hours
```

**Week 4 Deliverable**: Live, working app with real family data ✓

---

## Simplified Database Schema

```sql
-- Users (from NextAuth.js - auto-generated)
users
├── id
├── email
├── password_hash
├── name
└── created_at

-- Family Trees (simplified - one per user)
trees
├── id
├── name
├── owner_id (user_id)
└── created_at

-- Nodes (family members)
nodes
├── id
├── tree_id
├── parent_id (self-reference)
├── name
├── email
├── phone
├── birth_date
├── profile_picture_url
├── address
└── created_at

-- That's it! Super simple.
```

### Prisma Schema (Actual Code)

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// NextAuth.js models
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  tree          Tree?
}

model Tree {
  id        String   @id @default(cuid())
  name      String
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  nodes     Node[]
  createdAt DateTime @default(now())
}

model Node {
  id              String    @id @default(cuid())
  treeId          String
  tree            Tree      @relation(fields: [treeId], references: [id], onDelete: Cascade)

  parentId        String?
  parent          Node?     @relation("NodeToNode", fields: [parentId], references: [id])
  children        Node[]    @relation("NodeToNode")

  name            String
  email           String?
  phone           String?
  birthDate       DateTime?
  deathDate       DateTime?
  profilePicture  String?
  address         String?
  bio             String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## Project Structure (Simple)

```
vanshvriksh-mvp/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── signup/
│   │       └── page.tsx          # Signup page
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── page.tsx              # Dashboard home
│   │   ├── tree/
│   │   │   └── page.tsx          # Tree visualization
│   │   ├── members/
│   │   │   ├── page.tsx          # List members
│   │   │   ├── add/
│   │   │   │   └── page.tsx      # Add member
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Edit member
│   │   └── profile/
│   │       └── page.tsx          # User profile
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth.js config
│   │   ├── nodes/
│   │   │   ├── route.ts          # GET, POST nodes
│   │   │   └── [id]/
│   │   │       └── route.ts      # PUT, DELETE node
│   │   └── upload/
│   │       └── route.ts          # Image upload
│   │
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── ui/                       # Shadcn components
│   ├── auth/
│   │   └── AuthForm.tsx          # Reusable auth form
│   ├── tree/
│   │   ├── TreeView.tsx          # Tree visualization
│   │   └── NodeCard.tsx          # Node display
│   └── members/
│       ├── MemberForm.tsx        # Add/Edit form
│       └── MemberList.tsx        # List display
│
├── lib/
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # NextAuth config
│   └── utils.ts                  # Utility functions
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
│
├── .env.local                    # Environment variables
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

---

## Cost Breakdown (Free Tier)

```
Service                  Free Tier Limits              Cost/Month
─────────────────────────────────────────────────────────────────
Vercel (Hosting)         Unlimited bandwidth           $0
Neon.tech (Database)     500MB storage, 1 project      $0
Cloudinary (Images)      25GB bandwidth, 25GB storage  $0
Domain (optional)        vanshvriksh.com              $12/year

Total Monthly Cost:                                    $0-1
```

### When You Outgrow Free Tier (100+ users)

```
Service                  Paid Plan                     Cost/Month
─────────────────────────────────────────────────────────────────
Vercel Pro               Unlimited everything          $20
Neon.tech Pro            3GB storage, more projects    $19
Cloudinary               100GB bandwidth               $0 (still free)

Total Monthly Cost:                                    $39
```

---

## Step-by-Step Getting Started

### Step 1: Set Up Development Environment

```bash
# Install Node.js (if not installed)
# Download from: https://nodejs.org/

# Verify installation
node --version  # Should be 20.x
npm --version   # Should be 10.x

# Install pnpm (faster than npm)
npm install -g pnpm

# Install VS Code (if not installed)
# Download from: https://code.visualstudio.com/

# Install VS Code extensions:
# - ESLint
# - Prettier
# - Tailwind CSS IntelliSense
# - Prisma
```

### Step 2: Create Next.js Project

```bash
# Create new Next.js app
npx create-next-app@latest vanshvriksh-mvp

# Options:
# ✓ TypeScript? Yes
# ✓ ESLint? Yes
# ✓ Tailwind CSS? Yes
# ✓ src/ directory? No
# ✓ App Router? Yes
# ✓ Import alias? Yes (@/*)

# Navigate to project
cd vanshvriksh-mvp

# Install additional dependencies
pnpm add prisma @prisma/client next-auth bcrypt
pnpm add -D @types/bcrypt

# Install Shadcn/ui
npx shadcn-ui@latest init

# Install React Flow (for tree visualization)
pnpm add reactflow

# Install form handling
pnpm add react-hook-form zod @hookform/resolvers
```

### Step 3: Set Up Database (Neon.tech)

```bash
# 1. Go to: https://neon.tech/
# 2. Sign up (free, no credit card)
# 3. Create new project: vanshvriksh
# 4. Copy connection string

# 5. Create .env.local file
cat > .env.local <<EOF
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/vanshvriksh?sslmode=require"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
EOF

# 6. Initialize Prisma
npx prisma init

# 7. Copy the schema I provided above into prisma/schema.prisma

# 8. Create database
npx prisma db push

# 9. Generate Prisma Client
npx prisma generate

# 10. View database in browser
npx prisma studio
```

### Step 4: Set Up Authentication (NextAuth.js)

```bash
# I'll provide you the complete code for:
# - app/api/auth/[...nextauth]/route.ts
# - lib/auth.ts
# - app/(auth)/login/page.tsx
# - app/(auth)/signup/page.tsx

# You just copy-paste and run!
```

### Step 5: Run the App

```bash
# Start development server
pnpm dev

# Open browser
# http://localhost:3000

# You should see the homepage!
```

### Step 6: Deploy to Vercel (5 minutes)

```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/vanshvriksh-mvp.git
git push -u origin main

# 2. Go to: https://vercel.com/
# 3. Sign up with GitHub
# 4. Click "New Project"
# 5. Import your repository
# 6. Add environment variables (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)
# 7. Click Deploy

# Done! Your app is live at: https://vanshvriksh-mvp.vercel.app
```

---

## How We'll Work Together

### My Role (AI Assistant)
```
✓ Provide complete code for each feature
✓ Explain what each piece does
✓ Help debug errors
✓ Suggest improvements
✓ Answer questions
✓ Review your code
✓ Guide architecture decisions
```

### Your Role (Developer)
```
✓ Copy-paste code I provide
✓ Run commands I give you
✓ Test features
✓ Report errors/issues
✓ Make small tweaks
✓ Deploy to Vercel
✓ Add your family data
```

### Our Workflow (Per Feature)

```
1. You: "I want to add the login page"

2. Me: Provides complete code:
   - Login page component
   - API route
   - Database query
   - Instructions

3. You: Copy-paste, test, report results

4. Me: Fix any issues, iterate

5. Repeat for next feature
```

---

## What You'll Learn

By building this MVP, you'll learn:

```
✓ Next.js 14 (App Router, Server Components)
✓ TypeScript (type-safe JavaScript)
✓ React (modern UI development)
✓ Prisma (database ORM)
✓ Authentication (NextAuth.js)
✓ API development (REST APIs)
✓ Database design (PostgreSQL)
✓ Deployment (Vercel)
✓ Git & GitHub
✓ Tailwind CSS
✓ Form handling
✓ File uploads
✓ Tree visualization
✓ Full-stack development
```

Skills valuable for any software engineering role!

---

## Scaling Path (After MVP)

### Phase 1: MVP (Now)
- 1-2 families
- Basic features
- Free hosting
- Solo developer

### Phase 2: Beta (Month 2-3)
- 5-10 families
- Add invitations
- Add node verification
- Still free tier
- Maybe 1 more developer

### Phase 3: Launch (Month 4-6)
- 50-100 families
- Add RBAC
- Add advanced visualization
- Paid tier ($39/month)
- Small team (2-3 developers)

### Phase 4: Growth (Month 7-12)
- 1,000+ families
- Add bulk import
- Add analytics
- Add mobile app
- Switch to full AWS stack
- Follow original plan

You can scale up as you grow!

---

## Decision: Which Approach?

### MVP Approach (This Plan)
```
Pros:
✓ Start building NOW
✓ Working app in 2-4 weeks
✓ Learn by doing
✓ $0-20/month cost
✓ No team needed
✓ Can scale later

Cons:
✗ Limited features initially
✗ Manual scaling effort
✗ Less robust (but fine for MVP)
```

### Enterprise Approach (Original Plan)
```
Pros:
✓ Production-ready from day 1
✓ Highly scalable
✓ All features
✓ Professional quality

Cons:
✗ Requires $250K-350K budget
✗ Needs full team
✗ Takes 7 months
✗ Complex infrastructure
✗ Overkill for 1-2 families
```

---

## My Recommendation

**Start with the MVP approach:**

1. Build MVP in 2-4 weeks (this plan)
2. Use it with your 1-2 families
3. Collect feedback
4. Validate the idea
5. If successful, then:
   - Raise funding OR
   - Bootstrap revenue OR
   - Keep it small and simple
6. Scale using original plan when ready

**Why?**
- Validate idea before investing $300K
- Learn the domain deeply
- Have working product to show investors
- Keep costs near zero
- Maintain full control

---

## 📋 Implementation Files Created

I've created detailed guides to make implementation seamless:

### 1. **MVP_IMPLEMENTATION_GUIDE.md** + **Part 2** ⭐ START HERE
   - Complete step-by-step code for all 18 steps
   - Part 1: Steps 1-7 (Setup, Auth, Dashboard, Add Member)
   - Part 2: Steps 8-18 (Edit, Delete, Tree View, Images, Deploy)
   - Copy-paste ready code snippets
   - Every file you need to create
   - All commands to run
   - Common issues & solutions
   - **THIS IS YOUR BUILD GUIDE**

### 2. **PROGRESS.md**
   - Track what's completed
   - Checkboxes for each step
   - Time tracking
   - Git commit log
   - Blocker tracking
   - **UPDATE THIS AS YOU GO**

### 3. **This File (MVP_PLAN.md)**
   - Overview and context
   - Why we chose this approach
   - Tech stack decisions
   - Reference guide

---

## How to Use These Files When You Return

### Scenario 1: Just Starting (Haven't built anything yet)

```
You say: "Let's start building VanshVriksh MVP"

I will:
1. Read MVP_IMPLEMENTATION_GUIDE.md
2. Read PROGRESS.md to see you're at Step 1
3. Provide Step 1 code (Project Setup)
4. Guide you through installation
5. You mark Step 1 complete in PROGRESS.md
6. Move to Step 2
```

### Scenario 2: Already Started (Completed some steps)

```
You say: "Continue building VanshVriksh, I completed Step 3"

I will:
1. Read PROGRESS.md to verify Step 3 is checked
2. Read MVP_IMPLEMENTATION_GUIDE.md Step 4
3. Provide Step 4 code (Authentication Frontend)
4. Guide you through implementation
5. You mark Step 4 complete
6. Continue...
```

### Scenario 3: Stuck or Error

```
You say: "I'm stuck at Step 5, getting error X"

I will:
1. Read MVP_IMPLEMENTATION_GUIDE.md Step 5
2. Read the error
3. Provide solution from "Common Issues" section
4. Help debug
5. Get you unstuck
6. Continue building
```

### Scenario 4: Want to Customize

```
You say: "I want to add feature Y to the MVP"

I will:
1. Read current PROGRESS.md
2. Understand what's built
3. Suggest where to add feature Y
4. Provide code for feature Y
5. Update implementation plan
6. Continue building
```

---

## Let's Start!

### Ready to Begin?

**When you return, just say one of these:**

```
Option 1: "Let's start building VanshVriksh MVP"
→ We'll begin at Step 1 (Project Setup)

Option 2: "Continue from Step X"
→ I'll pick up where you left off

Option 3: "Show me the code for Step X"
→ I'll provide that specific step's code

Option 4: "I'm stuck at Step X with error Y"
→ I'll help debug and get you unstuck

Option 5: "I completed up to Step X, what's next?"
→ I'll give you Step X+1

Option 6: "Explain Step X in more detail"
→ I'll break it down further
```

**The guides are ready. You're ready. Let's build! 🚀**

---

## What Makes This Work

### ✅ Complete Code Provided
Every file, every line, ready to copy-paste

### ✅ Clear Progress Tracking
You always know where you are

### ✅ No Memory Needed
I just read the files to know the context

### ✅ Flexible Pace
Build in one weekend or over 4 weeks

### ✅ Error Solutions Included
Common issues pre-solved

### ✅ Professional Quality
Production-ready code from the start

---

**Remember:**
- You DON'T need to be an expert developer
- You CAN ask me anything
- You CAN take breaks and come back
- You CAN customize features
- You CAN deploy to production for FREE

**This is YOUR family tree app. Let's make it happen! 🌳**

---

**Document Version**: 1.1
**Last Updated**: December 2025
**Status**: Ready to Build! 🚀
**Next Action**: Open MVP_IMPLEMENTATION_GUIDE.md and tell me "Let's start building"

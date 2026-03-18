# Insta Auto - Instagram Automation Platform
Next.js application with authentication and user management, built for Instagram automation workflows.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5 with Supabase adapter
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Password Hashing**: bcryptjs

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** or **pnpm** - Package manager
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)

## Local Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd insta-auto
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase

#### 3.1 Create a Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details and create the project

#### 3.2 Create the Users Table
Run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
```

#### 3.3 Get Your API Keys
1. Go to **Project Settings** → **API**
2. Copy the following:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key (⚠️ Keep this secure!)

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
AUTH_SECRET=your_generated_secret_key
```

#### Generate AUTH_SECRET

Run this command to generate a secure random secret:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Test the Application

1. **Sign Up**: Go to `/signup` and create a new account
2. **Sign In**: Go to `/signin` and log in with your credentials
3. **Dashboard**: Access the protected `/dashboard` route (requires authentication)



## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```



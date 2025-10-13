#!/bin/bash

# Gauntlet AI Starter Template Setup Script
# This script sets up a new Gauntlet AI weekly project from the starter template

set -e  # Exit on any error

echo "🚀 Setting up Gauntlet AI Starter Template..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "docs/context.md" ]; then
    print_error "This doesn't appear to be a Foundry Core directory."
    print_error "Please run this script from the root of the starter template."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
    print_success "pnpm installed successfully"
else
    print_success "pnpm is already installed"
fi

print_status "Starting project setup..."

# 1. Initialize Next.js project (if not already initialized)
if [ ! -f "package.json" ]; then
    print_status "Initializing Next.js project..."
    npx create-next-app@latest . --typescript --tailwind --eslint --yes
    print_success "Next.js project initialized"
else
    print_success "Next.js project already initialized"
fi

# 2. Install core dependencies
print_status "Installing core dependencies..."
pnpm add zod dotenv @t3-oss/env-nextjs openai axios clsx lodash-es zustand
print_success "Core dependencies installed"

# 3. Install backend dependencies (Supabase by default)
print_status "Installing backend dependencies..."
pnpm add @supabase/supabase-js
print_success "Backend dependencies installed"

# 4. Initialize shadcn/ui
print_status "Initializing shadcn/ui..."
pnpm dlx shadcn-ui@latest init --yes
print_success "shadcn/ui initialized"

# 5. Install UI dependencies
print_status "Installing UI dependencies..."
pnpm add lucide-react framer-motion recharts
print_success "UI dependencies installed"

# 6. Install dev dependencies
print_status "Installing dev dependencies..."
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
print_success "Dev dependencies installed"

# 7. Create environment file template
print_status "Creating environment template..."
cat > .env.local.example << 'EOF'
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: Other AI Services
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# GOOGLE_AI_API_KEY=your_google_ai_api_key_here
EOF

# 8. Create basic config files
print_status "Creating configuration files..."

# Create config directory structure
mkdir -p config
mkdir -p lib/ai
mkdir -p lib/auth
mkdir -p lib/db
mkdir -p types
mkdir -p hooks
mkdir -p components/ui
mkdir -p components/forms
mkdir -p components/layout
mkdir -p components/ai

# Create basic config files
cat > config/env.ts << 'EOF'
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
EOF

cat > config/ai.ts << 'EOF'
import { env } from "./env";

export const aiConfig = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: "gpt-4" as const,
    maxTokens: 4096,
    temperature: 0.7,
  },
  fallback: {
    enabled: true,
    model: "gpt-3.5-turbo" as const,
  },
} as const;
EOF

cat > config/database.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export const supabaseClient = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
EOF

# 9. Create basic type definitions
cat > types/ai.ts << 'EOF'
export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface AIError {
  error: string;
  code?: string;
  details?: unknown;
}

export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4-turbo';
EOF

cat > types/auth.ts << 'EOF'
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
EOF

cat > types/database.ts << 'EOF'
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
EOF

# 10. Create basic utility files
cat > lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
EOF

cat > lib/ai/openai.ts << 'EOF'
import OpenAI from 'openai';
import { aiConfig } from '../../config/ai';
import type { AIResponse, AIError } from '../../types/ai';

const openai = new OpenAI({
  apiKey: aiConfig.openai.apiKey,
});

export async function generateAIResponse(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<AIResponse | AIError> {
  try {
    const response = await openai.chat.completions.create({
      model: options?.model || aiConfig.openai.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options?.maxTokens || aiConfig.openai.maxTokens,
      temperature: options?.temperature || aiConfig.openai.temperature,
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      return { error: 'No response generated' };
    }

    return {
      content: choice.message.content,
      usage: response.usage,
      model: response.model,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error,
    };
  }
}
EOF

print_success "Configuration files created"

# 11. Create basic API route structure
mkdir -p app/api/ai
mkdir -p app/api/auth
mkdir -p app/api/data

cat > app/api/ai/chat/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai/openai';
import { env } from '@/config/env';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await generateAIResponse(prompt);

    if ('error' in response) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
EOF

# 12. Create basic app structure
mkdir -p app/\(auth\)
mkdir -p app/\(dashboard\)

cat > app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gauntlet AI Project",
  description: "AI-enhanced application built with the Foundry Core",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
EOF

cat > app/page.tsx << 'EOF'
export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Gauntlet AI Project
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your AI-enhanced application is ready to go!
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            🚀 Next.js 14+ with App Router
          </p>
          <p className="text-sm text-gray-500">
            🎨 Tailwind CSS + shadcn/ui
          </p>
          <p className="text-sm text-gray-500">
            🤖 OpenAI API integration
          </p>
          <p className="text-sm text-gray-500">
            🔐 Supabase authentication
          </p>
        </div>
      </div>
    </main>
  );
}
EOF

cat > app/loading.tsx << 'EOF'
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
}
EOF

cat > app/error.tsx << 'EOF'
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Something went wrong!
      </h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
EOF

cat > app/not-found.tsx << 'EOF'
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Found</h2>
      <p className="text-gray-600 mb-4">Could not find the requested resource.</p>
      <a
        href="/"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Return Home
      </a>
    </div>
  );
}
EOF

print_success "Basic app structure created"

# 13. Update package.json with useful scripts
print_status "Adding useful scripts to package.json..."

# Create a temporary package.json with additional scripts
cat > package.json.tmp << 'EOF'
{
  "name": "gauntlet-starter-template",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "setup:env": "cp .env.local.example .env.local",
    "db:generate-types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts"
  }
}
EOF

# Merge with existing package.json if it exists
if [ -f "package.json" ]; then
    jq '.scripts = {
        "dev": "next dev",
        "build": "next build", 
        "start": "next start",
        "lint": "next lint",
        "test": "vitest",
        "test:ui": "vitest --ui",
        "test:coverage": "vitest --coverage",
        "type-check": "tsc --noEmit",
        "format": "prettier --write .",
        "format:check": "prettier --check .",
        "setup:env": "cp .env.local.example .env.local",
        "db:generate-types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
else
    mv package.json.tmp package.json
fi

# 14. Create README with setup instructions
cat > README.md << 'EOF'
# Gauntlet AI Starter Template

A comprehensive starter template for rapid AI-enhanced application development during the Gauntlet AI program.

## 🚀 Quick Start

1. **Setup Environment Variables**
   ```bash
   pnpm run setup:env
   ```
   Then edit `.env.local` with your actual API keys.

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Run Development Server**
   ```bash
   pnpm dev
   ```

4. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React, Framer Motion
- **Backend**: Supabase (Auth + Database)
- **AI Integration**: OpenAI API
- **State Management**: Zustand
- **Testing**: Vitest, Testing Library
- **Development**: ESLint, Prettier

## 📁 Project Structure

```
├── app/                    # Next.js app directory
├── components/            # Shared UI components
├── lib/                   # Utility functions
├── config/                # Configuration files
├── types/                 # TypeScript definitions
├── hooks/                 # Custom React hooks
├── docs/                  # Documentation
└── scripts/               # Automation scripts
```

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks

## 📚 Documentation

- [PRD Template](docs/templates/PRD_template.md)
- [Implementation Checklist](docs/templates/implementation_checklist_template.md)
- [Collaboration Protocol](docs/collaboration_protocol.md)

## 🤝 Contributing

This template follows the Gauntlet AI collaboration protocol. See `docs/collaboration_protocol.md` for details.

## 📄 License

MIT
EOF

print_success "README created"

# 15. Final setup steps
print_status "Running final setup steps..."

# Install Prettier for code formatting
pnpm add -D prettier

# Create Prettier config
cat > .prettierrc << 'EOF'
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
EOF

# Create .prettierignore
cat > .prettierignore << 'EOF'
node_modules
.next
dist
build
coverage
*.log
.env*
EOF

print_success "Prettier configured"

# Final success message
echo ""
print_success "🎉 Gauntlet AI Starter Template setup complete!"
echo ""
print_status "Next steps:"
echo "  1. Copy environment variables: pnpm run setup:env"
echo "  2. Edit .env.local with your API keys"
echo "  3. Start development: pnpm dev"
echo "  4. Open http://localhost:3000"
echo ""
print_status "For Supabase setup:"
echo "  1. Create a new Supabase project"
echo "  2. Get your project URL and anon key"
echo "  3. Add them to .env.local"
echo ""
print_status "For OpenAI setup:"
echo "  1. Get your API key from https://platform.openai.com/api-keys"
echo "  2. Add it to .env.local"
echo ""
print_success "Happy coding! 🚀"
EOF

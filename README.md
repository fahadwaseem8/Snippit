# Snippit

Your lightweight home for code snippets. Save, search, and copy with ease.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)

Snippit is a modern code snippet manager built with Next.js App Router and deployed on Vercel. Data is securely stored in a Supabase PostgreSQL database, utilizing built-in Supabase Auth (GoTrue) for session management and user authentication.

## Features

- Save, edit, delete, and favorite snippets
- Search snippets by title/code and filter by language
- CodeMirror 6 editor with syntax highlighting for common languages
- Secure cookie-based authentication via Supabase Auth
- Out-of-the-box password reset flows and email verification
- API request logging for snippet endpoints
- Responsive UI for desktop and mobile
- Automated daily health checks via Vercel Cron

## Tech Stack

- Framework: Next.js 16 (App Router)
- Runtime/Deploy: Vercel
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth (GoTrue)
- Frontend: React 19 + Tailwind CSS 4
- Language: TypeScript

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase CLI
- Vercel CLI (optional)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase connection strings:

```bash
cp .env.example .env
```

Your `.env` should include keys like `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `CRON_SECRET`.

### 3. Configure Supabase

Link your local project to your remote Supabase instance:

```bash
npx supabase link --project-ref your-project-ref
```

Push the initial schema to the database:

```bash
npx supabase db push
```

### 4. Run the app

Start the Next.js development server:

```bash
npm run dev
```

## Deployment (Vercel)

Snippit is optimized for Vercel. You can deploy it seamlessly by connecting your GitHub repository to Vercel. Make sure to map all your `.env` variables to Vercel's Environment Variables settings.

The project includes a `vercel.json` file that automatically configures a daily cron job to keep your Supabase instance active.

## Project Structure

```text
snippit/
├── src/app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── confirm/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── reset-password/route.ts
│   │   ├── cron/health/route.ts
│   │   └── snippets/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── components/
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── reset-password/page.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── api-logger.ts
│   ├── codemirror-theme.ts
│   └── constants.ts
├── supabase/
│   └── migrations/
├── vercel.json
└── middleware.ts
```

## API Endpoints

Authentication (Supabase wrappers):

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/confirm?token_hash=...&type=...`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/reset-password` (request reset / set new password)

Snippets:

- `GET /api/snippets`
- `POST /api/snippets`
- `PATCH /api/snippets/[id]`
- `DELETE /api/snippets/[id]`

Cron:

- `GET /api/cron/health`

## Notes

- Supabase Clients are created via `@supabase/ssr` methods to properly share cookies between Next.js server components, client components, and API routes.
- The `api-logger.ts` handles request logging automatically when wrapping endpoints with `withAPILogging()`.
- Ensure `CRON_SECRET` is set in production to protect your health check endpoint.

## Contributing

1. Fork the repository
2. Create a branch (`git checkout -b feature/my-change`)
3. Commit (`git commit -m "feat: my change"`)
4. Push and open a pull request

## License

This project is open source and available under the MIT License.

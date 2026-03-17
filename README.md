# Snippit

Your lightweight home for code snippets. Save, search, and copy with ease.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-f38020?style=flat-square&logo=cloudflare)](https://developers.cloudflare.com/d1/)

Snippit is a modern code snippet manager built with Next.js App Router and deployed on Cloudflare Workers using OpenNext. Data is stored in Cloudflare D1, with custom auth/session handling backed by D1 tables.

## Features

- Save, edit, delete, and favorite snippets
- Search snippets by title/code and filter by language
- CodeMirror 6 editor with syntax highlighting for common languages
- Secure cookie-based authentication
- Password reset flow (SMTP optional)
- API request logging for snippet endpoints
- Responsive UI for desktop and mobile

## Tech Stack

- Framework: Next.js 16 (App Router)
- Runtime/Deploy: Cloudflare Workers via `@opennextjs/cloudflare`
- Database: Cloudflare D1 (binding: `DB`)
- Frontend: React 19 + Tailwind CSS 4
- Language: TypeScript
- Email: Nodemailer (for password reset)

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Cloudflare account (for D1 + deployment)
- Wrangler CLI (installed as a dev dependency)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure D1

Create a D1 database if needed:

```bash
npx wrangler d1 create snippit
```

Set your `database_id` in [wrangler.jsonc](wrangler.jsonc) under `d1_databases`.

Apply schema locally:

```bash
npx wrangler d1 execute snippit --local --file=schema.sql
```

Apply schema remotely:

```bash
npx wrangler d1 execute snippit --remote --file=schema.sql
```

### 3. Configure environment variables (optional for reset emails)

Password reset emails are sent only when SMTP values are configured.

For local Worker runtime, place these in `.dev.vars`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-user
SMTP_PASS=your-password
SMTP_FROM="Snippit <no-reply@example.com>"
```

Without SMTP settings, reset requests still succeed and log a warning, and in non-production the reset link is returned in the API response.

### 4. Run the app

Next.js development server:

```bash
npm run dev
```

Cloudflare Worker preview (OpenNext build + preview):

```bash
npm run preview
```

## Deployment (Cloudflare Workers)

Build and deploy with OpenNext + Wrangler:

```bash
npm run deploy
```

Other useful scripts:

- `npm run upload` - build and upload Worker bundle
- `npm run cf-typegen` - regenerate Cloudflare env typings

## Project Structure

```text
snippit/
├── src/app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── reset-password/route.ts
│   │   └── snippets/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── components/
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── reset-password/page.tsx
├── lib/
│   ├── auth/
│   ├── api-logger.ts
│   ├── codemirror-theme.ts
│   ├── constants.ts
│   └── d1.ts
├── schema.sql
├── open-next.config.ts
├── wrangler.jsonc
└── middleware.ts
```

## API Endpoints

Authentication:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/reset-password` (request reset link)
- `PUT /api/auth/reset-password` (set new password)

Snippets:

- `GET /api/snippets`
- `POST /api/snippets`
- `PATCH /api/snippets/[id]`
- `DELETE /api/snippets/[id]`

## Notes

- Database access is handled through [lib/d1.ts](lib/d1.ts) using `getCloudflareContext()`.
- The app ensures required tables/indexes via `ensureD1Schema()` on runtime access.
- Session cookie name: `snippit_session`.

## Contributing

1. Fork the repository
2. Create a branch (`git checkout -b feature/my-change`)
3. Commit (`git commit -m "feat: my change"`)
4. Push and open a pull request

## License

This project is open source and available under the MIT License.

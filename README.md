This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cloud SQL (MySQL) Connection

This app connects to Google Cloud SQL securely using the Cloud SQL Node Connector. Code lives in [src/lib/db.ts](src/lib/db.ts).

### Prerequisites
- Enable the Cloud SQL Admin API on your GCP project.
- Create a Service Account with role `Cloud SQL Client` and download a JSON key.
- Create a MySQL user for the app and grant needed privileges.

### Environment Variables
Set these in your hosting provider (do not commit secrets):
- `CLOUD_SQL_CONNECTION_NAME`: `PROJECT_ID:REGION:INSTANCE_NAME` from instance Overview.
- `GCP_SERVICE_ACCOUNT_JSON_BASE64`: Base64 of the Service Account JSON key.
- `CLOUD_SQL_IP_TYPE`: `PUBLIC` or `PRIVATE` (default `PUBLIC`).
- `DB_USER`, `DB_PASSWORD`, `DB_NAME`: MySQL credentials.

Local dev alternative: set `GOOGLE_APPLICATION_CREDENTIALS` to the JSON key file path.

### Create Base64 from JSON (Windows PowerShell)
```powershell
$path = "C:\path\to\service-account.json"
[Convert]::ToBase64String([IO.File]::ReadAllBytes($path))
```

### Verify
After deploy, open `/api/health/db` to verify connectivity and required tables.

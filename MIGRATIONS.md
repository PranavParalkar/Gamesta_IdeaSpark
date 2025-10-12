## Authentication Setup

This application uses **Supabase** for authentication. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

### Quick Start

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Create `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Local Database Migrations (Legacy)

The repository contains SQL migrations under `migrations/` for the legacy MySQL database. These are optional if you're using Supabase Auth exclusively.

To set up the MySQL database locally, create a `.env` file and run the migration using your MySQL client. Example commands (PowerShell):

```powershell
# set environment variables (or edit .env)
$env:DB_HOST='127.0.0.1'; $env:DB_PORT='3306'; $env:DB_USER='root'; $env:DB_PASSWORD='yourpw'

# run migration (mysql client must be installed and in PATH)
mysql -h $env:DB_HOST -P $env:DB_PORT -u $env:DB_USER -p$env:DB_PASSWORD < migrations/001_init.sql
```

On Google Cloud you'll run the same SQL against your Cloud SQL instance after provisioning it.

## OAuth Setup Notes (Optional)
1. Create OAuth 2.0 Client IDs in Google Cloud Console (APIs & Services → Credentials).
2. Use the generated Client ID and Client Secret in your `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
3. Add authorized redirect URI pointing to your development host, e.g. `http://localhost:3000/api/auth/callback/google` and to your production domain.


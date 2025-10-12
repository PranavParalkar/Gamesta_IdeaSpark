# Supabase Integration Setup

This application now uses Supabase for authentication instead of custom JWT + MySQL.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be ready (this may take a few minutes)

### 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (this is safe to use in client-side code)

### 3. Configure Environment Variables

Create a `.env.local` file in the root of your project and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can also copy `.env.example` and fill in the values.

### 4. Configure Email Authentication

By default, Supabase requires email confirmation. You can disable this for development:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle off "Confirm email" if you want to allow immediate login during development
3. For production, keep email confirmation enabled for security

### 5. Email Templates (Optional)

You can customize the email templates for confirmation and password reset:

1. Go to **Authentication** → **Email Templates**
2. Customize the templates as needed

## Features

- ✅ Email/password authentication
- ✅ Automatic JWT token management
- ✅ Session persistence
- ✅ Password reset functionality (built into Supabase)
- ✅ Email verification
- ✅ Backward compatibility with legacy JWT tokens

## Migration from Old System

The authentication system maintains backward compatibility:
- Old JWT tokens will continue to work
- New users will be created in Supabase
- You can gradually migrate existing users

## API Endpoints

### Sign Up
```
POST /api/auth/signup
Body: { email, password, name }
```

### Sign In
```
POST /api/auth/signin
Body: { email, password }
```

Both endpoints return:
```json
{
  "token": "access_token",
  "userId": "user_id",
  "user": { ... }
}
```

## Security Notes

- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in client-side code
- Supabase handles rate limiting and security automatically
- Row Level Security (RLS) policies should be configured in Supabase for database tables
- Consider enabling email confirmation for production environments

## Troubleshooting

### "Email already registered" error
- User already exists in Supabase
- Try signing in instead

### "Please verify your email address" error
- Email confirmation is enabled
- Check your email inbox for confirmation link
- Or disable email confirmation in development

### No environment variables set
- Make sure `.env.local` exists and has the correct variables
- Restart your development server after adding environment variables

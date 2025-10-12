import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name || '').toString().trim();
  const email = (body.email || '').toString().trim().toLowerCase();
  const password = (body.password || '').toString();
  const gmailRegex = /^[^@\s]+@gmail\.com$/i;
  if (!email || !gmailRegex.test(email)) return NextResponse.json({ error: 'Please use a valid @gmail.com address' }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.session) {
      return NextResponse.json({ error: 'Signup successful but no session created' }, { status: 500 });
    }

    return NextResponse.json({ 
      token: data.session.access_token,
      userId: data.user?.id,
      user: data.user
    });
  } catch (e: any) {
    console.error('Signup error:', e && e.stack ? e.stack : e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

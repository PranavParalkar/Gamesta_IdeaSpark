import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = (body.email || '').toString().trim().toLowerCase();
  const password = (body.password || '').toString();
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json({ error: 'Please verify your email address' }, { status: 401 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.session) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      token: data.session.access_token,
      userId: data.user?.id,
      user: data.user
    });
  } catch (e: any) {
    console.error('Signin error:', e && e.stack ? e.stack : e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

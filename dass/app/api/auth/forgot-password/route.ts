import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email-ul este obligatoriu' }, { status: 400 });
    }

    const { data: users, error } = await supabase.from('users').select('*').eq('email', email);

    if (error || !users || users.length === 0) {
      return NextResponse.json({ error: 'Acest email nu există în sistem' }, { status: 404 });
    }

    // VULNERABILITATEA 4.6: Token predictibil (doar email-ul în Base64) și fără expirare
    const predictableToken = Buffer.from(email).toString('base64');
    const resetLink = `http://localhost:3000/reset-password?token=${predictableToken}`;

    return NextResponse.json({ 
      message: 'Cerere aprobată!',
      resetLink: resetLink 
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: 'Eroare internă' }, { status: 500 });
  }
}
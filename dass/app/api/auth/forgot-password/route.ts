import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import jwt from 'jsonwebtoken';

// Folosim o cheie secretă pentru a semna token-ul
const JWT_SECRET = process.env.JWT_SECRET || 'dGIs1CpQF8G1WaBYHhEcRxplRz45vm5diekr533l0RP';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email-ul este obligatoriu' }, { status: 400 });
    }

    const { data: users, error } = await supabase.from('users').select('*').eq('email', email);

    // FIX 4.4 & 4.6: Dacă userul nu există, dăm mesaj de succes FALS pentru a preveni enumerarea
    if (error || !users || users.length === 0) {
      return NextResponse.json({ message: 'Dacă adresa există, vei primi un link de resetare.' }, { status: 200 });
    }

    // FIX 4.6: Token sigur, imprevizibil și care expiră
    // Token-ul expiră în 15 minute (900 secunde) și este semnat cu HMAC SHA-256
    const secureToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
    
    const resetLink = `http://localhost:3000/reset-password?token=${secureToken}`;

    return NextResponse.json({ 
      message: 'Dacă adresa există, vei primi un link de resetare.',
      resetLink: resetLink
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: 'Eroare internă' }, { status: 500 });
  }
}
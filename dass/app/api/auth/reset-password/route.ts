import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Date incomplete' }, { status: 400 });
    }

    // VULNERABILITATEA 4.6: Decodăm token-ul fără nicio validare de integritate sau expirare
    const decodedEmail = Buffer.from(token, 'base64').toString('utf-8');

    // Continuare VULNERABILITATEA 4.2: Salvăm parola nouă în clar
    const { error } = await supabase
      .from('users')
      .update({ password_hash: newPassword })
      .eq('email', decodedEmail);

    if (error) {
      return NextResponse.json({ error: 'Eroare la baza de date' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Parola a fost schimbată cu succes!' }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: 'Token invalid sau eroare server' }, { status: 500 });
  }
}
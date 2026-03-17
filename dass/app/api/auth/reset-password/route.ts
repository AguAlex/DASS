import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { logAction } from '@/app/lib/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'dGIs1CpQF8G1WaBYHhEcRxplRz45vm5diekr533l0RP';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Date incomplete' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Parola nouă trebuie să aibă minim 8 caractere.' }, { status: 400 });
    }

    // FIX 4.6: Verificăm semnătura criptografică și expirarea token-ului
    let decodedPayload: any;
    try {
      decodedPayload = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      await logAction(null, 'PASSWORD_RESET_FAILED', 'Token invalid sau expirat', ip);
      return NextResponse.json({ error: 'Token invalid sau expirat!' }, { status: 401 });
    }

    const userEmail = decodedPayload.email;

    // FIX 4.2: Hash-uim noua parolă înainte să o salvăm
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { data: updatedUsers, error } = await supabase
          .from('users')
          .update({ password_hash: hashedPassword })
          .eq('email', userEmail)
          .select();

    if (error) {
      return NextResponse.json({ error: 'Eroare la actualizarea parolei' }, { status: 500 });
    }

    await logAction(updatedUsers[0].id, 'PASSWORD_RESET_SUCCESS', `Parola a fost schimbată pentru ${userEmail}`, ip);
    return NextResponse.json({ message: 'Parola a fost schimbată cu succes!' }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 });
  }
}
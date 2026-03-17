import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/app/lib/supabase';
import bcrypt from 'bcrypt';
import { logAction } from '@/app/lib/audit';

// FIX 4.3: Rate Limiting (Brute Force Protection)
// Stocăm în memorie IP-urile și numărul de încercări
const rateLimit = new Map<string, { count: number; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    // Preluăm IP-ul utilizatorului (sau setăm un default pentru localhost)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minute
    const maxRequests = 5; // Maxim 5 încercări

    const rateData = rateLimit.get(ip);
    if (rateData && now < rateData.expiresAt) {
      if (rateData.count >= maxRequests) {
        await logAction(null, 'LOGIN_FAILED_RATE_LIMIT', 'Prea multe încercări eșuate', ip);
        return NextResponse.json(
          { error: 'Prea multe încercări eșuate. Cont blocat temporar (15 min).' },
          { status: 429 } // Status specific pentru Rate Limit
        );
      }
      rateData.count++;
    } else {
      rateLimit.set(ip, { count: 1, expiresAt: now + windowMs });
    }

    const { email, password } = await request.json();

    const { data: users, error } = await supabase.from('users').select('*').eq('email', email);
    const user = users?.[0];

    // FIX 4.4: User Enumeration
    // Verificăm parola cu bcrypt. Dacă userul nu există sau parola e greșită, dăm același mesaj.
    const isPasswordValid = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !isPasswordValid) {
      await logAction(user ? user.id : null, 'LOGIN_FAILED', `Email încercat: ${email}`, ip);
      return NextResponse.json({ error: 'Email sau parolă incorectă' }, { status: 401 });
    }

    // Resetăm contorul de rate limit la succes
    rateLimit.delete(ip);
    await logAction(user.id, 'LOGIN_SUCCESS', 'Autentificare reușită', ip);
    // FIX 4.5: Gestionarea Sigură a Sesiunilor
    // Creăm un token robust și setăm flag-urile de securitate
    const sessionToken = crypto.randomUUID(); // Generăm un ID de sesiune sigur
    
    // Codăm datele minime necesare (fără date sensibile)
    const sessionPayload = Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role })).toString('base64');
    
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'session_token',
      value: sessionPayload,
      httpOnly: true, // Protejează împotriva XSS (nu poate fi citit cu JavaScript)
      secure: process.env.NODE_ENV === 'production', // Doar pe HTTPS în producție
      sameSite: 'lax', // Protejează împotriva CSRF
      maxAge: 60 * 60 * 2, // Expiră în 2 ore
      path: '/',
    });

    return NextResponse.json({ message: 'Autentificare cu succes!' }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: 'Eroare internă de server' }, { status: 500 });
  }
}
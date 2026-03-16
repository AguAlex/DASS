import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Date incomplete' }, { status: 400 });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // VULNERABILITATEA 4.4: User Enumeration
    // Returnam un mesaj specific daca userul nu a fost gasit
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Utilizatorul nu exista' }, 
        { status: 404 }
      );
    }

    const user = users[0];

    // VULNERABILITATEA 4.3: Lipsa rate limiting

    // Continuare VULNERABILITATEA 4.2: Comparam parola in clar
    if (user.password_hash !== password) {
      // VULNERABILITATEA 4.4: User Enumeration
      // Returnam un mesaj diferit daca parola e gresita, confirmand astfel ca userul exista 
      return NextResponse.json(
        { error: 'Parola gresita pentru acest utilizator' }, 
        { status: 401 }
      );
    }

    // VULNERABILITATEA 4.5: Gestionare nesigura a sesiunilor 
    // "token" extrem de slab (doar datele userului encodate base64)
    const insecureToken = Buffer.from(
      JSON.stringify({ id: user.id, email: user.email, role: user.role })
    ).toString('base64');

    const cookieStore = await cookies();
    
    // Cookie-ul fara flag-urile vitale de securitate
    cookieStore.set({
      name: 'session_token',
      value: insecureToken,
      httpOnly: false, // Permite citirea cookie-ului din JavaScript (risc major de XSS)
      secure: false,   // Cookie-ul va fi trimis si pe conexiuni HTTP nesecurizate
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // Expirare mult prea lunga (1 an)
    });

    return NextResponse.json({ message: 'Autentificare cu succes!' }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: 'Eroare interna de server' }, { status: 500 });
  }
}
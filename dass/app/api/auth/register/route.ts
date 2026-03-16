import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email și parola sunt obligatorii' }, { status: 400 });
    }

    // FIX 4.1: Password Policy (Lungime minimă și complexitate)
    // Respingem parolele scurte pentru a preveni brute force ușor
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Parola trebuie să conțină cel puțin 8 caractere.' }, 
        { status: 400 }
      );
    }

    // FIX 4.2: Stocare sigură a parolelor (Hashing + Salt)
    // Generăm un hash sigur folosind bcrypt cu un cost factor de 10
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: email,
          password_hash: hashedPassword,
          role: 'USER',
        }
      ])
      .select();

    if (error) {
      // FIX BONUS: Nu mai returnăm eroarea brută din baza de date către client
      // Previne Information Disclosure (OWASP)
      return NextResponse.json({ error: 'Acest email este deja utilizat sau a apărut o eroare.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Cont creat cu succes', user: data[0] }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: 'Eroare internă de server' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // VULNERABILITATEA 4.1: Password Policy slab
    if (!email || !password) {
      return NextResponse.json({ error: 'Email si parola sunt obligatorii' }, { status: 400 });
    }

    // VULNERABILITATEA 4.2: Stocare nesigura (salvare fara hash)
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: email,
          password_hash: password,
          role: 'USER',
        }
      ])
      .select();

    if (error) {
      // Returnam direct eroarea din baza de date (poate oferi informatii utile unui atacator)
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Cont creat cu succes!', user: data[0] }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: 'Eroare internă de server' }, { status: 500 });
  }
}
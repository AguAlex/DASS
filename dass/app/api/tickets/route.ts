import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/app/lib/supabase';
import { logAction } from '@/app/lib/audit';

// Funcție utilitară pentru a extrage userul din cookie-ul de sesiune creat la login
async function getUserFromSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token');
  
  if (!sessionToken) return null;
  
  try {
    // Decodăm payload-ul de sesiune pe care l-am setat în versiunea securizată
    const decodedPayload = Buffer.from(sessionToken.value, 'base64').toString('utf-8');
    return JSON.parse(decodedPayload);
  } catch (error) {
    return null;
  }
}

// POST: Crearea unui tichet nou (Create)
export async function POST(request: Request) {
  const user = await getUserFromSession();
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // Verificăm dacă userul e logat (Autorizare)
  if (!user) {
    await logAction(null, 'UNAUTHORIZED_TICKET_CREATION_ATTEMPT', 'Tickets API', ip);
    return NextResponse.json({ error: 'Trebuie să fii autentificat pentru a crea un tichet.' }, { status: 401 });
  }

  try {
    const { title, description, severity } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Titlul și descrierea sunt obligatorii.' }, { status: 400 });
    }

    // Inserăm tichetul în baza de date
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert([
        {
          title,
          description,
          severity: severity || 'LOW',
          owner_id: user.id // Leagăm tichetul strict de userul logat (Previne vulnerabilități tip IDOR)
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Jurnalizăm acțiunea (Audit Logging)
    await logAction(user.id, 'TICKET_CREATED', `Ticket ID: ${ticket.id}`, ip);

    return NextResponse.json({ message: 'Tichet creat cu succes!', ticket }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Eroare la crearea tichetului.' }, { status: 500 });
  }
}


// GET: Citirea și Căutarea tichetelor (Read & Search)
export async function GET(request: Request) {
  const user = await getUserFromSession();
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  if (!user) {
    return NextResponse.json({ error: 'Acces interzis.' }, { status: 401 });
  }

  try {

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search');

    let query = supabase.from('tickets').select('*');

    // Dacă utilizatorul a folosit funcția de Search, filtrăm rezultatele
    if (searchQuery) {

      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      
      // Logam faptul că userul a făcut o căutare
      await logAction(user.id, 'TICKET_SEARCH', `Query: ${searchQuery}`, ip);
    }

    const { data: tickets, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ tickets }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Eroare la preluarea tichetelor.' }, { status: 500 });
  }
}
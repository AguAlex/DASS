import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Stergem cookie-ul de sesiune
  cookieStore.delete('session_token');

  return NextResponse.json({ message: 'Delogare completa' }, { status: 200 });
}
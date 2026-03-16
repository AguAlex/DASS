import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LogoutButton from './components/LogoutButton';

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token');

  // Dacă nu are token, îl redirecționăm la login (protecția rutei)
  if (!sessionToken) {
    redirect('/login');
  }

  let user = null;

  try {
    // VULNERABILITATEA 4.5: Decodăm token-ul slab direct din Base64
    const decodedPayload = Buffer.from(sessionToken.value, 'base64').toString('utf-8');
    user = JSON.parse(decodedPayload);
  } catch (error) {
    // Dacă token-ul e invalid/corupt, îl trimitem la login
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg w-full border border-gray-100">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
          Salut, {user?.email}! 👋
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Bine ai venit în aplicație. Te-ai autentificat cu succes.
        </p>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
          <p className="text-sm text-yellow-800 font-semibold">
            Detalii sesiune vulnerabilă:
          </p>
          <ul className="text-xs text-yellow-700 mt-2 list-disc pl-5">
            <li>Rol curent: <span className="font-bold">{user?.role}</span></li>
            <li>ID User: <span className="font-mono">{user?.id}</span></li>
          </ul>
        </div>

        <LogoutButton />
      </div>
    </div>
  );
}
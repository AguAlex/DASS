// app/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LogoutButton from './components/LogoutButton';
import TicketDashboard from './components/TicketDashboard';

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token');

  if (!sessionToken) {
    redirect('/login');
  }

  let user = null;

  try {
    // Aici decodăm informațiile de sesiune
    const decodedPayload = Buffer.from(sessionToken.value, 'base64').toString('utf-8');
    user = JSON.parse(decodedPayload);
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      {/* Container mai lat pentru a face loc dashboard-ului */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl border border-gray-200">
        
        {/* Header-ul paginii */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-600">
              Salut, {user?.email.split('@')[0]}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Acesta este spațiul tău securizat de lucru Deskly.
            </p>
          </div>
          
          <div className="text-right">
             <p className="text-xs text-gray-400 mb-2">Autentificat ca: <span className="font-bold text-gray-600">{user?.role}</span></p>
             <div className="w-32">
               <LogoutButton />
             </div>
          </div>
        </div>

        {/* Aici introducem componenta de Tichete și Căutare */}
        <TicketDashboard />

      </div>
    </div>
  );
}
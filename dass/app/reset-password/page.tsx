'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetForm() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setMessage(' Lipseste token-ul de resetare din URL');
    
    setIsLoading(true);
    setMessage('');

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (res.ok) {
      setMessage(` ${data.message} Te redirecționăm...`);
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setMessage(` Eroare: ${data.error}`);
    }
  };

  return (
    <form onSubmit={handleReset} className="space-y-4 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Noua Parolă</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
          required
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center items-center text-white p-2 rounded-md transition-colors ${
          isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {isLoading ? 'Se procesează...' : 'Schimbă Parola'}
      </button>
      {message && <p className="mt-4 text-sm text-center font-semibold text-black">{message}</p>}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-2 text-center text-black">Alege o nouă parolă</h1>
        <Suspense fallback={<p className="text-center text-black">Se încarcă...</p>}>
          <ResetForm />
        </Suspense>
        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">Înapoi la Login</Link>
        </div>
      </div>
    </div>
  );
}
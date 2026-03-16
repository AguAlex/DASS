'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setResetLink('');
    setIsLoading(true);

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (res.ok) {
      setMessage(` ${data.message}`);
      setResetLink(data.resetLink); // Afișăm link-ul pentru testare
    } else {
      setMessage(` Eroare: ${data.error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-black">
        <h1 className="text-2xl font-bold mb-6 text-center">Resetare Parolă</h1>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Introdu email-ul pentru a primi link-ul de resetare.
        </p>
        
        <form onSubmit={handleForgot} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
            {isLoading ? 'Se procesează...' : 'Trimite Link'}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-center font-semibold text-green-600">{message}</p>}
        
        {resetLink && (
          <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-sm overflow-hidden break-all">
            <p className="font-bold text-yellow-800">Link generat (Click pentru a testa):</p>
            <Link href={resetLink} className="text-blue-600 hover:underline">
              {resetLink}
            </Link>
          </div>
        )}

        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">Înapoi la Login</Link>
        </div>
      </div>
    </div>
  );
}
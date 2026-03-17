'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    try{
        const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
        setMessage(`Succes: ${data.message}`);
        setTimeout(() => {
            router.push('/login');
            }, 1500);
        } else {
        setMessage(`Eroare: ${data.error}`);
        setIsLoading(false);
        }
    } catch (error) {
      setMessage('A aparut o eroare la conectarea cu serverul.');
      setIsLoading(false);  
    }
  };

 return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Register</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? 'Se procesează...' : 'Creează Cont'}
        </button>
        </form>
        {message && <p className="mt-4 text-sm text-center text-red-600 font-semibold">{message}</p>}
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Ai deja un cont?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Autentifica-te aici
          </Link>
        </div>
      </div>
    </div>
  );
}
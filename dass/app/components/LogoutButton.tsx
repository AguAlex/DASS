'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await fetch('/api/auth/logout', { method: 'POST' });
        
        router.refresh(); 
        router.push('/login');
    };

return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`mt-6 w-full flex justify-center items-center text-white px-4 py-2 rounded-md transition-colors font-bold shadow-sm ${
        isLoggingOut ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
      }`}
    >
      {isLoggingOut && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {isLoggingOut ? 'Se deconectează...' : 'Deconectare (Logout)'}
    </button>
  );
}
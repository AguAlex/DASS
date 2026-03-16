'use client';

import { useState, useEffect } from 'react';

type Ticket = {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
};

export default function TicketDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('LOW');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Funcție pentru a prelua tichetele (cu sau fără căutare)
  const fetchTickets = async (query = '') => {
    try {
      const url = query ? `/api/tickets?search=${encodeURIComponent(query)}` : '/api/tickets';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Eroare la preluarea tichetelor', error);
    }
  };

  // Preluăm tichetele automat când se încarcă componenta
  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets(searchQuery);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, severity }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Tichet creat cu succes!');
        setTitle('');
        setDescription('');
        setSeverity('LOW');
        fetchTickets();
      } else {
        setMessage(`Eroare: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ A apărut o eroare de rețea.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000); 
    }
  };

  return (
    <div className="w-full mt-8 space-y-8 text-left">
      {/* SECTIUNEA 1: Formular Creare Tichet */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Creează un tichet nou (CRUD)</h2>
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titlu incident</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descriere detaliată</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black h-24"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Severitate</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black bg-white"
            >
              <option value="LOW">Scăzută (LOW)</option>
              <option value="MED">Medie (MED)</option>
              <option value="HIGH">Critică (HIGH)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors font-bold"
          >
            {isLoading ? 'Se salvează...' : 'Deschide Tichet'}
          </button>
        </form>
        {message && <p className="mt-3 text-sm font-semibold text-center">{message}</p>}
      </div>

      {/* SECTIUNEA 2: Căutare și Listare Tichete */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Tichete Active</h2>
          
          {/* Bara de Căutare (Search) */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Caută tichete..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md p-1 px-3 text-sm text-black"
            />
            <button type="submit" className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-black">
              Caută
            </button>
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); fetchTickets(''); }} 
                className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-200"
              >
                X
              </button>
            )}
          </form>
        </div>

        {/* Lista de tichete */}
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Nu a fost găsit niciun tichet.</p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="border border-gray-100 p-4 rounded-md hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-blue-700">{ticket.title}</h3>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      ticket.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                      ticket.severity === 'MED' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {ticket.severity}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-bold border border-gray-200">
                      {ticket.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{ticket.description}</p>
                <p className="text-gray-400 text-xs mt-3 text-right">
                  Creat la: {new Date(ticket.created_at).toLocaleString('ro-RO')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
import { expect, test, describe, vi } from 'vitest';

vi.mock('next/headers', () => {
  return {
    // Simulam functia cookies() care returneaza un obiect cu functia get()
    cookies: vi.fn().mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined), // Simulam ca nu exista cookie-ul 'session_token'
    }),
  };
});

import { POST, GET } from '../app/api/tickets/route';

describe('API Tickets - Security Tests', () => {
  
  test('trebuie să respingă crearea unui tichet dacă utilizatorul nu este logat (401 Unauthorized)', async () => {
    const req = new Request('http://localhost:3000/api/tickets', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test', description: 'Test', severity: 'LOW' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Trebuie să fii autentificat pentru a crea un tichet.');
  });

  test('trebuie să respingă citirea tichetelor dacă utilizatorul nu este logat', async () => {
    const req = new Request('http://localhost:3000/api/tickets');

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Acces interzis.');
  });

});
import { expect, test, describe } from 'vitest';
import { POST } from '../app/api/auth/register/route';

describe('API Register - Security Tests', () => {
  
  test('trebuie să respingă o parolă mai scurtă de 8 caractere (Fix 4.1)', async () => {
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@deskly.com', 
        password: '123' 
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Parola trebuie să aibă minim 8 caractere și să includă cel puțin o literă mare, una mică și un caracter special.');
  });

  test('trebuie să respingă cererea dacă lipsesc email-ul sau parola', async () => {
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@deskly.com' }), 
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email și parola sunt obligatorii');
  });

});
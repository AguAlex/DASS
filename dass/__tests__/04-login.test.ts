import { expect, test, describe } from 'vitest';
import { POST } from '../app/api/auth/login/route';

describe('API Login - Security Tests', () => {
  
  test('trebuie să blocheze utilizatorul după 5 încercări (Rate Limiting - Fix 4.3)', async () => {
    let response;
    let data;

    // Trimitem 6 request-uri simulate de pe acelasi IP
    for (let i = 0; i < 6; i++) {
      const req = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.168.1.100' }, // Simulam un IP fix al atacatorului
        body: JSON.stringify({ email: 'hacker@deskly.com', password: 'gresit' }),
      });
      
      response = await POST(req);
    }

    // Verificam rezultatul celei de-a 6-a incercari
    data = await response!.json();

    expect(response!.status).toBe(429);
    expect(data.error).toBe('Prea multe încercări eșuate. Cont blocat temporar (15 min).');
  });

});
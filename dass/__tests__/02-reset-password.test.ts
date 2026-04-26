import { expect, test, describe } from 'vitest';
import { POST } from '../app/api/auth/reset-password/route';

describe('API Reset Password - Security Tests', () => {
  
  test('trebuie să respingă o parolă nouă prea scurtă', async () => {
    const req = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'token-valid', newPassword: '123' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Parola nouă trebuie să aibă minim 8 caractere.');
  });

  test('trebuie să respingă un token JWT invalid sau falsificat (Fix 4.6)', async () => {
    const req = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ 
        token: '123123token', 
        newPassword: 'ParolaSuperSigura123!' 
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Token invalid sau expirat!');
  });

});
import { expect, test, describe, vi } from 'vitest';

// Mock-uim Supabase pentru a opri request-urile de retea care blocheaza testul
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

// Mock-uim Audit-ul pentru a nu incerca sa scrie in DB-ul fals
vi.mock('@/lib/audit', () => ({
  logAction: vi.fn().mockResolvedValue(true),
}));

// Mock-uim bcrypt pentru a nu consuma timp de procesor cu hashing-ul in teste
vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn().mockResolvedValue(false),
  }
}));

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

    data = await response!.json();

    expect(response!.status).toBe(429);
    expect(data.error).toBe('Prea multe încercări eșuate. Cont blocat temporar (15 min).');
  });

});
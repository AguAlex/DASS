import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    alias: {
      '@': path.resolve(__dirname, './'),
    },

    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test-dummy.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-dummy-key',
      JWT_SECRET: 'test-secret',
    }
  },
});
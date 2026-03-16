import { supabase } from './supabase';

export async function logAction(
  userId: string | null, 
  action: string, 
  resource: string, 
  ipAddress: string = '127.0.0.1'
) {
  try {
    await supabase.from('audit_logs').insert([
      {
        user_id: userId,
        action: action,
        resource: resource,
        ip_address: ipAddress,
      }
    ]);
  } catch (error) {
    console.error('Eroare la scrierea in audit log:', error);
  }
}
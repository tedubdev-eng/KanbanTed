import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://uznvsbcfheetopffyanw.supabase.co';

export const getSupabaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
};

export const getSupabaseAnonKey = (): string => {
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('pega_aqui')) {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('kanban_supabase_anon_key');
    if (saved && saved.trim().length > 10) return saved.trim();
  }
  return '';
};

export const setSupabaseAnonKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kanban_supabase_anon_key', key.trim());
    cachedClient = null; // Reset cached client
  }
};

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getAnonKeyInternal();
  return (
    typeof url === 'string' &&
    url.startsWith('https://') &&
    !url.includes('tu-proyecto') &&
    typeof key === 'string' &&
    key.length > 20 &&
    !key.includes('tu-anon')
  );
};

function getAnonKeyInternal(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('pega_aqui')) {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
  if (typeof window !== 'undefined') {
    return localStorage.getItem('kanban_supabase_anon_key') || '';
  }
  return '';
}

let cachedClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (cachedClient) return cachedClient;
  if (!isSupabaseConfigured()) return null;
  const url = getSupabaseUrl();
  const key = getAnonKeyInternal();
  cachedClient = createClient(url, key);
  return cachedClient;
};

export const supabase = typeof window === 'undefined' 
  ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? createClient(getSupabaseUrl(), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) : null)
  : getSupabase();

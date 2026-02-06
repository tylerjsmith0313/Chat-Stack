
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

export const getSupabaseConfig = () => {
  const config = localStorage.getItem('flourish_config');
  return config ? JSON.parse(config) : null;
};

export const initSupabase = () => {
  const config = getSupabaseConfig();
  if (!config || !config.supabaseUrl || !config.supabaseKey) {
    // Check environment variables if localStorage config isn't found (for production Vercel builds)
    const envUrl = (window as any).process?.env?.NEXT_PUBLIC_SUPABASE_URL;
    const envKey = (window as any).process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (envUrl && envKey) {
       return createClient(envUrl, envKey);
    }
    return null;
  }
  return createClient(config.supabaseUrl, config.supabaseKey);
};

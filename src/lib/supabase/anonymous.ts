import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAnonymousClient() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key) throw new Error("SUPABASE_PUBLIC_CONFIG_MISSING");
  return createSupabaseClient(url,key,{
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
  });
}

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// SERVICE ROLE — server-only. Never import this from client components or expose to browser.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

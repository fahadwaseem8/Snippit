"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SupabaseListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // The createClient() call automatically parses #access_token fragments
    // and sets the appropriate cookies. The listener below refreshes the 
    // page so Server Components can see the newly set cookie.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}

"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

export default function SupabaseListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session ? "Session found" : "No session");
      
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (session) {
          if (pathname === "/" || pathname === "/login" || pathname === "/register") {
            router.push("/dashboard");
          } else {
            router.refresh();
          }
        }
      } else if (event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  return null;
}

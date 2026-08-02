"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SupabaseListener() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");

    if (!access_token || !refresh_token) return;

    // Clear the ugly hash from the URL immediately
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    // POST the tokens to our server endpoint which writes proper SSR cookies
    fetch("/api/auth/exchange-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token, refresh_token, type }),
    }).then((res) => {
      if (res.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login?error=Invalid+or+expired+magic+link");
      }
    });
  }, [router]);

  return null;
}


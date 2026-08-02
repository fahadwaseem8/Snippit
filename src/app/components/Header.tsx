"use client";

import Link from "next/link";
import { LOGO_URL, APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-foreground/10">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_URL}
            alt={`${APP_NAME} Logo`}
            className="w-8 h-8"
          />
          <span>{APP_NAME}</span>
        </Link>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/fahadwaseem8/snippit"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

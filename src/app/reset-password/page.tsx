"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { LOGO_URL, APP_NAME } from "@/lib/constants";
import { useSingleFlight } from "@/lib/hooks/useSingleFlight";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const resetPasswordFlight = useSingleFlight();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const loading = resetPasswordFlight.isRunning;

  useEffect(() => {
    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPasswordFlight.run(async () => {
      setError("");

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      if (!token) {
        setError("Invalid or expired reset link. Please request a new one.");
        return;
      }

      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        });

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(data.error || "Failed to reset password");
          return;
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch {
        setError("An unexpected error occurred");
      }
    });
  };

  if (success) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="border border-green-500/30 rounded-lg bg-green-500/10 backdrop-blur-xl shadow-2xl p-8">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2 text-green-400">
              Password Reset!
            </h1>
            <p className="text-foreground/70 mb-4">
              Your password has been successfully reset.
            </p>
            <p className="text-sm text-foreground/50 font-mono">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-6 relative">
      {/* Terminal-style background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,currentColor_2px,currentColor_4px)]"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-2xl font-semibold mb-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_URL} alt={`${APP_NAME} Logo`} className="w-10 h-10" />
          <span>{APP_NAME}</span>
        </Link>

        {/* Terminal-style auth card */}
        <div className="border border-foreground/20 rounded-lg bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center justify-between px-4 py-3 bg-foreground/[0.08] border-b border-foreground/10">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="font-mono text-xs text-foreground/60 ml-2">
                ~/snippit/auth/reset
              </span>
            </div>
            <span className="font-mono text-xs text-foreground/40">⌘ K</span>
          </div>

          {/* Form content */}
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
              <p className="text-sm text-foreground/60">
                <span className="font-mono text-green-400">$</span> Enter your
                new password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 font-mono">
                  <span className="text-red-300">Error:</span> {error}
                </div>
              )}

              <div className="grid gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-mono text-foreground/70"
                >
                  <span className="text-blue-400">const</span> newPassword ={" "}
                  <span className="text-yellow-400">&quot;</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-black/40 border border-foreground/20 rounded-lg focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition font-mono text-sm placeholder:text-foreground/30"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-mono text-foreground/70"
                >
                  <span className="text-blue-400">const</span> confirmPassword ={" "}
                  <span className="text-yellow-400">&quot;</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-black/40 border border-foreground/20 rounded-lg focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition font-mono text-sm placeholder:text-foreground/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background px-4 py-3 rounded-lg font-medium hover:opacity-90 transition mt-2 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="text-yellow-400">⏳</span>{" "}
                    auth.resetPassword()...
                  </>
                ) : (
                  <>
                    <span className="text-green-400">→</span>{" "}
                    auth.resetPassword()
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/60">
                {`// `}Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-foreground hover:underline font-medium"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* CLI-style hint */}
        <div className="mt-4 text-center">
          <p className="text-xs text-foreground/40 font-mono">
            Password must be at least 6 characters
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen font-sans flex items-center justify-center p-6">
          <p className="text-foreground/60 font-mono">Loading...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

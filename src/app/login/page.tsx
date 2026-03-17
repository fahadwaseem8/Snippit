"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LOGO_URL, APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResetError(data.error || "Failed to send reset email");
        setResetLoading(false);
        return;
      }

      setResetSuccess(true);
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess(false);
        setResetEmail("");
      }, 3000);
    } catch {
      setResetError("An unexpected error occurred");
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-6 relative">
      {/* Terminal-style background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,currentColor_2px,currentColor_4px)]"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 text-2xl font-semibold mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={LOGO_URL}
            alt={`${APP_NAME} Logo`}
            className="w-10 h-10"
          />
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
              <span className="font-mono text-xs text-foreground/60 ml-2">~/snippit/auth/login</span>
            </div>
            <span className="font-mono text-xs text-foreground/40">⌘ K</span>
          </div>

          {/* Form content */}
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
              <p className="text-sm text-foreground/60">
                <span className="font-mono text-green-400">$</span> Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 font-mono">
                  <span className="text-red-300">Error:</span> {error}
                </div>
              )}

              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-mono text-foreground/70">
                  <span className="text-blue-400">const</span> email = <span className="text-yellow-400">&quot;</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-black/40 border border-foreground/20 rounded-lg focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition font-mono text-sm placeholder:text-foreground/30"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-mono text-foreground/70">
                  <span className="text-blue-400">const</span> password = <span className="text-yellow-400">&quot;</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-12 bg-black/40 border border-foreground/20 rounded-lg focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition font-mono text-sm placeholder:text-foreground/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="text-xs text-foreground/60 hover:text-foreground transition font-mono"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background px-4 py-3 rounded-lg font-medium hover:opacity-90 transition mt-2 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="text-yellow-400">⏳</span> auth.login()...
                  </>
                ) : (
                  <>
                    <span className="text-green-400">→</span> auth.login()
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/60">
                {`// `}Don&apos;t have an account?{" "}
                <Link href="/register" className="text-foreground hover:underline font-medium">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* CLI-style hint */}
        <div className="mt-4 text-center">
          <p className="text-xs text-foreground/40 font-mono">
            Press <kbd className="px-2 py-1 bg-foreground/10 rounded border border-foreground/20">Enter</kbd> to submit
          </p>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-md">
            <div className="border border-foreground/20 rounded-lg bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-4 py-3 bg-foreground/[0.08] border-b border-foreground/10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="font-mono text-xs text-foreground/60 ml-2">~/snippit/auth/reset</span>
                </div>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setResetError("");
                    setResetEmail("");
                  }}
                  className="text-foreground/60 hover:text-foreground transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal content */}
              <div className="p-8">
                {resetSuccess ? (
                  <div className="text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-xl font-bold mb-2 text-green-400">Check your email!</h2>
                    <p className="text-sm text-foreground/70">
                      We&apos;ve sent you a password reset link.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold mb-2">Reset Password</h2>
                      <p className="text-sm text-foreground/60">
                        <span className="font-mono text-green-400">$</span> Enter your email to receive a reset link
                      </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="grid gap-5">
                      {resetError && (
                        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 font-mono">
                          <span className="text-red-300">Error:</span> {resetError}
                        </div>
                      )}

                      <div className="grid gap-2">
                        <label htmlFor="resetEmail" className="text-sm font-mono text-foreground/70">
                          <span className="text-blue-400">const</span> email = <span className="text-yellow-400">&quot;</span>
                        </label>
                        <input
                          id="resetEmail"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full px-4 py-3 bg-black/40 border border-foreground/20 rounded-lg focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition font-mono text-sm placeholder:text-foreground/30"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full bg-foreground text-background px-4 py-3 rounded-lg font-medium hover:opacity-90 transition font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resetLoading ? (
                          <>
                            <span className="text-yellow-400">⏳</span> Sending...
                          </>
                        ) : (
                          <>
                            <span className="text-green-400">→</span> Send Reset Link
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

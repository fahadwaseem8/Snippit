'use client'

import { useEffect } from "react";
import CopySnippet from "./components/CopySnippet";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  useEffect(() => {
    // Log landing page visit
    const logVisit = async () => {
      try {
        await fetch('/api/health', {
          method: 'GET',
        })
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.error('Failed to log visit:', error)
      }
    }

    logVisit()
  }, [])

  return (
    <div className="min-h-screen font-sans flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
          <div className="grid gap-6">
            <div className="inline-block">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-foreground/10 text-foreground/70 border border-foreground/20">
                v1.0.0 // Open Beta
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              Save. Search.
              <br />
              <span className="text-foreground/60">Copy. Snippit.</span>
            </h1>
            <p className="text-foreground/70 text-lg max-w-xl leading-relaxed">
              Your lightweight home for code snippets. Collect your favorites, find them instantly with fuzzy search, and copy with one click. No bloat. Just speed.
            </p>
            <div className="flex gap-4 flex-wrap">
              <a
                href="/register"
                className="bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                Get started →
              </a>
              <a
                href="https://github.com/fahadwaseem8/snippit"
                target="_blank"
                rel="noreferrer"
                className="border border-foreground/20 px-6 py-3 rounded-lg font-medium hover:bg-foreground/5 transition"
              >
                Star on GitHub
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-30"></div>
            <div className="relative border border-foreground/20 rounded-2xl p-6 bg-background/80 backdrop-blur-sm">
              <CopySnippet />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 border-t border-foreground/10">
        <div className="max-w-7xl mx-auto grid gap-12">
          <div className="text-center grid gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for developers
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Snippit is designed to fit seamlessly into your workflow. Lightning fast, keyboard-first, and beautifully minimal.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border border-foreground/10 rounded-xl p-6 hover:border-foreground/20 transition bg-background/50">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Fuzzy search, instant results. Find your snippets in milliseconds, not minutes.
              </p>
            </div>

            <div className="border border-foreground/10 rounded-xl p-6 hover:border-foreground/20 transition bg-background/50">
              <div className="text-3xl mb-4">⌨️</div>
              <h3 className="text-xl font-semibold mb-2">Keyboard First</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Navigate, search, and copy without touching your mouse. Full vim-style bindings.
              </p>
            </div>

            <div className="border border-foreground/10 rounded-xl p-6 hover:border-foreground/20 transition bg-background/50">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Syntax Highlight</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Beautiful syntax highlighting for 100+ languages. Code never looked this good.
              </p>
            </div>

            <div className="border border-foreground/10 rounded-xl p-6 hover:border-foreground/20 transition bg-background/50">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Your snippets are private by default. They are only accessible to you.
              </p>
            </div>

            <div className="border border-foreground/10 rounded-xl p-6 hover:border-foreground/20 transition bg-background/50">
              <div className="text-3xl mb-4">🏷️</div>
              <h3 className="text-xl font-semibold mb-2">Smart Tags</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Organize with tags, folders, or just let search do the heavy lifting.
              </p>
            </div>

            <div className="border border-foreground/10 rounded-xl p-6 hover:border-foreground/20 transition bg-background/50">
              <div className="text-3xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">Sync Everywhere</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Access your snippets from any device. CLI, web, and mobile coming soon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-foreground/10">
        <div className="max-w-3xl mx-auto text-center grid gap-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Ready to stop searching for that snippet?
          </h2>
          <p className="text-foreground/60 text-lg">
            Join developers who&apos;ve already saved hours of copy-paste hunting.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/register"
              className="bg-foreground text-background px-8 py-4 rounded-lg font-medium text-lg hover:opacity-90 transition"
            >
              Get started — it&apos;s free
            </a>
            <a
              href="https://github.com/fahadwaseem8/snippit"
              target="_blank"
              rel="noreferrer"
              className="border border-foreground/20 px-8 py-4 rounded-lg font-medium text-lg hover:bg-foreground/5 transition"
            >
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

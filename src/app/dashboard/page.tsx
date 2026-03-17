"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SnippetCard from "../components/SnippetCard";
import SnippetModal from "../components/SnippetModal";
import { LOGO_URL, APP_NAME } from "@/lib/constants";

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "c",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "scala",
  "dart",
  "r",
  "sql",
  "html",
  "css",
  "scss",
  "sass",
  "less",
  "json",
  "yaml",
  "xml",
  "markdown",
  "bash",
  "shell",
  "powershell",
  "dockerfile",
  "graphql",
  "lua",
  "perl",
  "elixir",
  "clojure",
  "haskell",
  "ocaml",
  "fsharp",
  "vim",
  "makefile",
  "toml",
  "ini",
  "plaintext",
  "other",
];

export default function DashboardPage() {
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [favorites, setFavorites] = useState<Snippet[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingSnippets, setLoadingSnippets] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const data = (await response.json()) as {
          user?: { email?: string; id?: string };
        };

        if (!data.user?.id) {
          router.push("/login");
          return;
        }

        setUser({
          email: data.user.email || "",
          id: data.user.id,
        });
        setLoading(false);
      } catch {
        router.push("/login");
      }
    };

    checkUser();
  }, [router]);

  // Fetch snippets
  const fetchSnippets = async (
    pageNum: number,
    searchQuery: string,
    languageFilter: string,
    append = false,
  ) => {
    if (loadingSnippets) return;

    setLoadingSnippets(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (languageFilter) {
        params.append("language", languageFilter);
      }

      const response = await fetch(`/api/snippets?${params}`);
      const data = (await response.json()) as {
        snippets?: Snippet[];
        hasMore?: boolean;
      };

      if (response.ok) {
        const fetchedSnippets = data.snippets || [];
        if (append) {
          setSnippets((prev) => [...prev, ...fetchedSnippets]);
        } else {
          setSnippets(fetchedSnippets);
        }
        setHasMore(Boolean(data.hasMore));
      }
    } catch (error) {
      console.error("Failed to fetch snippets:", error);
    } finally {
      setLoadingSnippets(false);
    }
  };

  // Fetch favorites
  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/snippets?favorites=true&limit=5");
      const data = (await response.json()) as {
        snippets?: Snippet[];
      };

      if (response.ok) {
        setFavorites(data.snippets || []);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchSnippets(1, search, selectedLanguage);
      fetchFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search, selectedLanguage]);

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSnippets(nextPage, search, selectedLanguage, true);
  };

  // Handle search
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
    setHasMore(true);
  };

  // Handle search on Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      } else {
        setLoggingOut(false);
      }
    } catch {
      setLoggingOut(false);
    }
  };

  // Handle create/edit snippet
  const handleSaveSnippet = async (snippetData: {
    title: string;
    language: string;
    code: string;
    is_favorite: boolean;
  }) => {
    try {
      if (editingSnippet) {
        // Update existing snippet
        const response = await fetch(`/api/snippets/${editingSnippet.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snippetData),
        });

        if (response.ok) {
          setIsModalOpen(false);
          setEditingSnippet(null);
          setPage(1);
          fetchSnippets(1, search, selectedLanguage);
          fetchFavorites();
        }
      } else {
        // Create new snippet
        const response = await fetch("/api/snippets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snippetData),
        });

        if (response.ok) {
          setIsModalOpen(false);
          setPage(1);
          fetchSnippets(1, search, selectedLanguage);
          fetchFavorites();
        }
      }
    } catch (error) {
      console.error("Failed to save snippet:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/snippets/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSnippets((prev) => prev.filter((s) => s.id !== id));
        setFavorites((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete snippet:", error);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/snippets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: isFavorite }),
      });

      if (response.ok) {
        setSnippets((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, is_favorite: isFavorite } : s,
          ),
        );
        fetchFavorites();
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // Handle edit
  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center p-6">
        <p className="text-foreground/60 font-mono">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-foreground/10">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_URL} alt={`${APP_NAME} Logo`} className="w-8 h-8" />
            <span>{APP_NAME}</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground/60 font-mono hidden sm:inline">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm px-4 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition font-mono disabled:opacity-50"
            >
              {loggingOut ? "⏳ Logout..." : "← Logout"}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="🔍 Search snippets..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="flex-1 px-4 py-3 bg-black/40 border border-foreground/20 rounded-lg focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition font-mono text-sm"
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-3 bg-black/40 border border-foreground/20 rounded-lg focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition font-mono text-sm min-w-[160px]"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            disabled={loadingSnippets}
            className="px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition font-mono whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingSnippets ? "⏳ Searching..." : "Search"}
          </button>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>⭐</span> Favorites
              </h2>
            </div>
            <div className="grid gap-4">
              {favorites.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </div>
        )}

        {/* Snippets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Snippets</h2>
            <button
              onClick={() => {
                setEditingSnippet(null);
                setIsModalOpen(true);
              }}
              className="bg-foreground text-background px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition font-mono text-sm"
            >
              <span className="text-green-400">+</span> New Snippet
            </button>
          </div>
          {snippets.filter((s) => !s.is_favorite).length === 0 &&
          !loadingSnippets ? (
            <div className="text-center py-12 border border-foreground/10 rounded-lg bg-foreground/[0.02]">
              <p className="text-foreground/60 font-mono mb-4">
                {snippets.length === 0
                  ? "No snippets yet!"
                  : "All your snippets are favorites!"}
              </p>
              {snippets.length === 0 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition font-mono"
                >
                  Create your first snippet
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {snippets
                .filter((snippet) => !snippet.is_favorite)
                .map((snippet) => (
                  <SnippetCard
                    key={snippet.id}
                    snippet={snippet}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={handleEdit}
                  />
                ))}
            </div>
          )}

          {/* Load More button */}
          {hasMore && snippets.length > 0 && (
            <div className="text-center py-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingSnippets}
                className="px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingSnippets ? "⏳ Loading..." : "↓ Load More"}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <SnippetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSnippet(null);
        }}
        onSave={handleSaveSnippet}
        editingSnippet={editingSnippet}
      />
    </div>
  );
}

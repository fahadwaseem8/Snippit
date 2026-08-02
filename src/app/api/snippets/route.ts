import { NextRequest, NextResponse } from "next/server";
import { withAPILogging } from "@/lib/api-logger";
import { createClient } from "@/lib/supabase/server";

interface SnippetRow {
  id: string;
  title: string;
  language: string;
  code: string;
  is_favorite: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

function normalizeSnippet(row: SnippetRow) {
  return {
    id: row.id,
    title: row.title,
    language: row.language,
    code: row.code,
    is_favorite: Boolean(row.is_favorite),
    owner_id: row.owner_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// GET /api/snippets - List snippets with pagination and search
export async function GET(request: NextRequest) {
  return withAPILogging(request, async () => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const search = searchParams.get("search") || "";
      const language = searchParams.get("language") || "";
      const favorites = searchParams.get("favorites") === "true";

      const safePage = Number.isFinite(page) && page > 0 ? page : 1;
      const safeLimit =
        Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;
      const offset = (safePage - 1) * safeLimit;

      let query = supabase
        .from("snippets")
        .select("*", { count: "exact" })
        .eq("owner_id", user.id);

      if (favorites) {
        query = query.eq("is_favorite", 1);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,code.ilike.%${search}%`);
      }

      if (language) {
        query = query.eq("language", language);
      }

      const { data, error, count } = await query
        .order("updated_at", { ascending: false })
        .range(offset, offset + safeLimit - 1);

      if (error) {
        throw error;
      }

      const total = count || 0;

      return NextResponse.json({
        snippets: (data || []).map(normalizeSnippet),
        total,
        page: safePage,
        limit: safeLimit,
        hasMore: offset + safeLimit < total,
      });
    } catch (error) {
      console.error("List snippets error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }
  });
}

// POST /api/snippets - Create new snippet
export async function POST(request: NextRequest) {
  return withAPILogging(request, async () => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = (await request.json()) as {
        title?: unknown;
        language?: unknown;
        code?: unknown;
        is_favorite?: unknown;
      };
      const title = typeof body.title === "string" ? body.title : "";
      const language = typeof body.language === "string" ? body.language : "";
      const code = typeof body.code === "string" ? body.code : "";
      const isFavorite = Boolean(body.is_favorite);

      if (!title || !code) {
        return NextResponse.json(
          { error: "Title and code are required" },
          { status: 400 },
        );
      }

      const { data, error } = await supabase
        .from("snippets")
        .insert({
          title,
          language: language || "plaintext",
          code,
          is_favorite: isFavorite ? 1 : 0,
          owner_id: user.id,
        })
        .select("*")
        .single();

      if (error || !data) {
        throw error || new Error("Snippet creation failed");
      }

      return NextResponse.json(
        { snippet: normalizeSnippet(data) },
        { status: 201 },
      );
    } catch (error) {
      console.error("Create snippet error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }
  });
}

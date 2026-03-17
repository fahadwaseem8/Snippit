import { NextRequest, NextResponse } from "next/server";
import { withAPILogging } from "@/lib/api-logger";
import { d1Execute, d1Rows, ensureD1Schema } from "@/lib/d1";
import { getSessionFromRequest } from "@/lib/auth/session";

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
      await ensureD1Schema();
      const session = await getSessionFromRequest(request);
      const user = session?.user;

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

      const whereClauses: string[] = ["owner_id = ?"];
      const whereParams: Array<string | number | null> = [user.id];

      if (favorites) {
        whereClauses.push("is_favorite = 1");
      }

      if (search) {
        const term = `%${search.toLowerCase()}%`;
        whereClauses.push("(LOWER(title) LIKE ? OR LOWER(code) LIKE ?)");
        whereParams.push(term, term);
      }

      if (language) {
        whereClauses.push("language = ?");
        whereParams.push(language);
      }

      const whereSQL = whereClauses.join(" AND ");

      const totalRows = await d1Rows<{ total: number }>(
        `SELECT COUNT(*) as total FROM snippets WHERE ${whereSQL}`,
        whereParams,
      );

      const data = await d1Rows<SnippetRow>(
        `
        SELECT id, title, language, code, is_favorite, owner_id, created_at, updated_at
        FROM snippets
        WHERE ${whereSQL}
        ORDER BY updated_at DESC
        LIMIT ? OFFSET ?
        `,
        [...whereParams, safeLimit, offset],
      );

      const total = Number(totalRows[0]?.total || 0);

      return NextResponse.json({
        snippets: data.map(normalizeSnippet),
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
      await ensureD1Schema();
      const session = await getSessionFromRequest(request);
      const user = session?.user;

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

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await d1Execute(
        `
        INSERT INTO snippets (id, title, language, code, is_favorite, owner_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          id,
          title,
          language || "plaintext",
          code,
          isFavorite ? 1 : 0,
          user.id,
          now,
          now,
        ],
      );

      const rows = await d1Rows<SnippetRow>(
        `
        SELECT id, title, language, code, is_favorite, owner_id, created_at, updated_at
        FROM snippets
        WHERE id = ?
        LIMIT 1
        `,
        [id],
      );

      return NextResponse.json(
        { snippet: normalizeSnippet(rows[0]) },
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

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

// PATCH /api/snippets/[id] - Update snippet
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAPILogging(request, async () => {
    try {
      await ensureD1Schema();
      const session = await getSessionFromRequest(request);
      const user = session?.user;

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id } = await params;
      const body = (await request.json()) as {
        title?: unknown;
        language?: unknown;
        code?: unknown;
        is_favorite?: unknown;
      };
      const { title, language, code, is_favorite } = body;

      const setClauses: string[] = [];
      const paramsList: Array<string | number | null> = [];

      if (title !== undefined) {
        if (typeof title !== "string") {
          return NextResponse.json(
            { error: "title must be a string" },
            { status: 400 },
          );
        }
        setClauses.push("title = ?");
        paramsList.push(title);
      }

      if (language !== undefined) {
        if (typeof language !== "string") {
          return NextResponse.json(
            { error: "language must be a string" },
            { status: 400 },
          );
        }
        setClauses.push("language = ?");
        paramsList.push(language);
      }

      if (code !== undefined) {
        if (typeof code !== "string") {
          return NextResponse.json(
            { error: "code must be a string" },
            { status: 400 },
          );
        }
        setClauses.push("code = ?");
        paramsList.push(code);
      }

      if (is_favorite !== undefined) {
        setClauses.push("is_favorite = ?");
        paramsList.push(is_favorite ? 1 : 0);
      }

      if (setClauses.length === 0) {
        return NextResponse.json(
          { error: "No fields to update" },
          { status: 400 },
        );
      }

      setClauses.push("updated_at = ?");
      paramsList.push(new Date().toISOString());

      const result = await d1Execute(
        `UPDATE snippets SET ${setClauses.join(", ")} WHERE id = ? AND owner_id = ?`,
        [...paramsList, id, user.id],
      );

      if (result.changes === 0) {
        return NextResponse.json(
          { error: "Snippet not found" },
          { status: 404 },
        );
      }

      const rows = await d1Rows<SnippetRow>(
        `
        SELECT id, title, language, code, is_favorite, owner_id, created_at, updated_at
        FROM snippets
        WHERE id = ? AND owner_id = ?
        LIMIT 1
        `,
        [id, user.id],
      );

      const data = rows[0];

      return NextResponse.json({ snippet: normalizeSnippet(data) });
    } catch (error) {
      console.error("Update snippet error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }
  });
}

// DELETE /api/snippets/[id] - Delete snippet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAPILogging(request, async () => {
    try {
      await ensureD1Schema();
      const session = await getSessionFromRequest(request);
      const user = session?.user;

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id } = await params;

      await d1Execute(`DELETE FROM snippets WHERE id = ? AND owner_id = ?`, [
        id,
        user.id,
      ]);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Delete snippet error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }
  });
}

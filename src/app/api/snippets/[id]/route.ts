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

// PATCH /api/snippets/[id] - Update snippet
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAPILogging(request, async () => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

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

      const updates: Record<string, unknown> = {};

      if (title !== undefined) {
        if (typeof title !== "string") {
          return NextResponse.json(
            { error: "title must be a string" },
            { status: 400 },
          );
        }
        updates.title = title;
      }

      if (language !== undefined) {
        if (typeof language !== "string") {
          return NextResponse.json(
            { error: "language must be a string" },
            { status: 400 },
          );
        }
        updates.language = language;
      }

      if (code !== undefined) {
        if (typeof code !== "string") {
          return NextResponse.json(
            { error: "code must be a string" },
            { status: 400 },
          );
        }
        updates.code = code;
      }

      if (is_favorite !== undefined) {
        updates.is_favorite = is_favorite ? 1 : 0;
      }

      if (Object.keys(updates).length === 0) {
        return NextResponse.json(
          { error: "No fields to update" },
          { status: 400 },
        );
      }

      const { data, error } = await supabase
        .from("snippets")
        .update(updates)
        .eq("id", id)
        .eq("owner_id", user.id)
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return NextResponse.json(
            { error: "Snippet not found" },
            { status: 404 },
          );
        }
        throw error;
      }

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
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id } = await params;

      const { error } = await supabase
        .from("snippets")
        .delete()
        .eq("id", id)
        .eq("owner_id", user.id);

      if (error) {
        throw error;
      }

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

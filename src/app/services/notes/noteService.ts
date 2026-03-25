import type { StickyNote } from "../../types/note";
import { backendJSON } from "../backendJson";
import { getDataMode } from "../dataMode";

const NOTES_KEY = "notes";
const ARCHIVED_KEY = "archived_notes";

function normalizeNote(n: Partial<StickyNote> & Record<string, unknown>): StickyNote {
  const x = Number(n.x);
  const y = Number(n.y);
  const width = Number(n.width);
  const height = Number(n.height);
  return {
    id: String(n.id ?? ""),
    x: Number.isFinite(x) ? x : 100,
    y: Number.isFinite(y) ? y : 120,
    width: Number.isFinite(width) ? width : 380,
    height: Number.isFinite(height) ? height : 300,
    title: typeof n.title === "string" ? n.title : "",
    body: typeof n.body === "string" ? n.body : "",
    color: typeof n.color === "string" ? n.color : "bg-pink",
    updatedAt: typeof n.updatedAt === "string" ? n.updatedAt : undefined,
    timestamp: typeof n.timestamp === "string" ? n.timestamp : undefined,
    links: Array.isArray(n.links) ? (n.links as string[]) : [],
    archived: Boolean(n.archived),
    boardId: typeof n.boardId === "string" ? n.boardId : undefined,
  };
}

/** Map API (snake_case) to UI note. */
export function backendNoteToSticky(raw: Record<string, unknown>): StickyNote {
  const updated =
    (raw.updated_at as string | undefined) ||
    (raw.updatedAt as string | undefined);
  const ts =
    updated && !Number.isNaN(Date.parse(updated))
      ? new Date(updated).toLocaleString()
      : new Date().toLocaleString();

  const bodyRaw = raw.body ?? raw.content;
  const linksRaw = raw.links;
  const boardIdRaw = raw.board_id ?? raw.boardId;
  return normalizeNote({
    id: raw.id != null ? String(raw.id) : "",
    x: Number(raw.position_x ?? raw.positionX ?? raw.x ?? 0),
    y: Number(raw.position_y ?? raw.positionY ?? raw.y ?? 0),
    width: Number(raw.width ?? 380),
    height: Number(raw.height ?? 300),
    title: raw.title != null ? String(raw.title) : "",
    body: typeof bodyRaw === "string" ? bodyRaw : "",
    color: raw.color != null ? String(raw.color) : undefined,
    updatedAt: updated,
    timestamp: ts,
    links: Array.isArray(linksRaw) ? (linksRaw as string[]) : [],
    archived: Boolean(raw.archived),
    boardId:
      boardIdRaw != null && String(boardIdRaw).trim() !== ""
        ? String(boardIdRaw)
        : undefined,
  });
}

function stickyToBackendPayload(note: StickyNote, userId: string) {
  const payload: Record<string, unknown> = {
    id: note.id,
    user_id: userId,
    title: note.title ?? "",
    body: note.body ?? "",
    color: note.color ?? "bg-pink",
    position_x: note.x,
    position_y: note.y,
    width: note.width,
    height: note.height,
    links: note.links ?? [],
    archived: note.archived ?? false,
    updated_at: new Date().toISOString(),
  };
  if (note.boardId) {
    payload.board_id = note.boardId;
  }
  return payload;
}

function loadMockJson(key: string): StickyNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw).map((n: Record<string, unknown>) =>
      normalizeNote(n as Partial<StickyNote>)
    );
  } catch {
    return [];
  }
}

export async function fetchNotes(userId: string | undefined): Promise<{
  active: StickyNote[];
  archived: StickyNote[];
}> {
  if (getDataMode() === "mock") {
    return {
      active: loadMockJson(NOTES_KEY),
      archived: loadMockJson(ARCHIVED_KEY),
    };
  }
  if (!userId) {
    return { active: [], archived: [] };
  }

  const raw = await backendJSON<Record<string, unknown>[]>(
    `/user/${encodeURIComponent(userId)}/note/`,
    { method: "GET" }
  );

  const all = raw.map(backendNoteToSticky);
  const active = all.filter((n) => !n.archived);
  const archived = all.filter((n) => n.archived);
  return { active, archived };
}

export async function createNote(
  userId: string | undefined,
  note: StickyNote
): Promise<StickyNote> {
  if (getDataMode() === "mock") {
    return note;
  }
  if (!userId) {
    throw new Error("createNote requires userId in backend mode");
  }

  const payload = stickyToBackendPayload(note, userId);
  const res = await backendJSON<{ note_id?: string }>(`/user/note`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const id = String(res.note_id ?? note.id);
  const updatedAt =
    typeof payload.updated_at === "string"
      ? payload.updated_at
      : new Date().toISOString();
  return { ...note, id, updatedAt };
}

export async function saveNote(
  userId: string | undefined,
  note: StickyNote
): Promise<void> {
  if (getDataMode() === "mock") {
    return;
  }
  if (!userId) {
    throw new Error("saveNote requires userId in backend mode");
  }

  const payload = stickyToBackendPayload(note, userId);
  await backendJSON(`/user/${encodeURIComponent(userId)}/note/${encodeURIComponent(note.id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteNote(
  userId: string | undefined,
  noteId: string
): Promise<void> {
  if (getDataMode() === "mock") {
    return;
  }
  if (!userId) {
    throw new Error("deleteNote requires userId in backend mode");
  }

  await backendJSON(
    `/user/${encodeURIComponent(userId)}/note/${encodeURIComponent(noteId)}`,
    { method: "DELETE" }
  );
}

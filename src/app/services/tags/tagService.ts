import { Tag } from "../../types";
import { getDataMode } from "../dataMode";

const BACKEND_PROXY_PREFIX = "/api/backend";

function backendUrl(path: string) {
  return `${BACKEND_PROXY_PREFIX}${path.startsWith("/") ? "" : "/"}${path}`;
}

function backendTagToUI(raw: any): Tag {
  return {
    id: String(raw.id),
    name: raw.name ?? "Untitled",
    backgroundColor: raw.background_color ?? "#e5e5e5",
    borderColor: raw.border_color ?? "#bdbdbd",
    textColor: raw.text_color ?? "#333333",
  };
}

// Accepts "any" raw data and ensures it becomes a typed Tag (UI shape)
export function toTag(raw: any): Tag {
  return {
    id: String(raw.id),
    name: raw.name ?? "Untitled",
    backgroundColor: raw.backgroundColor ?? "#e5e5e5",
    borderColor: raw.borderColor ?? "#bdbdbd",
    textColor: raw.textColor ?? "#333333",
  };
}

async function backendJSON<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(backendUrl(path), init);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Backend request failed (${res.status})`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return text as any as T;
  }
}

const TAGS_KEY = "tags";

async function fetchTagsMock(): Promise<Tag[]> {
  await new Promise((r) => setTimeout(r, 500));

  if (localStorage.getItem(TAGS_KEY)) {
    return JSON.parse(localStorage.getItem(TAGS_KEY) || "[]").map(toTag);
  }

  const raw = [
    { id: "1", name: "urgent", backgroundColor: "#F3E8FF", borderColor: "#E9D5FF", textColor: "#6B21A8" },
    { id: "2", name: "design", backgroundColor: "#DBEAFE", borderColor: "#BFD7FE", textColor: "#1E40AF" },
    { id: "3", name: "review", backgroundColor: "#F6FBC0", borderColor: "#E2EF50", textColor: "#909D00" },
    { id: "4", name: "frontend", backgroundColor: "#DCFCE7", borderColor: "#B8EBCA", textColor: "#166534" },
    { id: "5", name: "bug", backgroundColor: "#FEE2E2", borderColor: "#FECACA", textColor: "#DC2626" },
    { id: "6", name: "devops", backgroundColor: "#D7F8FD", borderColor: "#9BF2FF", textColor: "#20A6BB" },
    { id: "7", name: "presentation", backgroundColor: "#EFE6F1", borderColor: "#DFCAE1", textColor: "#95589D" },
    { id: "8", name: "tag1", backgroundColor: "#EFE6F1", borderColor: "#DFCAE1", textColor: "#95589D" },
    { id: "9", name: "tag2", backgroundColor: "#EFE6F1", borderColor: "#DFCAE1", textColor: "#95589D" },
    { id: "10", name: "tag3", backgroundColor: "#EFE6F1", borderColor: "#DFCAE1", textColor: "#95589D" },
    { id: "11", name: "tag4", backgroundColor: "#EFE6F1", borderColor: "#DFCAE1", textColor: "#95589D" },
  ];

  localStorage.setItem(TAGS_KEY, JSON.stringify(raw));
  return raw.map(toTag);
}

async function createTagMock(data: Partial<Tag>): Promise<Tag> {
  const tags = JSON.parse(localStorage.getItem(TAGS_KEY) || "[]").map(toTag);
  const newTag: Tag = {
    id: String(Date.now()),
    name: data.name ?? "New Tag",
    backgroundColor: data.backgroundColor ?? "#E0E0E0",
    textColor: data.textColor ?? "#333333",
    borderColor: data.borderColor ?? "#999999",
  };
  const updated = [...tags, newTag];
  localStorage.setItem(TAGS_KEY, JSON.stringify(updated));
  return newTag;
}

async function updateTagMock(updatedTag: Tag): Promise<Tag> {
  const tags = JSON.parse(localStorage.getItem(TAGS_KEY) || "[]").map(toTag);
  const updated = tags.map((t: Tag) => (t.id === updatedTag.id ? updatedTag : t));
  localStorage.setItem(TAGS_KEY, JSON.stringify(updated));
  return updatedTag;
}

export async function fetchTags(userId?: string): Promise<Tag[]> {
  if (getDataMode() === "mock") {
    return fetchTagsMock();
  }

  if (!userId) {
    // Auth/session not ready yet (or backend mode without user context).
    // Avoid crashing the app; tags will load once userId is available.
    return [];
  }

  const raw = await backendJSON<any[]>(`/user/${encodeURIComponent(userId)}/tag/`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });

  return raw.map(backendTagToUI);
}

export async function createTag(
  data: Partial<Tag>,
  userId?: string
): Promise<Tag> {
  if (getDataMode() === "mock") {
    return createTagMock(data);
  }
  if (!userId) {
    throw new Error("createTag requires userId in backend mode");
  }

  const payload = {
    user_id: userId,
    name: data.name ?? "New Tag",
    background_color: data.backgroundColor ?? "#E0E0E0",
    border_color: data.borderColor ?? "#999999",
    text_color: data.textColor ?? "#333333",
  };

  const res = await backendJSON<{ tag_id?: string }>(`/user/tag`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  return {
    id: String(res.tag_id ?? ""),
    name: payload.name,
    backgroundColor: payload.background_color,
    borderColor: payload.border_color,
    textColor: payload.text_color,
  };
}

export async function updateTag(
  updatedTag: Tag,
  userId?: string
): Promise<Tag> {
  if (getDataMode() === "mock") {
    return updateTagMock(updatedTag);
  }
  if (!userId) {
    throw new Error("updateTag requires userId in backend mode");
  }

  await backendJSON(`/user/${encodeURIComponent(userId)}/tag/${encodeURIComponent(updatedTag.id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      id: updatedTag.id,
      name: updatedTag.name,
      background_color: updatedTag.backgroundColor,
      border_color: updatedTag.borderColor,
      text_color: updatedTag.textColor,
    }),
  });

  return updatedTag;
}

import { Tag } from "../../types";
import { API_BASE, ROUTES } from "../../utils/routes";
import { API_BASE, ROUTES } from "../../utils/routes";

// Accepts "any" raw data and ensures it becomes a typed Tag
export function toTag(raw: any): Tag {
  return {
    id: raw.id,
    name: raw.name ?? "Untitled",
    backgroundColor: raw.background_color ?? "#e5e5e5",
    borderColor: raw.border_color ?? "#bdbdbd",
    textColor: raw.text_color ?? "#333333",
    backgroundColor: raw.background_color ?? "#e5e5e5",
    borderColor: raw.border_color ?? "#bdbdbd",
    textColor: raw.text_color ?? "#333333",
  };
}

export async function fetchTags(email: string): Promise<Tag[]> {
  if (!email) {
    return []
  }
  const res = await fetch(
    `${API_BASE}${ROUTES.userTags(email)}`,
export async function fetchTags(email: string): Promise<Tag[]> {
  if (!email) {
    return []
  }
  const res = await fetch(
    `${API_BASE}${ROUTES.userTags(email)}`,
    {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    }
  );
  
  if (!res.ok) {
    throw new Error(`Failed to fetch boards: ${res.status} ${res.statusText}`);
  }
  
  const raw = await res.json();
  return raw.map(toTag);
}


export function createTag(data: Partial<Tag>): Tag {
  const tags = JSON.parse(localStorage.getItem("tags") || "[]").map(toTag);

  const newTag: Tag = {
    id: Math.max(0, ...tags.map((t: Tag) => t.id)) + 1,
    name: data.name ?? "New Tag",
    backgroundColor: data.backgroundColor ?? "#E0E0E0",
    textColor: data.textColor ?? "#333333",
    borderColor: data.borderColor ?? "#999999",
  };

  const updated = [...tags, newTag];
  localStorage.setItem("tags", JSON.stringify(updated));
  return newTag;
}

export function updateTag(updatedTag: Tag) {
  const tags = JSON.parse(localStorage.getItem("tags") || "[]").map(toTag);

  const updated = tags.map((t: Tag) =>
    t.id === updatedTag.id ? updatedTag : t
  );

  localStorage.setItem("tags", JSON.stringify(updated));
  return updated;
}

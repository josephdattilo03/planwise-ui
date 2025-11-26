import { Tag } from "../../types";

// Accepts "any" raw data and ensures it becomes a typed Tag
export function toTag(raw: any): Tag {
  return {
    id: raw.id,
    name: raw.name ?? "Untitled",
    backgroundColor: raw.backgroundColor ?? "#e5e5e5",
    borderColor: raw.borderColor ?? "#bdbdbd",
    textColor: raw.textColor ?? "#333333",
  };
}

export async function fetchTags(): Promise<Tag[]> {
  await new Promise((r) => setTimeout(r, 500));

  if (localStorage.getItem("tags")) {
    return JSON.parse(localStorage.getItem("tags") || "[]").map(toTag);
  }

  const raw = [
    {
      id: 1,
      name: "urgent",
      backgroundColor: "#F3E8FF",
      borderColor: "#E9D5FF",
      textColor: "#6B21A8",
    },
    {
      id: 2,
      name: "design",
      backgroundColor: "#DBEAFE",
      borderColor: "#BFD7FE",
      textColor: "#1E40AF",
    },
    {
      id: 3,
      name: "review",
      backgroundColor: "#F6FBC0",
      borderColor: "#E2EF50",
      textColor: "#909D00",
    },
    {
      id: 4,
      name: "frontend",
      backgroundColor: "#DCFCE7",
      borderColor: "#B8EBCA",
      textColor: "#166534",
    },
    {
      id: 5,
      name: "bug",
      backgroundColor: "#FEE2E2",
      borderColor: "#FECACA",
      textColor: "#DC2626",
    },
    {
      id: 6,
      name: "devops",
      backgroundColor: "#D7F8FD",
      borderColor: "#9BF2FF",
      textColor: "#20A6BB",
    },
    {
      id: 7,
      name: "presentation",
      backgroundColor: "#EFE6F1",
      borderColor: "#DFCAE1",
      textColor: "#95589D",
    },
    {
      id: 8,
      name: "tag1",
      backgroundColor: "#EFE6F1",
      borderColor: "#DFCAE1",
      textColor: "#95589D",
    },
    {
      id: 9,
      name: "tag2",
      backgroundColor: "#EFE6F1",
      borderColor: "#DFCAE1",
      textColor: "#95589D",
    },
    {
      id: 10,
      name: "tag3",
      backgroundColor: "#EFE6F1",
      borderColor: "#DFCAE1",
      textColor: "#95589D",
    },
    {
      id: 11,
      name: "tag4",
      backgroundColor: "#EFE6F1",
      borderColor: "#DFCAE1",
      textColor: "#95589D",
    },
  ];

  localStorage.setItem("tags", JSON.stringify(raw));

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

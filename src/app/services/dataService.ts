import { Board, Tag } from "../types";

function toBoard(raw: any): Board {
  return {
    id: raw.id,
    name: raw.name ?? "Untitled Board",
    color: raw.color ?? "#4a7c59",
  };
}

// Accepts "any" raw data and ensures it becomes a typed Tag
function toTag(raw: any): Tag {
  return {
    id: raw.id,
    name: raw.name ?? "Untitled",
    backgroundColor: raw.backgroundColor ?? "#e5e5e5",
    borderColor: raw.borderColor ?? "#bdbdbd",
    textColor: raw.textColor ?? "#333333",
  };
}

export async function fetchBoards() {
  await new Promise((r) => setTimeout(r, 500)); // simulates network delay
  const raw = [
    { id: "1", name: "Senior Design", color: "#A7C957" },
    { id: "2", name: "PennOS", color: "#FFA500" },
    { id: "3", name: "DSGN 1070", color: "#E4CCFD" },
    { id: "4", name: "House", color: "#1E40AF" },
    { id: "5", name: "Personal", color: "#9BF2FF" },
    { id: "6", name: "Recruiting", color: "#9AC2FF" },
    { id: "7", name: "Grad School", color: "#2AC200" },
  ];

  return raw.map(toBoard);
}

export async function fetchTags() {
  await new Promise((r) => setTimeout(r, 500));
  const raw = [
    {
      id: "1",
      name: "urgent",
      backgroundColor: "#F3E8FF",
      borderColor: "#E9D5FF",
      textColor: "#6B21A8",
    },
    {
      id: "2",
      name: "design",
      backgroundColor: "#DBEAFE",
      borderColor: "#BFD7FE",
      textColor: "#1E40AF",
    },
    {
      id: "3",
      name: "review",
      backgroundColor: "#F6FBC0",
      borderColor: "#E2EF50",
      textColor: "#909D00",
    },
    {
      id: "4",
      name: "frontend",
      backgroundColor: "#DCFCE7",
      borderColor: "#B8EBCA",
      textColor: "#166534",
    },
    {
      id: "5",
      name: "bug",
      backgroundColor: "#FEE2E2",
      borderColor: "#FECACA",
      textColor: "#DC2626",
    },
    {
      id: "6",
      name: "devops",
      backgroundColor: "#D7F8FD",
      borderColor: "#9BF2FF",
      textColor: "#20A6BB",
    },
    {
      id: "7",
      name: "presentation",
      backgroundColor: "#EFE6F1",
      borderColor: "#DFCAE1",
      textColor: "#95589D",
    },
    {
      id: "8",
      name: "tag1",
      backgroundColor: "#EFE6F1",
      borderColor: "#DFCAE1",
      textColor: "#95589D",
    },
    {
      id: "9",
      name: "tag2",
      backgroundColor: "#EFE6F1",
      borderColor: "#DFCAE1",
      textColor: "#95589D",
    },
    {
      id: "10",
      name: "tag3",
      backgroundColor: "#EFE6F1",
      borderColor: "#DFCAE1",
      textColor: "#95589D",
    },
    {
      id: "11",
      name: "tag4",
      backgroundColor: "#EFE6F1",
      borderColor: "#DFCAE1",
      textColor: "#95589D",
    },
  ];

  return raw.map(toTag);
}

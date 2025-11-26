import { Board } from "../../types";

function toBoard(raw: any): Board {
  return {
    id: raw.id,
    name: raw.name ?? "Untitled Board",
    color: raw.color ?? "#4a7c59",
  };
}

export async function fetchBoards() {
  await new Promise((r) => setTimeout(r, 500)); // simulates network delay

  if (localStorage.getItem("boards")) {
    return JSON.parse(localStorage.getItem("boards") || "[]").map(toBoard);
  }

  const raw = [
    { id: 1, name: "Senior Design", color: "#A7C957" },
    { id: 2, name: "PennOS", color: "#FFA500" },
    { id: 3, name: "DSGN 1070", color: "#E4CCFD" },
    { id: 4, name: "House", color: "#1E40AF" },
    { id: 5, name: "Personal", color: "#9BF2FF" },
    { id: 6, name: "Recruiting", color: "#9AC2FF" },
    { id: 7, name: "Grad School", color: "#2AC200" },
  ];

  localStorage.setItem("boards", JSON.stringify(raw));

  return raw.map(toBoard);
}

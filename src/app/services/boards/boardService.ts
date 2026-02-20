import { Board } from "../../types";
import { API_BASE, ROUTES } from "../../utils/routes";

function toBoard(raw: any): Board {
  return {
    id: raw.id,
    name: raw.name ?? "Untitled Board",
    color: raw.color ?? "#4a7c59",
  };
}

export async function fetchBoards(email: string): Promise<Board[]> {
  if (!email) {
    return []
  }
  const res = await fetch(
    `${API_BASE}${ROUTES.userBoards(email)}`,
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
  console.log(raw)
  return raw.map(toBoard);
}

export function createBoard(name: string, color: string): Board {
  // Get existing boards from localStorage
  const existingRaw = JSON.parse(localStorage.getItem("boards") || "[]");

  // Generate a unique ID
  const newId = `board-${Date.now()}`;

  const newBoard: Board = {
    id: newId,
    name,
    color,
  };

  // Add new board and save back to localStorage
  const updatedBoards = [...existingRaw, newBoard];
  localStorage.setItem("boards", JSON.stringify(updatedBoards));

  return newBoard;
}

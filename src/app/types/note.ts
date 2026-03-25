/** Sticky note on the canvas (UI + API-aligned fields). */
export interface StickyNote {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  body: string;
  color?: string;
  /** ISO timestamp from backend; display string may be derived in components */
  updatedAt?: string;
  timestamp?: string;
  /** Optional board association (API `board_id`) */
  boardId?: string;
  links?: string[];
  archived?: boolean;
}

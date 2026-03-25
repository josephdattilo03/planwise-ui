"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import { IconButton, Tooltip } from "@mui/material";
import { useSession } from "next-auth/react";
import EditableNote from "./EditableNote";
import ArchiveModal from "./ArchiveModal";
import type { StickyNote } from "../../types/note";
import { getDataMode } from "../../services/dataMode";
import {
  fetchNotes,
  createNote,
  saveNote,
  deleteNote as deleteNoteApi,
} from "../../services/notes/noteService";

const NOTES_KEY = "notes";
const ARCHIVED_KEY = "archived_notes";

const DEFAULT_W = 380;
const DEFAULT_H = 300;
const FAB_SIZE = 48;
const FAB_GAP = 24;
const NOTE_MIN_TOP = 20;

const SYNC_MS = 550;

function normalizeNote(n: Partial<StickyNote>): StickyNote {
  const x = Number(n.x);
  const y = Number(n.y);
  const width = Number(n.width);
  const height = Number(n.height);

  return {
    id: String(n.id ?? ""),
    x: Number.isFinite(x) ? x : 100,
    y: Number.isFinite(y) ? y : 120,
    width: Number.isFinite(width) ? width : DEFAULT_W,
    height: Number.isFinite(height) ? height : DEFAULT_H,
    title: n.title ?? "",
    body: n.body ?? "",
    color: n.color,
    timestamp: n.timestamp,
    updatedAt: n.updatedAt,
    links: n.links ?? [],
    archived: n.archived ?? false,
  };
}

export default function NoteBoard() {
  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.email ?? undefined;
  const isBackend = getDataMode() !== "mock";

  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<StickyNote[]>([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const syncTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const scheduleBackendSave = useCallback(
    (note: StickyNote) => {
      if (!isBackend || !userId) return;
      const id = note.id;
      if (syncTimers.current[id]) {
        clearTimeout(syncTimers.current[id]);
      }
      syncTimers.current[id] = setTimeout(() => {
        saveNote(userId, note).catch((e) => console.error(e));
        delete syncTimers.current[id];
      }, SYNC_MS);
    },
    [isBackend, userId]
  );

  useEffect(() => {
    if (isBackend && sessionStatus === "loading") return;
    let cancelled = false;
    async function load() {
      try {
        const { active, archived } = await fetchNotes(userId);
        if (!cancelled) {
          setNotes(active.map(normalizeNote));
          setArchivedNotes(archived.map(normalizeNote));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId, sessionStatus, isBackend]);

  useEffect(() => {
    if (!hydrated) return;
    if (isBackend) return;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    localStorage.setItem(ARCHIVED_KEY, JSON.stringify(archivedNotes));
  }, [notes, archivedNotes, hydrated, isBackend]);

  useEffect(() => {
    const timers = syncTimers;
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  const NOTE_COLORS = ["bg-pink", "bg-blue", "bg-cream", "bg-lilac"];

  const getBoardSize = () => {
    const el = boardRef.current;
    return {
      width: el?.clientWidth ?? window.innerWidth,
      height: el?.clientHeight ?? window.innerHeight,
    };
  };

  const addNote = async () => {
    const noteWidth = 380;
    const { width } = getBoardSize();
    const maxX = width - noteWidth - 40;
    const minX = 24;
    const x = Math.min(maxX, minX + Math.random() * Math.max(0, maxX - minX));
    const y = NOTE_MIN_TOP + Math.random() * 40;

    const newNote: StickyNote = normalizeNote({
      id: crypto.randomUUID(),
      x,
      y,
      width: 380,
      height: 300,
      title: "New Note",
      body: "",
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      timestamp: new Date().toLocaleString(),
      links: [],
    });

    setNotes((prev) => [...prev, newNote]);

    if (isBackend && userId) {
      try {
        const saved = await createNote(userId, newNote);
        setNotes((prev) =>
          prev.map((n) => (n.id === newNote.id ? normalizeNote({ ...n, ...saved }) : n))
        );
      } catch (e) {
        console.error(e);
        setNotes((prev) => prev.filter((n) => n.id !== newNote.id));
      }
    }
  };

  const updateNote = (id: string, updatedFields: Partial<StickyNote>) => {
    setNotes((prev) => {
      const next = prev.map((note) => {
        if (note.id !== id) return note;
        return normalizeNote({ ...note, ...updatedFields });
      });
      const updated = next.find((n) => n.id === id);
      if (updated) {
        queueMicrotask(() => scheduleBackendSave(updated));
      }
      return next;
    });
  };

  const deleteNote = async (id: string) => {
    if (isBackend && userId) {
      try {
        await deleteNoteApi(userId, id);
      } catch (e) {
        console.error(e);
        return;
      }
    }
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const archiveNote = async (id: string) => {
    const noteToArchive = notes.find((n) => n.id === id);
    if (!noteToArchive) return;
    const archived = normalizeNote({ ...noteToArchive, archived: true });

    if (isBackend && userId) {
      try {
        await saveNote(userId, archived);
      } catch (e) {
        console.error(e);
        return;
      }
    }

    setArchivedNotes((prev) => [...prev, archived]);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const restoreNote = async (id: string) => {
    const note = archivedNotes.find((n) => n.id === id);
    if (!note) return;
    const restored = normalizeNote({ ...note, archived: false });

    if (isBackend && userId) {
      try {
        await saveNote(userId, restored);
      } catch (e) {
        console.error(e);
        return;
      }
    }

    setNotes((prev) => [...prev, restored]);
    setArchivedNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDrag = (e: MouseEvent, id: string) => {
    setNotes((prev) => {
      const next = prev.map((note) => {
        if (note.id !== id) return note;

        const updated = {
          ...note,
          x: note.x + e.movementX,
          y: note.y + e.movementY,
        };

        const { width, height } = getBoardSize();
        const maxX = Math.max(0, width - note.width);
        const maxY = Math.max(0, height - note.height);

        updated.x = Math.min(Math.max(updated.x, 0), maxX);
        updated.y = Math.min(Math.max(updated.y, NOTE_MIN_TOP), maxY);

        return normalizeNote(updated);
      });
      const merged = next.find((n) => n.id === id);
      if (merged && isBackend && userId) {
        queueMicrotask(() => scheduleBackendSave(merged));
      }
      return next;
    });
  };

  if (!hydrated && isBackend) {
    return (
      <div ref={boardRef} className="h-full w-full relative flex items-center justify-center text-dark-green-2">
        Loading notes…
      </div>
    );
  }

  return (
    <div ref={boardRef} className="h-full w-full relative">
      <ArchiveModal
        archivedNotes={archivedNotes}
        restoreNote={restoreNote}
        isOpen={archiveOpen}
        onClose={() => setArchiveOpen(false)}
      />

      <Tooltip title="Add note" placement="right">
        <IconButton
          onClick={addNote}
          aria-label="Add note"
          sx={{
            position: "absolute",
            bottom: FAB_GAP,
            left: FAB_GAP,
            zIndex: 10,
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: "50%",
            backgroundColor: "var(--green-1)",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            "&:hover": {
              backgroundColor: "var(--green-2)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            },
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 26 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Archived notes" placement="right">
        <IconButton
          onClick={() => setArchiveOpen(true)}
          aria-label="View archived notes"
          sx={{
            position: "absolute",
            bottom: FAB_GAP + FAB_SIZE + 12,
            left: FAB_GAP,
            zIndex: 10,
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: "50%",
            backgroundColor: "var(--card-bg, #fff)",
            color: "var(--dark-green-1)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
            border: "1px solid var(--sidebar-border)",
            "&:hover": {
              backgroundColor: "var(--sidebar-bg)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.16)",
            },
          }}
        >
          <InventoryRoundedIcon sx={{ fontSize: 22 }} />
          {archivedNotes.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--green-1)",
              }}
            />
          )}
        </IconButton>
      </Tooltip>

      {notes.map((note) => (
        <div
          key={note.id}
          className="absolute cursor-grab"
          style={{ left: note.x, top: note.y }}
          onMouseDown={() => {
            const moveHandler = (ev: MouseEvent) => handleDrag(ev, note.id);
            document.addEventListener("mousemove", moveHandler);
            document.addEventListener(
              "mouseup",
              () => document.removeEventListener("mousemove", moveHandler),
              { once: true }
            );
          }}
        >
          <EditableNote
            initialTitle={note.title}
            initialBody={note.body}
            initialColor={note.color}
            initialLinks={note.links}
            width={note.width}
            height={note.height}
            lastEdited={note.timestamp ?? new Date().toLocaleString()}
            onArchive={() => archiveNote(note.id)}
            onDelete={() => deleteNote(note.id)}
            onUpdate={(data) => updateNote(note.id, data)}
          />
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import { IconButton, Tooltip } from '@mui/material';
import EditableNote from './EditableNote';
import ArchiveModal from './ArchiveModal';

type NoteType = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  body: string;
  color?: string;
  timestamp?: string;
  links?: string[];
};

const DEFAULT_W = 380 / 4;
const DEFAULT_H = 30 / 4;
const FAB_SIZE = 48;
const FAB_GAP = 24;
const NOTE_MIN_TOP = 20;

function normalizeNote(n: any): NoteType {
  const x = Number(n.x);
  const y = Number(n.y);
  const width = Number(n.width);
  const height = Number(n.height);

  return {
    ...n,
    x: Number.isFinite(x) ? x : 100,
    y: Number.isFinite(y) ? y : 120,
    width: Number.isFinite(width) ? width : DEFAULT_W,
    height: Number.isFinite(height) ? height : DEFAULT_H,
  };
}

function loadNotesFromStorage(): NoteType[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('notes');
    if (!raw) return [];
    return JSON.parse(raw).map(normalizeNote);
  } catch {
    return [];
  }
}

function loadArchivedFromStorage(): NoteType[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('archived_notes');
    if (!raw) return [];
    return JSON.parse(raw).map(normalizeNote);
  } catch {
    return [];
  }
}

export default function NoteBoard() {
  const [notes, setNotes] = useState<NoteType[]>(loadNotesFromStorage);
  const [archivedNotes, setArchivedNotes] = useState<NoteType[]>(loadArchivedFromStorage);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('archived_notes', JSON.stringify(archivedNotes));
  }, [archivedNotes]);

  const NOTE_COLORS = ['bg-pink', 'bg-blue', 'bg-cream', 'bg-lilac'];

  const getBoardSize = () => {
    const el = boardRef.current;
    return {
      width: el?.clientWidth ?? window.innerWidth,
      height: el?.clientHeight ?? window.innerHeight,
    };
  };

  const addNote = () => {
    const noteWidth = 380;
    const { width } = getBoardSize();
    const maxX = width - noteWidth - 40;
    const minX = 24;
    const x = Math.min(maxX, minX + Math.random() * Math.max(0, maxX - minX));
    const y = NOTE_MIN_TOP + Math.random() * 40;
    setNotes([
      ...notes,
      {
        id: crypto.randomUUID(),
        x,
        y,
        width: 380,
        height: 300,
        title: 'New Note',
        body: '',
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        timestamp: new Date().toLocaleString(),
        links: [],
      },
    ]);
  };

  const updateNote = (id: string, updatedFields: Partial<NoteType>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updatedFields } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const archiveNote = (id: string) => {
    const noteToArchive = notes.find((n) => n.id === id);
    if (!noteToArchive) return;
    setArchivedNotes((prev) => [...prev, noteToArchive]);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const restoreNote = (id: string) => {
    const note = archivedNotes.find((n) => n.id === id);
    if (!note) return;
    setNotes((prev) => [...prev, note]);
    setArchivedNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDrag = (e: MouseEvent, id: string) => {
    setNotes((prev) =>
      prev.map((note) => {
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

        return updated;
      })
    );
  };

  return (
    <div ref={boardRef} className="h-full w-full relative">
      <ArchiveModal
        archivedNotes={archivedNotes}
        restoreNote={restoreNote}
        isOpen={archiveOpen}
        onClose={() => setArchiveOpen(false)}
      />

      {/* Add note FAB */}
      <Tooltip title="Add note" placement="right">
        <IconButton
          onClick={addNote}
          aria-label="Add note"
          sx={{
            position: 'absolute',
            bottom: FAB_GAP,
            left: FAB_GAP,
            zIndex: 10,
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: '50%',
            backgroundColor: 'var(--green-1)',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            '&:hover': {
              backgroundColor: 'var(--green-2)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            },
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 26 }} />
        </IconButton>
      </Tooltip>

      {/* Archived notes FAB */}
      <Tooltip title="Archived notes" placement="right">
        <IconButton
          onClick={() => setArchiveOpen(true)}
          aria-label="View archived notes"
          sx={{
            position: 'absolute',
            bottom: FAB_GAP + FAB_SIZE + 12,
            left: FAB_GAP,
            zIndex: 10,
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: '50%',
            backgroundColor: 'var(--card-bg, #fff)',
            color: 'var(--dark-green-1)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            border: '1px solid var(--sidebar-border)',
            '&:hover': {
              backgroundColor: 'var(--sidebar-bg)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.16)',
            },
          }}
        >
          <InventoryRoundedIcon sx={{ fontSize: 22 }} />
          {archivedNotes.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--green-1)',
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
            document.addEventListener('mousemove', moveHandler);
            document.addEventListener(
              'mouseup',
              () => document.removeEventListener('mousemove', moveHandler),
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
            lastEdited={note.timestamp}
            onArchive={() => archiveNote(note.id)}
            onDelete={() => deleteNote(note.id)}
            onUpdate={(data) => updateNote(note.id, data)}
          />
        </div>
      ))}
    </div>
  );
}

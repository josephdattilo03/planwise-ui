'use client';

import { useState, useEffect } from 'react';
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button } from '@mui/material';
import EditableNote from './EditableNote';
import ArchiveSidebar from './ArchiveSidebar';
import LoadingSpinner from '@/src/common/LoadingSpinner';

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

const DEFAULT_W = 380;
const DEFAULT_H = 300;
const ARCHIVE_SIDEBAR_WIDTH = 280;
const ADD_NOTE_BUTTON_GAP = 16;

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

export default function NoteBoard() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<NoteType[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        // TODO: Replace with API call when integrated, e.g. const data = await fetchNotes();
        const savedNotes = localStorage.getItem('notes');
        const savedArchived = localStorage.getItem('archived_notes');

        if (savedNotes) setNotes(JSON.parse(savedNotes).map(normalizeNote));
        if (savedArchived)
          setArchivedNotes(JSON.parse(savedArchived).map(normalizeNote));
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('archived_notes', JSON.stringify(archivedNotes));
  }, [archivedNotes]);

  const NOTE_COLORS = ['bg-pink', 'bg-blue', 'bg-cream', 'bg-lilac'];

  const addNote = () => {
    const noteWidth = 380;
    const BUTTON_RIGHT = 37;
    const BUTTON_TOP = 150;

    const x =
      window.innerWidth - BUTTON_RIGHT - noteWidth - 20 + Math.random() * 50;
    const y = BUTTON_TOP + Math.random() * 20;
    setNotes([
      ...notes,
      {
        id: crypto.randomUUID(),
        x: x,
        y: y,
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

        const sidebarWidth = sidebarOpen ? ARCHIVE_SIDEBAR_WIDTH : 0;
        const topLimit = 80;

        const maxX = window.innerWidth - note.width;
        const maxY = window.innerHeight - note.height;

        updated.x = Math.min(Math.max(updated.x, sidebarWidth), maxX);
        updated.y = Math.min(Math.max(updated.y, topLimit), maxY);

        return updated;
      })
    );
  };

  if (loading) {
    return (
      <div className="flex w-full h-full">
        <LoadingSpinner label="Loading notes..." fullPage className="flex-1" />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-row content-fade-in">
      <ArchiveSidebar
        archivedNotes={archivedNotes}
        restoreNote={restoreNote}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((s) => !s)}
      />

      <div className="transition-all duration-300 relative w-full h-screen">
        <Button
          onClick={addNote}
          className="fixed top-5 z-999 flex items-center justify-center gap-1.5 py-2 px-3 font-sans rounded-md text-small-header bg-green-1 text-white hover:bg-green-2 transition-[left] duration-300 ease-out"
          style={{
            left: sidebarOpen
              ? ARCHIVE_SIDEBAR_WIDTH + ADD_NOTE_BUTTON_GAP
              : ADD_NOTE_BUTTON_GAP,
          }}
        >
          <AddRoundedIcon className="w-4 h-4" />
          <span>Add Note</span>
        </Button>

        {notes.map((note) => (
          <div
            key={note.id}
            className="absolute cursor-grab"
            style={{ left: note.x, top: note.y }}
            onMouseDown={(e) => {
              const moveHandler = (ev: MouseEvent) => handleDrag(ev, note.id);
              document.addEventListener('mousemove', moveHandler);
              document.addEventListener(
                'mouseup',
                () => {
                  document.removeEventListener('mousemove', moveHandler);
                },
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
    </div>
  );
}

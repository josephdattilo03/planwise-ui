'use client';

import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import EditableNote from './EditableNote';
import ArchiveSidebar from './ArchiveSidebar';

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

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    const savedArchived = localStorage.getItem('archived_notes');

    if (savedNotes) setNotes(JSON.parse(savedNotes).map(normalizeNote));
    if (savedArchived)
      setArchivedNotes(JSON.parse(savedArchived).map(normalizeNote));
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

        const sidebarWidth = sidebarOpen ? 280 : 0;
        const topLimit = 80;

        const maxX = window.innerWidth - note.width;
        const maxY = window.innerHeight - note.height;

        updated.x = Math.min(Math.max(updated.x, sidebarWidth), maxX);
        updated.y = Math.min(Math.max(updated.y, topLimit), maxY);

        return updated;
      })
    );
  };

  return (
    <div className="h-full w-full flex flex-row">
      <ArchiveSidebar
        archivedNotes={archivedNotes}
        restoreNote={restoreNote}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((s) => !s)}
      />

      <div
        className={`transition-all duration-300 relative w-full h-screen ${
          sidebarOpen ? 280 : 0
        }`}
      >
        <button
          onClick={addNote}
          className={`fixed top-24 bg-green-2 hover:bg-green-3 text-white px-4 py-2 rounded-lg shadow-md right-10 z-9999`}
        >
          + Add Note
        </button>

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

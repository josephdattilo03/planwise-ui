"use client";

import { useState, useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";
import EditableNote from "./EditableNote";

type NoteType = {
  id: string;
  x: number;
  y: number;
  title: string;
  body: string;
  color?: string;
  timestamp?: string;
  links?: string[];
};

export default function NoteBoard() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<NoteType[]>([]);

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    const savedArchived = localStorage.getItem("archived_notes");

    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedArchived) setArchivedNotes(JSON.parse(savedArchived));
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);
  
  useEffect(() => {
    localStorage.setItem("archived_notes", JSON.stringify(archivedNotes));
  }, [archivedNotes]);

  const addNote = () => {
    setNotes([
      ...notes,
      {
        id: crypto.randomUUID(),
        x: 100,
        y: 100,
        title: "New Note",
        body: "",
        color: "#fce4ec",
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
    const noteToRestore = archivedNotes.find((n) => n.id === id);
    if (!noteToRestore) return;

    setNotes((prev) => [...prev, noteToRestore]);
    setArchivedNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDrag = (e: MouseEvent, id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, x: note.x + e.movementX, y: note.y + e.movementY }
          : note
      )
    );
  };

  return (
    <Box sx={{ position: "relative", height: "calc(100vh - 60px)", width: "100%", marginTop: "60px", overflow: "hidden" }}>
      <Button variant="contained" sx={{ position: "fixed", top: 90, left: 16, zIndex: 1000 }} onClick={addNote}>
        + Add Note
      </Button>

      <Box
        sx={{
          position: "fixed",
          right: 0,
          top: 60,
          width: 240,
          height: "calc(100vh - 60px)",
          bgcolor: "#f5f5f5",
          borderLeft: "1px solid #ddd",
          p: 2,
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" mb={1}>Archived Notes</Typography>
        {archivedNotes.length === 0 && (
          <Typography variant="body2" color="text.secondary">No archived notes</Typography>
        )}

        {archivedNotes.map((note) => (
          <Box key={note.id} sx={{ p: 1, border: "1px solid #ccc", borderRadius: 2, mb: 1 }}>
            <Typography variant="subtitle2">{note.title}</Typography>
            <Button size="small" variant="outlined" onClick={() => restoreNote(note.id)}>
              Restore
            </Button>
          </Box>
        ))}
      </Box>

      {notes.map((note) => (
        <Box
          key={note.id}
          sx={{
            position: "absolute",
            left: note.x,
            top: note.y,
            cursor: "grab",
          }}
          onMouseDown={(e) => {
            const moveHandler = (ev: MouseEvent) => handleDrag(ev, note.id);
            document.addEventListener("mousemove", moveHandler);
            document.addEventListener("mouseup", () => {
              document.removeEventListener("mousemove", moveHandler);
            }, { once: true });
          }}
        >
          <EditableNote
            initialTitle={note.title}
            initialBody={note.body}
            initialColor={note.color}
            initialLinks={note.links}
            lastEdited={note.timestamp}
            onDelete={() => deleteNote(note.id)}
            onArchive={() => archiveNote(note.id)}
            onUpdate={(updatedData) => updateNote(note.id, updatedData)} 
          />
        </Box>
      ))}
    </Box>
  );
}
import { useState } from "react";
import { Box, Card, CardContent, Typography, Button, TextField, Chip } from "@mui/material";
import { useRouter } from "next/navigation";

interface NotesWidgetProps {
  notes: any[];
  onAddNote: (title: string, body: string) => void;
}

export default function NotesWidget({ notes, onAddNote }: NotesWidgetProps) {
  const router = useRouter();
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");

  // Get recent notes (last 3 edited)
  const recentNotes = notes
    .sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  const mainNote = recentNotes[0] || {
    title: "No notes yet",
    body: "Create your first note to get started!",
    timestamp: new Date().toLocaleString()
  };
  const noteTags = recentNotes.slice(1);

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) return;
    onAddNote(newNoteTitle.trim(), newNoteBody.trim());
    setNewNoteTitle("");
    setNewNoteBody("");
  };

  return (
    <Card
      sx={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--card-border)",
        backgroundColor: "var(--home-notes-bg)",
        cursor: "pointer",
      }}
      elevation={0}
      onClick={() => router.push("/notes")}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="overline"
          sx={{
            color: "var(--dark-green-2)",
            opacity: 0.8,
            fontSize: 10,
            fontWeight: 600,
            mb: 1,
          }}
        >
          LAST EDITED {mainNote.timestamp ? new Date(mainNote.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }).toUpperCase() : 'RECENTLY'}
        </Typography>

        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 1.5, color: "var(--dark-green-1)", fontSize: "1.1rem" }}
        >
          {mainNote.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontSize: 13,
            color: "var(--dark-green-2)",
            mb: 2,
            lineHeight: 1.4,
          }}
        >
          {mainNote.body ? mainNote.body.substring(0, 150) + (mainNote.body.length > 150 ? '...' : '') :
            'Create your first note to get started with organizing your thoughts!'}
        </Typography>

        <Box
          sx={{ mb: 1.5 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <TextField
            fullWidth
            placeholder="Quick note title..."
            value={newNoteTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.stopPropagation();
              setNewNoteTitle(e.target.value);
            }}
            variant="outlined"
            size="small"
            sx={{
              mb: 0.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--input-bg)",
                color: "var(--input-text)",
                "& fieldset": {
                  borderColor: "var(--input-border)"
                },
                "&:hover fieldset": {
                  borderColor: "var(--green-2)"
                },
                "&.Mui-focused fieldset": { borderColor: "var(--green-2)" },
              },
              "& .MuiInputBase-input": {
                color: "var(--input-text)",
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleAddNote();
            }}
            disabled={!newNoteTitle.trim()}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              backgroundColor: "#2e7d32",
              py: 0.75,
              fontSize: 12,
              fontWeight: 600,
              color: "white",
              "&:hover": { backgroundColor: "#1b5e20" },
              "&:disabled": {
                backgroundColor: "rgba(0,0,0,0.12)",
                color: "rgba(0,0,0,0.26)"
              }
            }}
          >
            + Create Note
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {noteTags.length > 0 ? noteTags.map((note) => (
            <Chip
              key={note.id || note.title}
              label={note.title}
              size="small"
              sx={{
                backgroundColor: "var(--menu-bg)",
                color: "var(--foreground)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--card-border)",
                fontSize: 11,
                fontWeight: 500,
                py: 0.5,
              }}
            />
          )) : (
            <Typography
              variant="caption"
              sx={{
                color: "var(--dark-green-2)",
                fontStyle: "italic",
                fontSize: 11
              }}
            >
              {recentNotes.length <= 1 ? 'Create more notes to see them here' : 'No additional recent notes'}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

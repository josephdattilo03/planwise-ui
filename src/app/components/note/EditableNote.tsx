"use client";

import { useState, useRef, useEffect} from "react";
import {
  Card,
  CardContent,
  TextField,
  IconButton,
  Button,
  Box,
  Typography,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';

export default function EditableNote({
  initialTitle = "",
  initialBody = "",
  initialColor = "#fce4ec",
  initialLinks = [],
  lastEdited = new Date().toLocaleDateString(),
  onDelete,
  onArchive,
  onUpdate,
}: {
  initialTitle?: string;
  initialBody?: string;
  initialColor?: string;
  initialLinks?: string[];
  lastEdited?: string;
  onDelete?: () => void; 
  onArchive?: () => void;
  onUpdate?: (updated: any) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [color, setColor] = useState(initialColor);
  const [editing, setEditing] = useState(false);
  const [links, setLinks] = useState(initialLinks);
  const [timestamp, setTimestamp] = useState(lastEdited);

  const editorRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (!editorRef.current) return;

  if (editing && editorRef.current.innerHTML === "") {
    editorRef.current.innerHTML = body;
  }

  if (!editing) {
    editorRef.current.innerHTML = body;
  }
}, [editing]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onUpdate?.({ title: e.target.value }); 
  };

  const handleBodyChange = () => {
    const html = editorRef.current?.innerHTML ?? "";
    setBody(html);
    onUpdate?.({ body: html });
    setTimestamp(new Date().toLocaleString());
    onUpdate?.({ timestamp: new Date().toLocaleString() });
  };

  const handleColorChange = (c: string) => {
    setColor(c);
    onUpdate?.({ color: c });  
  };

  const addLink = () => {
    const url = prompt("Enter link:");
    if (!url) return;
    const newLinks = [...links, url];
    setLinks(newLinks);
    onUpdate?.({ links: newLinks });   
  };

  const applyStyle = (style: "bold" | "italic" | "underline") => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.extractContents();
    const span = document.createElement("span");

    if (style === "bold") span.style.fontWeight = "bold";
    if (style === "italic") span.style.fontStyle = "italic";
    if (style === "underline") span.style.textDecoration = "underline";

    span.appendChild(selectedText);
    range.insertNode(span);

    setTimestamp(new Date().toLocaleString());
    onUpdate?.({ timestamp: new Date().toLocaleString() });

    const html = editorRef.current?.innerHTML ?? "";
    setBody(html);
    onUpdate?.({ body: html }); 
  };


  const muiColors = [
    "#fce4ec", 
    "#e3f2fd", 
    "#e8f5e9", 
    "#fff9c4", 
    "#f3e5f5"];


    return (
    <Card
      sx={{
        padding: 2,
        borderRadius: 3,
        boxShadow: 3,
        width: 380,
        backgroundColor: color,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        {editing ? (
          <TextField
            variant="standard"
            value={title}
            onChange={handleTitleChange}
            fullWidth
            sx={{ fontSize: "1.2rem", fontWeight: 600 }}
          />
        ) : (
          <Typography variant="h6">{title}</Typography>
        )}

        <Box>
          <IconButton onClick={() => setEditing(!editing)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={onArchive}>
            <ArchiveIcon />
          </IconButton>
          <IconButton color="error" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="caption" color="gray" mb={2} display="block">
        LAST EDITED {timestamp}
      </Typography>

      {editing && (
        <Box display="flex" gap={1} mb={2}>
          <IconButton onClick={() => applyStyle("bold")}><FormatBoldIcon /></IconButton>
          <IconButton onClick={() => applyStyle("italic")}><FormatItalicIcon /></IconButton>
          <IconButton onClick={() => applyStyle("underline")}><FormatUnderlinedIcon /></IconButton>
          <Button variant="outlined" size="small" onClick={addLink}>+ Link</Button>
        </Box>
      )}

      <CardContent>
        <Box
          ref={editorRef}
          contentEditable={editing}
          suppressContentEditableWarning
          sx={{
            minHeight: "120px",
            outline: "none",
            padding: 1,
            borderRadius: 1,
            "&:focus": { border: "1px solid #1976d2" },
          }}
          onInput={handleBodyChange}
        />
      </CardContent>

      <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
        {links.map((link, i) => (
          <Button key={i} variant="outlined" sx={{ borderRadius: "16px" }}>
            {link}
          </Button>
        ))}
      </Box>

      {editing && (
        <Box display="flex" gap={1} mt={2}>
          {muiColors.map((c) => (
            <Box
              key={c}
              sx={{
                width: 24,
                height: 24,
                bgcolor: c,
                borderRadius: "50%",
                cursor: "pointer",
                border: "1px solid #ddd",
              }}
              onClick={() => handleColorChange(c)}
            />
          ))}
        </Box>
      )}
    </Card>
  );
}
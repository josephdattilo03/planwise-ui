"use client";

import { useState, useRef, useEffect} from "react";
import {
  Card,
  CardContent,
  IconButton,
  Button,
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
  initialColor = "bg-pink",
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
  const [noteWidth, setNoteWidth] = useState(380);
const [noteHeight, setNoteHeight] = useState(300); 

const bodyRef = useRef<HTMLDivElement | null>(null);
const titleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editing && bodyRef.current) bodyRef.current.innerHTML = body;
    if (!editing && titleRef.current) titleRef.current.innerHTML = title;
    if (editing && titleRef.current) titleRef.current.innerHTML = title;
  }, [editing]);

const applyStyle = (style: "bold" | "italic" | "underline") => {
  document.execCommand(style);
  updateBody();
};

  const updateBody = () => {
    const html = bodyRef.current?.innerHTML || "";
    setBody(html);
    onUpdate?.({ body: html, timestamp: new Date().toLocaleString() });
  };

const updateTitle = () => {
  const html = titleRef.current?.innerHTML || "";
  setTitle(html); 
  onUpdate?.({ title: html });
};

const onResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();

  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = noteWidth;
  const startHeight = noteHeight;

  const handleMouseMove = (ev: MouseEvent) => {
    const deltaX = ev.clientX - startX;
    const deltaY = ev.clientY - startY;

    const newWidth = Math.max(240, startWidth + deltaX);
    const newHeight = Math.max(180, startHeight + deltaY);

    setNoteWidth(newWidth);
    setNoteHeight(newHeight);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp, { once: true });
};



const addLink = () => {
  const url = prompt("Enter link:");
  if (!url) return;
  const newLinks = [...links, url];
  setLinks(newLinks);
  onUpdate?.({ links: newLinks });
};

  const NOTE_COLORS = ["bg-pink", "bg-blue", "bg-cream", "bg-lilac"];

  return (
    <Card
      className={`${color} shadow-lg rounded-2xl p-4 relative${
        editing ? "bg-opacity-80 ring-3 ring-gray-300" : ""
      }`}
      style={{ width: `${noteWidth}px`, height: `${noteHeight}px` }}
      onDoubleClick={() => setEditing(true)} 
    >
      <div className="flex justify-between items-center mb-1">
        {editing ? (
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            className="text-sm font-medium outline-none bg-transparent w-full"
            onInput={updateTitle}
          />
        ) : (
          <Typography
            className="text-sm font-medium"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        )}

        <div className="flex gap-1 ml-2">
          <IconButton onClick={() => setEditing((s) => !s)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={onArchive}>
            <ArchiveIcon />
          </IconButton>
          <IconButton className="text-red-500 hover:text-red-700" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-2">LAST EDITED {timestamp}</p>

      {editing && (
        <div className="flex gap-2 mb-2">
          <IconButton onClick={() => applyStyle("bold")}><FormatBoldIcon /></IconButton>
          <IconButton onClick={() => applyStyle("italic")}><FormatItalicIcon /></IconButton>
          <IconButton onClick={() => applyStyle("underline")}><FormatUnderlinedIcon /></IconButton>
          <Button size="small" variant="outlined" onClick={addLink}>+ Link</Button>
        </div>
      )}

      <CardContent className="p-0">
        <div
          ref={bodyRef}
          contentEditable={editing}
          suppressContentEditableWarning
          className={`min-h-[120px] outline-none p-2 rounded ${color} text-black`}
          onInput={updateBody}
        />
      </CardContent>

      <div className="flex flex-wrap gap-2 mt-2">
        {links.map((link, i) => (
          <a
            key={i}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-white border border-green-2 rounded-full underline text-blue-600 hover:text-blue-800"
          >
            {link}
          </a>
        ))}
      </div>

      {editing && (
        <div className="flex gap-2 mt-3">
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full border cursor-pointer ${c}`}
              onClick={() => {
                setColor(c);
                onUpdate?.({ color: c });
              }}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-2 right-2 cursor-se-resize p-1 opacity-60 hover:opacity-100 transition" onMouseDown={onResizeStart} onClick={(e) => e.stopPropagation()} style={{ userSelect: "none" }} > 
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600" > 
          <path d="M18 20 L20 18" /> 
          <path d="M14 20 L20 14" /> 
          <path d="M10 20 L20 10" /> 
        </svg> 
      </div>
    </Card>
  );
}
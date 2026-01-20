"use client";

import { useState, useRef, useEffect } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";

export default function EditableNote({
  initialTitle = "",
  initialBody = "",
  initialColor = "bg-pink",
  initialLinks = [],
  width = 380,
  height = 300,
  lastEdited = new Date().toLocaleDateString(),
  onDelete,
  onArchive,
  onUpdate,
}: {
  initialTitle?: string;
  initialBody?: string;
  initialColor?: string;
  initialLinks?: string[];
  width?: number;
  height?: number;
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
  const [noteWidth, setNoteWidth] = useState(width);
  const [noteHeight, setNoteHeight] = useState(height);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editing && bodyRef.current) bodyRef.current.innerHTML = body;
    if (!editing && titleRef.current) titleRef.current.innerHTML = title;
    if (editing && titleRef.current) titleRef.current.innerHTML = title;
  }, [editing]);

  useEffect(() => {
    setNoteWidth(width);
  }, [width]);

  useEffect(() => {
    setNoteHeight(height);
  }, [height]);

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
      onUpdate?.({ width: newWidth, height: newHeight });
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

  const NOTE_COLORS = [
    "bg-pastel-red",
    "bg-pastel-orange",
    "bg-pastel-yellow",
    "bg-pastel-green",
    "bg-pastel-cyan",
    "bg-pastel-blue",
    "bg-pastel-indigo",
    "bg-pastel-violet",
    "bg-pink",
  ];

  return (
    <Card
      className={`${color} shadow-lg rounded-2xl p-4 relative${
        editing ? "bg-opacity-80 ring-3 ring-gray-300 z-0" : ""
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
          <IconButton onClick={() => setEditing((s) => !s)} className="text-dark-green-1">
            <EditIcon />
          </IconButton>
          <IconButton onClick={onArchive} className="text-dark-green-1">
            <ArchiveIcon />
          </IconButton>
          <IconButton
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        LAST EDITED {timestamp}
      </p>

      {editing && (
        <div className="flex gap-2 mb-2">
          <IconButton onClick={() => applyStyle("bold")} className="text-dark-green-1">
            <FormatBoldIcon />
          </IconButton>
          <IconButton onClick={() => applyStyle("italic")} className="text-dark-green-1">
            <FormatItalicIcon />
          </IconButton>
          <IconButton onClick={() => applyStyle("underline")} className="text-dark-green-1">
            <FormatUnderlinedIcon />
          </IconButton>
          <Button
            size="small"
            variant="outlined"
            onClick={addLink}
            className="text-dark-green-1 border-dark-green-2"
          >
            + Link
          </Button>
        </div>
      )}

      <CardContent className="p-0 h-[calc(100%-145px)]">
        <div
          ref={bodyRef}
          contentEditable={editing}
          suppressContentEditableWarning
          className={`w-full h-full overflow-auto outline-none p-2 rounded ${color} text-black dark:text-dark-green-1`}
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
            className="px-3 py-1 bg-white dark:bg-dark-green-2 border border-green-2 rounded-full underline text-blue-600 dark:text-sky-blue hover:text-blue-800 dark:hover:text-sky-blue"
          >
            {link}
          </a>
        ))}
      </div>

      {editing && (
        <div className="flex gap-2 mt-auto mb-2">
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 min-w-6 min-h-6 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer ${c}`}
              onClick={() => {
                setColor(c);
                onUpdate?.({ color: c });
              }}
            />
          ))}
        </div>
      )}

      <div
        className="absolute bottom-2 right-2 cursor-se-resize p-1 opacity-60 hover:opacity-100"
        onMouseDown={onResizeStart}
        onClick={(e) => e.stopPropagation()}
        style={{ userSelect: "none" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-600 dark:text-gray-400"
        >
          <path d="M18 20 L20 18" />
          <path d="M14 20 L20 14" />
          <path d="M10 20 L20 10" />
        </svg>
      </div>
    </Card>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@mui/material";
import {Button } from "@mui/material";
import { Bold, Italic, Underline, Edit, Trash2, Archive } from "lucide-react";
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';

export default function EditableNote({
  initialTitle = "",
  initialBody = "",
  initialColor = "bg-red-100",
  initialLinks = [],
  lastEdited = new Date().toLocaleDateString(),
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [color, setColor] = useState(initialColor);
  const [editing, setEditing] = useState(false);
  const [links, setLinks] = useState(initialLinks);
  const [timestamp, setTimestamp] = useState(lastEdited);

  const editorRef = useRef(null);

  useEffect(() => {
    if (editing && editorRef.current) {
      (editorRef.current as HTMLElement).innerHTML = body;
    }
  }, [editing]);

  const applyStyle = (command) => {
    // @ts-ignore
    document.execCommand(command, false, null);
    setTimestamp(new Date().toLocaleString());
  };

  const addLink = () => {
    const url = prompt("Enter link:");
    if (!url) return;
    setLinks([...links, url]);
    setTimestamp(new Date().toLocaleString());
  };

  const colors = [
    "bg-red-100",
    "bg-blue-100",
    "bg-green-100",
    "bg-yellow-100",
    "bg-purple-100",
  ];

    return (
    <Card className={`${color} p-4 rounded-2xl shadow-md w-[380px]`}>

      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        {editing ? (
          <input
            className="text-xl font-semibold bg-transparent outline-none w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <h2 className="text-xl font-semibold">{title}</h2>
        )}

        <div className="flex gap-2">
          <Edit className="cursor-pointer w-4 h-4" onClick={() => setEditing(!editing)} />
          <Archive className="cursor-pointer w-4 h-4" />
          <Trash2 className="cursor-pointer w-4 h-4 text-red-500" />
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-2">LAST EDITED {timestamp}</p>

      {editing && (
        <div className="flex gap-3 mb-3">
          <Bold onClick={() => applyStyle("bold")} className="cursor-pointer w-4 h-4" />
          <Italic onClick={() => applyStyle("italic")} className="cursor-pointer w-4 h-4" />
          <Underline onClick={() => applyStyle("underline")} className="cursor-pointer w-4 h-4" />
          <Button size="small" onClick={addLink}>+ Link</Button>
        </div>
      )}

      <CardContent>
        <div
          ref={editorRef}
          contentEditable={editing}
          suppressContentEditableWarning={true}
          className="min-h-[120px] outline-none leading-relaxed"
          onInput={() => {
            const html = editorRef.current.innerHTML;
            setBody(html);
          }}
        />
      </CardContent>

      <div className="flex flex-wrap gap-2 mt-3">
        {links.map((l, i) => (
          <span key={i} className="px-2 py-1 bg-white shadow-sm rounded-full text-sm border">
            {l}
          </span>
        ))}
      </div>

      {editing && (
        <div className="flex gap-2 mt-4">
          {colors.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full border ${c}`}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      )}

    </Card>
  );
}
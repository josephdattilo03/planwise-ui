"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArchivedNoteChip from "./ArchivedNoteChip";

export default function ArchiveSidebar({
  archivedNotes,
  restoreNote,
  isOpen,
  toggleSidebar,
}: {
  archivedNotes: any[];
  restoreNote: (id: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}) {
  return (
    <>
      <div
        className={`
          fixed top-[78.57px] h-[calc(100vh-78.57px)] w-60 z-[2000]
          bg-off-white border-r border-green-3 overflow-y-auto p-4
          transition-all duration-300
          ${isOpen ? "left-0" : "-left-60"}
        `}
      >
        <p className="text-small-header text-dark-green-2 mb-2">
          Archived Notes
        </p>

        {archivedNotes.length === 0 ? (
          <p className="text-body text-gray-500">No archived notes</p>
        ) : (
          archivedNotes.map((note) => (
            <ArchivedNoteChip
              key={note.id}
              title={note.title}
              color={note.color} 
              onRestore={() => restoreNote(note.id)}
            />
          ))
        )}
      </div>

      <div
        onClick={toggleSidebar}
        className={`
          fixed top-1/2 -translate-y-1/2 z-[3000]
          bg-off-white border border-green-3 border-l-0
          px-3 py-2 cursor-pointer rounded-r-lg shadow-md
          transition-all duration-300
          ${isOpen ? "left-60" : "left-0"}
        `}
      >
        {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </div>
    </>
  );
}
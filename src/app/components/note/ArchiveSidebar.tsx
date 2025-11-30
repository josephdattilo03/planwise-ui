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
      <aside
        className={`w-full h-full border border-green-4 bg-off-white flex flex-col pt-4 z-3000
          ${isOpen ? "max-w-2xs" : "max-w-0"}
        `}
      >
        {isOpen && (
          <>
            {" "}
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
          </>
        )}
      </aside>
      <div
        onClick={toggleSidebar}
        className={`
          fixed top-1/2 -translate-y-1/2 z-3000
          border border-green-4 bg-off-white border-l-0
          px-3 py-2 cursor-pointer rounded-r-lg shadow-md
          transition-all duration-300
          ${isOpen ? "left-(--container-2xs)" : "left-0"}
        `}
      >
        {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </div>
    </>
  );
}

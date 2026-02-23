"use client";

import RestoreIcon from "@mui/icons-material/Restore";
import DescriptionIcon from "@mui/icons-material/Description";

export default function ArchivedNoteChip({
  title,
  color,
  onRestore,
}: {
  title: string;
  color?: string;
  onRestore: () => void;
}) {
  return (
    <div className="
            flex items-center gap-2 py-1 pl-2 cursor-pointer 
            rounded-sm transition-colors duration-200
            hover:bg-beige
        "
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onRestore()}
      onClick={onRestore}
    >
      <button
        className="
          p-1 rounded-sm 
          hover:bg-green-3
          active:scale-95 transition 
        "
        onClick={(e) => {
          e.stopPropagation();
          onRestore();
        }}
      >
        <RestoreIcon fontSize="small" className="text-green-2" />
      </button>

      <span className={`w-2 h-2 rounded-full ${color || "bg-lilac"}`} />


      <div className="flex flex-row items-center gap-1 text-sm text-dark-green-2">
        <DescriptionIcon fontSize="small" />
        <span
          className="text-sm font-medium text-gray-700 truncate max-w-[150px]"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </div>
    </div>
  );
}
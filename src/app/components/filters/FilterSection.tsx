import React from "react";
import { IconButton } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

type Props = {
  title: string;
  onAddClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
};

export default function FilterSection({ title, onAddClick, children }: Props) {
  return (
    <section>
      <div className="flex justify-between items-center">
        <h3 className="text-small-header uppercase text-dark-green-1">
          {title}
        </h3>

        {onAddClick && (
          <IconButton size="small" onClick={onAddClick}>
            <AddRoundedIcon className="w-4 h-4" />
          </IconButton>
        )}
      </div>

      {children}
    </section>
  );
}

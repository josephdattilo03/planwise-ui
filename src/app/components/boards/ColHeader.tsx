"use client";

import React from "react";
import { Typography, Badge } from "@mui/material";

interface ColHeaderProps {
  title: string;
  count: number;
}

export const ColHeader = ({ title, count }: ColHeaderProps) => {
  return (
    <div className={`flex items-center justify-between p-4`}>
      <Typography variant="h6" className="font-semibold">
        {title}
      </Typography>
      <Badge
        badgeContent={count}
        color="primary"
        sx={{
          "& .MuiBadge-badge": {
            position: "static",
            transform: "none",
          },
        }}
      />
    </div>
  );
};

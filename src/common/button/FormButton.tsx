"use client";

import React from "react";
import { Button } from "@mui/material";

type FormButtonProps = {
  onClick?: () => void;
  text: string;
  variant?: "clear" | "confirm";
  fullWidth?: boolean;
  disabled?: boolean;
};

export default function FormButton({
  onClick,
  text,
  variant = "clear",
  fullWidth = true,
  disabled = false,
}: FormButtonProps) {
  const baseClasses =
    "py-2 font-sans rounded-full text-small-header transition";

  const variants = {
    clear: "border border-beige text-dark-green-1 bg-off-white hover:bg-beige",
    confirm: "bg-green-1 text-white hover:bg-green-2",
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? "w-full" : ""} ${baseClasses} ${variants[variant]}`}
    >
      {text}
    </Button>
  );
}

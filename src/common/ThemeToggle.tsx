"use client";

import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ onClose }: { onClose?: () => void }) {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
    onClose?.();
  };

  return (
    <MenuItem onClick={handleToggle}>
      <ListItemIcon>
        {theme === "light" ? (
          <DarkModeIcon fontSize="small" />
        ) : (
          <LightModeIcon fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText>
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </ListItemText>
    </MenuItem>
  );
}

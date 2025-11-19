"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Box, Tabs, Tab, IconButton } from "@mui/material";
import { ReactNode } from "react";
import Image from "next/image";

// MUI Icons (filled + outlined versions)
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import ChecklistIcon from "@mui/icons-material/Checklist";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";

import SearchIcon from "@mui/icons-material/Search";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

interface NavItem {
  label: string;
  icon: ReactNode;
  iconFilled: ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    icon: <DashboardOutlinedIcon />,
    iconFilled: <DashboardIcon />,
    href: "/",
  },
  {
    label: "Calendar",
    icon: <CalendarMonthOutlinedIcon />,
    iconFilled: <CalendarMonthIcon />,
    href: "/calendar",
  },
  {
    label: "Folders & Boards",
    icon: <FolderSpecialOutlinedIcon />,
    iconFilled: <FolderSpecialIcon />,
    href: "/folders",
  },
  {
    label: "Tasks",
    icon: <ChecklistOutlinedIcon />,
    iconFilled: <ChecklistIcon />,
    href: "/tasks",
  },
  {
    label: "Notes",
    icon: <StickyNote2OutlinedIcon />,
    iconFilled: <StickyNote2Icon />,
    href: "/notes",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <Box className="flex flex-row justify-between font-sans text-[16px] w-full bg-off-white py-3 px-8 border-b-2 border-green-2">
      <Image
        src="/logo.svg"
        alt="Planwise logo"
        width={170}
        height={43}
        priority
      />
      <Tabs
        value={pathname}
        className="my-3 min-h-0 h-auto"
        textColor="inherit"
        indicatorColor="none"
        centered
      >
        {navItems.map((item) => {
          const selected = pathname === item.href;

          return (
            <Tab
              key={item.href}
              value={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              icon={selected ? item.iconFilled : item.icon}
              iconPosition="start"
              className="transition delay-50 duration-200 ease-in-out"
              sx={{
                minHeight: 0,
                py: "4px",
                px: "10px",
                mx: "10px",
                fontWeight: 500,
                color: selected ? "var(--Dark-Green-1)" : "var(--Dark-Green-2)",
                borderRadius: "6px",
                backgroundColor: selected ? "var(--Green-4)" : "transparent",
                "&:hover": {
                  backgroundColor: selected ? "var(--Green-4)" : "#A7C9574D",
                  color: "var(--Dark-Green-1)",
                },
              }}
            />
          );
        })}
      </Tabs>
      <div className="flex-shrink-0 flex items-center gap-4">
        <IconButton>
          <SearchIcon sx={{ color: "#43544780" }} />
        </IconButton>

        <span className="font-medium text-dark-green-2">John Doe</span>

        <IconButton>
          <SettingsOutlinedIcon className="text-dark-green-2" />
        </IconButton>
      </div>
    </Box>
  );
}

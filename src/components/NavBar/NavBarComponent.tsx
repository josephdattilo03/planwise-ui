"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Box, Tabs, Tab, IconButton } from "@mui/material";
import { ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

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
  key: string;
  icon: ReactNode;
  iconFilled: ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  {
    key: "home",
    icon: <DashboardOutlinedIcon />,
    iconFilled: <DashboardIcon />,
    href: "/",
  },
  {
    key: "calendar",
    icon: <CalendarMonthOutlinedIcon />,
    iconFilled: <CalendarMonthIcon />,
    href: "/calendar",
  },
  {
    key: "folders",
    icon: <FolderSpecialOutlinedIcon />,
    iconFilled: <FolderSpecialIcon />,
    href: "/folders",
  },
  {
    key: "tasks",
    icon: <ChecklistOutlinedIcon />,
    iconFilled: <ChecklistIcon />,
    href: "/tasks",
  },
  {
    key: "notes",
    icon: <StickyNote2OutlinedIcon />,
    iconFilled: <StickyNote2Icon />,
    href: "/notes",
  },
];

export default function NavBarComponent() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const t = useTranslations("Navbar");

  return (
    <Box className="flex flex-row justify-between font-sans text-[16px] w-full h-fit bg-off-white py-3 px-8 border-b-2 border-green-2">
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
          const fullHref =
            item.href === "/" ? `/${locale}` : `/${locale}${item.href}`; // <-- inject locale

          const selected = pathname === fullHref;

          return (
            <Tab
              key={fullHref}
              value={fullHref}
              component={Link}
              href={fullHref}
              label={t(item.key)}
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
      <div className="shrink-0 flex items-center gap-4">
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

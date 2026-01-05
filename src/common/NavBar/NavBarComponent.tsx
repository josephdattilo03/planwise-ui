"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { ReactNode, useState } from "react";
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
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

import { useSession, signOut } from "next-auth/react";

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
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Don't render navbar if not authenticated
  if (status === "loading" || !session) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box className="flex flex-row justify-between font-sans text-4 w-full h-fit bg-off-white py-3 px-8 border-b-2 border-green-2">
      <Image
        src="/logo.svg"
        alt="Planwise logo"
        width={170}
        height={43}
        priority
      />
      <Tabs
        value={pathname}
        className="my-3 min-h-0 h-auto items-center"
        textColor="inherit"
        indicatorColor="none"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scroll here"
      >
        {navItems.map((item) => {
          const fullHref =
            item.href === "/" ? `/${locale}` : `/${locale}${item.href}`;

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
                fontSize: "16px",
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
      <div className="shrink-0 flex items-center gap-2">
        <IconButton>
          <SearchIcon className="text-dark-green-2" />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon className="text-dark-green-2" />
        </IconButton>

        <div
          onClick={handleClick}
          className="flex flex-row gap-2 p-2 border border-dark-green-2 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <div className="text-right">
            <p className="font-medium text-dark-green-2">
              {session?.user?.name}
            </p>
            <p className="text-sm text-gray-600">{session?.user?.email}</p>
          </div>

          {session?.user?.image && (
            <Image
              src={session?.user?.image}
              width={40}
              height={40}
              alt="profile image"
              className="rounded-full"
            />
          )}
        </div>
      </div>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              mt: 0.5,
              zIndex: 9999,
              borderRadius: "12px",
            },
          },
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile & Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            signOut();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

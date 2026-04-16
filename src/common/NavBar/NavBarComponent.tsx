"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
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

import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "../ThemeToggle";
import { useTheme } from "../ThemeProvider";
import { useCanvasBriefing } from "@/src/app/providers/CanvasBriefingProvider";
import { postCanvasBackendSync } from "@/src/app/services/canvasBackendSync";
import { getDataMode } from "@/src/app/services/dataMode";


interface NavItem {
  key: string;
  icon: ReactElement;
  iconFilled: ReactElement;
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
  const { theme } = useTheme();
  const { setCanvasBriefing } = useCanvasBriefing();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [canvasSyncBusy, setCanvasSyncBusy] = useState(false);
  const [canvasSyncHint, setCanvasSyncHint] = useState<string | null>(null);
  const mockData = getDataMode() === "mock";

  useEffect(() => {
    if (open) {
      setCanvasSyncHint(null);
    }
  }, [open]);

  const handleManualCanvasSync = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      if (canvasSyncBusy || mockData) {
        return;
      }
      const backendUserId = session?.user?.email ?? session?.user?.id;
      if (!backendUserId) {
        return;
      }
      setCanvasSyncBusy(true);
      setCanvasSyncHint(null);
      try {
        const { ok, payload } = await postCanvasBackendSync(backendUserId);
        if (ok && payload.synced && payload.ai?.text) {
          setCanvasBriefing({
            text: payload.ai.text,
            proposed_actions: Array.isArray(payload.ai.proposed_actions)
              ? payload.ai.proposed_actions
              : [],
          });
          setCanvasSyncHint(t("canvasSyncBriefingReady"));
        } else if (ok && payload.synced) {
          setCanvasSyncHint(t("canvasSyncComplete"));
        } else if (ok && payload.skipped && payload.reason === "canvas_unchanged") {
          setCanvasSyncHint(t("canvasSyncUpToDate"));
        } else if (ok && payload.skipped && payload.reason === "canvas_not_configured") {
          setCanvasSyncHint(t("canvasSyncNotConnected"));
        } else if (ok && payload.skipped && payload.reason === "canvas_error") {
          setCanvasSyncHint(t("canvasSyncCanvasError"));
        } else if (ok && payload.skipped) {
          setCanvasSyncHint(t("canvasSyncNotConnected"));
        } else {
          setCanvasSyncHint(t("canvasSyncFailed"));
        }
      } catch {
        setCanvasSyncHint(t("canvasSyncFailed"));
      } finally {
        setCanvasSyncBusy(false);
      }
    },
    [
      canvasSyncBusy,
      mockData,
      session?.user?.email,
      session?.user?.id,
      setCanvasBriefing,
      t,
    ],
  );

  // Close the user menu when clicking anywhere outside of it (including portals
  // like the chatbot input). Using capture phase so stopPropagation inside
  // third-party components doesn't prevent this.
  // Must be declared before the early return to keep hook order stable.
  useEffect(() => {
    if (!open) return;

    const handlePointerDownCapture = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (
        menuRef.current?.contains(target) ||
        profileRef.current?.contains(target)
      ) {
        return;
      }

      setAnchorEl(null);
    };

    window.addEventListener("pointerdown", handlePointerDownCapture, true);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDownCapture, true);
    };
  }, [open]);

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
    <Box className="flex flex-row justify-between font-sans text-4 w-full h-fit bg-sidebar-bg py-3 px-8 border-b-2 border-green-1">
      <Image
        src={theme === "dark" ? "/Logo-Dark.svg" : "/logo.svg"}
        alt="Planwise logo"
        width={170}
        height={43}
        priority
      />
      <Tabs
        value={pathname}
        className="my-3 min-h-0 h-auto items-center"
        textColor="inherit"
        // indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scroll here"
        sx={{
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
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
                opacity: 1,
                fontSize: "16px",
                minHeight: 0,
                py: "4px",
                px: "10px",
                mx: "10px",
                fontWeight: 500,
                color: selected ? theme === "dark" ? "var(--dark-green-1)" : "var(--green-1)" : "var(--dark-green-2)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: selected ? theme === "dark" ? "var(--green-1)" : "var(--green-4)" : "transparent",
                "&:hover": {
                  backgroundColor: selected ? theme === "dark" ? "var(--green-1)" : "var(--green-4)" : "var(--beige)",
                },
              }}
            />
          );
        })}
      </Tabs>
      <div className="shrink-0 flex items-center gap-2">
        {/* <IconButton>
          <SearchIcon className="text-dark-green-2" />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon className="text-dark-green-2" />
        </IconButton> */}

        <div
          ref={profileRef}
          onClick={handleClick}
          className="flex flex-row gap-2 p-2 border border-border bg-card-bg rounded-lg cursor-pointer hover:bg-menu-item-hover transition-colors"
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <div className="text-right">
            <p className="font-medium text-dark-green-1">
              {session?.user?.name}
            </p>
            <p className="text-sm text-dark-green-2">{session?.user?.email}</p>
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
        ref={menuRef}
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
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--menu-bg)",
              border: "1px solid var(--border)",
              "& .MuiMenuItem-root": {
                color: "var(--dark-green-1)",
                "&:hover": {
                  backgroundColor: "var(--menu-item-hover)",
                },
              },
            },
          },
        }}
      >
        <MenuItem
          disabled={mockData || canvasSyncBusy}
          onClick={(e) => {
            void handleManualCanvasSync(e);
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {canvasSyncBusy ? (
              <CircularProgress size={18} thickness={5} />
            ) : (
              <CloudSyncOutlinedIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={canvasSyncBusy ? t("canvasSyncing") : t("canvasSync")}
            secondary={
              mockData
                ? t("canvasSyncDemo")
                : canvasSyncHint ?? undefined
            }
            secondaryTypographyProps={{
              sx: { fontSize: "0.75rem", mt: 0.25 },
            }}
          />
        </MenuItem>
        <Divider />
        <ThemeToggle onClose={handleClose} />
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

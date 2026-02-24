"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@/theme";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";

type ThemeColors = {
  background: string;
  paper: string;
  foreground: string;
  textSecondary: string;
  green1: string;
  green2: string;
};

function getCssVar(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

function resolveThemeColors(appTheme: "light" | "dark"): ThemeColors {
  const isDark = appTheme === "dark";

  // SSR-safe fallbacks (also used if CSS vars aren't available yet)
  const fallback = {
    background: isDark ? "#1a1d1f" : "#fffcf2",
    paper: isDark ? "#252825" : "#ffffff",
    foreground: isDark ? "#e8eae8" : "#222422",
    textSecondary: isDark ? "#b8c5ba" : "#435447",
    green1: isDark ? "#4a7a5a" : "#386641",
    green2: isDark ? "#5a8a6a" : "#6a994e",
  };

  return {
    background: getCssVar("--background", fallback.background),
    paper: getCssVar("--menu-bg", fallback.paper),
    foreground: getCssVar("--foreground", fallback.foreground),
    textSecondary: getCssVar("--dark-green-2", fallback.textSecondary),
    green1: getCssVar("--green-1", fallback.green1),
    green2: getCssVar("--green-2", fallback.green2),
  };
}

function buildMuiTheme(appTheme: "light" | "dark", colors: ThemeColors) {
  const mode = appTheme === "dark" ? "dark" : "light";

  return {
    ...theme,
    palette: {
      ...theme.palette,
      mode,
      // Set primary to our green so default focus rings aren't MUI blue
      primary: {
        ...theme.palette.primary,
        main: colors.green1,
      },
      success: {
        ...theme.palette.success,
        main: colors.green1,
      },
      background: {
        ...theme.palette.background,
        default: colors.background,
        paper: colors.paper,
      },
      text: {
        ...theme.palette.text,
        primary: colors.foreground,
        secondary: colors.textSecondary,
      },
      action: {
        ...theme.palette.action,
        active: colors.foreground,
      },
    },
    components: {
      ...(theme.components ?? {}),

      // Inputs: ensure focused borders/underlines use our green instead of default blue
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--green-1) !important",
            },
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            "&:after": {
              borderBottomColor: "var(--green-1)",
            },
          },
        },
      },

      // Pickers
      MuiPickersPopper: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--menu-bg)",
            border: "1px solid var(--card-border)",
          },
        },
      },
      MuiPickersCalendarHeader: {
        styleOverrides: {
          switchViewButton: {
            color: "var(--dark-green-1)",
          },
          iconButton: {
            color: "var(--dark-green-1)",
          },
        },
      },
      MuiPickersArrowSwitcher: {
        styleOverrides: {
          button: {
            color: "var(--dark-green-1)",
          },
        },
      },
      MuiDayCalendar: {
        styleOverrides: {
          root: { backgroundColor: "transparent" },
          weekContainer: { backgroundColor: "transparent" },
          weekDayLabel: { backgroundColor: "transparent" },
        },
      },
      MuiPickersSlideTransition: {
        styleOverrides: {
          root: { backgroundColor: "transparent" },
        },
      },
      MuiPickersDay: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              backgroundColor: `${colors.green1} !important`,
              color: "#fff",
              "&:hover": {
                backgroundColor: `${colors.green2} !important`,
              },
              "&:focus": {
                backgroundColor: `${colors.green1} !important`,
              },
            },
          },
        },
      },
    },
  };
}

function ThemedThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme: appTheme } = useTheme();
  const [muiTheme, setMuiTheme] = useState(() =>
    buildMuiTheme(appTheme, resolveThemeColors(appTheme))
  );

  useEffect(() => {
    setMuiTheme(buildMuiTheme(appTheme, resolveThemeColors(appTheme)));
  }, [appTheme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemedThemeRegistry>{children}</ThemedThemeRegistry>
    </AppRouterCacheProvider>
  );
}
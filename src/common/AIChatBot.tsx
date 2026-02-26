"use client";

import ChatBot from "react-chatbotify";
import { useTheme } from "@/src/common/ThemeProvider";
import type { Flow } from "react-chatbotify";

export default function AIChatBot() {
  const { theme } = useTheme();

  const flow: Flow = {
    start: {
      message: "Ask me for help with your schedule!",
      path: "gemini",
    },
    gemini: {
      message: async (params) => {
        const res = await fetch("/api/ai/gemini", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ prompt: params.userInput }),
        });
        const data = await res.json();
        return data.text ?? "Sorry—something went wrong.";
      },
      path: "gemini",
    },
  };

  const styles = {
    tooltipStyle: {
      backgroundColor: "var(--menu-bg)",
      color: "var(--foreground)",
      // border: "1px solid var(--card-border)",
      borderRadius: "var(--radius-md)",
      padding: "8px 10px",
      fontSize: "12px",
    },
    notificationBadgeStyle: {
      backgroundColor: "var(--red)",
      color: "#ffffff",
      borderRadius: 999,
      border: "2px solid var(--card-bg)",
    },
    headerStyle: {
      background: "var(--green-1)",
      color: "#ffffff",
      padding: "12px 14px",
      fontWeight: 400,
      letterSpacing: "-0.2px",
      borderColor: "var(--border)"
    },
    bodyStyle: {
      backgroundColor: "var(--background)",
      padding: "12px",
    },
    userBubbleStyle: {
      textAlign: "left",
      fontSize: "14px"
    },
    botBubbleStyle: {
      fontSize: "14px"
    },
    chatInputContainerStyle: {
      backgroundColor: "var(--off-white)",
      borderTop: "1px solid var(--card-border)",
      padding: "10px",
    },
    chatInputAreaStyle: {
      backgroundColor: "var(--input-bg)",
      color: "var(--input-text)",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "var(--input-border)",
      borderRadius: "var(--radius-md)",
      padding: "10px 12px",
      fontSize: "12px"
    },
    chatInputAreaFocusedStyle: {
      borderColor: "var(--green-1)",
      boxShadow:
        "0 0 0 3px color-mix(in srgb, var(--green-1) 22%, transparent)",
    },
    chatInputAreaDisabledStyle: {
      backgroundColor: "var(--task-inactive-button)",
      borderColor: "var(--task-inactive-stroke)",
      color: "var(--dark-green-2)",
      cursor: "not-allowed",
    },
    characterLimitStyle: {
      color: "var(--dark-green-2)",
      fontSize: "12px",
      minWidth: "50px"
    },
    characterLimitReachedStyle: {
      color: "var(--red)",
      fontSize: "12px",
      fontWeight: 400,
    },
    botOptionStyle: {
      backgroundColor: "var(--menu-bg)",
      color: theme === "dark" ? "#ffffff" : "var(--green-2)",
      border: "1px solid var(--green-2)",
      borderRadius: "var(--radius-lg)",
      padding: "10px 12px",
    },
    botOptionHoveredStyle: {
      backgroundColor: "var(--green-2)",
      color: "#ffffff",
      border: "1px solid var(--green-2)",
      borderRadius: "var(--radius-lg)",
      padding: "10px 12px",
    },
    chatHistoryButtonStyle: {
      backgroundColor: "transparent",
    },
    sendButtonStyle: {
      borderRadius: "var(--radius-md)",
    }

  };

  const settings = {
    voice: {
      disabled: true,
    },
    botBubble: {
      simulateStream: true,
    },
    notification: {
      showCount: false,
    },
    fileAttachment: {
      disabled: true,
    },
    general: {
      primaryColor: "var(--green-2)",
      secondaryColor: "var(--green-1)",
      showFooter: false,
      fontFamily: "var(--font-plex-sans)",
    },
    header: {
      title: "Planwise AI",
      showAvatar: false,
    },
    emoji: {
      disabled: true,
    },
    chatInput: {
      characterLimit: 200,
      showCharacterCount: true,
    },
    tooltip: {
      mode: "CLOSE",
      text: "Ask me for help with your schedule!",
    },
    chatButton: {
      icon: "/owl.svg",
    },
  };

  return <ChatBot settings={settings} styles={styles} flow={flow} />;
}

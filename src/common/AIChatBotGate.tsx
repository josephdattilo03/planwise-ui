"use client";

import { useSession } from "next-auth/react";
import AIChatBot from "@/src/common/AIChatBot";

/**
 * Renders the Planwise AI chatbot only when the user is authenticated.
 * Use this in the layout so the chatbot appears on all pages after sign-in.
 */
export default function AIChatBotGate() {
  const { status } = useSession();

  if (status !== "authenticated") {
    return null;
  }

  return <AIChatBot />;
}

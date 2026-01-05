"use server";
import { auth } from "@/auth";
import type { Session } from "next-auth";

export const getSession = async (): Promise<Session | null> => {
  const session = await auth();
  return session;
};

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  // Required on EC2 / behind proxies so Auth.js accepts the public Host (see UntrustedHost).
  trustHost: true,
});


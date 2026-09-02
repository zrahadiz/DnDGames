// lib/auth-client.ts  ← client only
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({});
console.log("auth baseURL:", process.env.NEXT_PUBLIC_BETTER_AUTH_URL);

export const { useSession, signIn, signOut, signUp } = authClient;

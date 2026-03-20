import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js"

import { prisma } from "./prisma";

const baseURL = process.env.BETTER_AUTH_URL;
if (!baseURL) {
  throw new Error("Missing BETTER_AUTH_URL env var.");
}

export const auth = betterAuth({
    baseURL,
    basePath: "/api/auth",
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [nextCookies()],
    socialProviders: {
        twitch: { 
            clientId: process.env.TWITCH_CLIENT_ID as string, 
            clientSecret: process.env.TWITCH_CLIENT_SECRET as string, 
        }, 
    }
});
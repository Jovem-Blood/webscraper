import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../db";
import * as schema from "../../db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),

    user: {
        changeEmail: { 
            enabled: true,
            updateEmailWithoutVerification: true
        },
        deleteUser: { 
            enabled: true
        }
    },

    emailAndPassword: { 
        enabled: true, 
    },

    trustedOrigins: process.env.TRUSTED_ORIGINS,
    
});
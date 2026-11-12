import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS ?? '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [Google],
    pages: {
        error: '/access-denied'
    },
    callbacks: {
        signIn({ account, profile }) {
            if (account?.provider === 'google') {
                const email = profile?.email?.toLowerCase();

                if (!email || !profile?.email_verified) { return false; }
                return allowedDomains.includes(email.split('@')[1]);
            }

            return false;
        }
    }
});
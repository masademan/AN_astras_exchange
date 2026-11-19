import { createClient } from "@supabase/supabase-js";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS ?? '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [Google],
    pages: {
        error: '/access-denied'
    },
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === 'google') {
                const email = profile?.email?.toLowerCase();

                if (!email || !profile?.email_verified) { return false; }
                if (!allowedDomains.includes(email.split('@')[1])) { return false; }

                try {
                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
                        process.env.SUPABASE_SECRET_KEY ?? ''
                    );

                    const { error: insertError } = await supabase.from("users").upsert(
                        { email: email, full_name: profile.name, avatar_url: profile.picture },
                        { onConflict: "email", ignoreDuplicates: true }
                    );

                    if (insertError) throw insertError;

                    const { error: updateError } = await supabase
                                                            .from("users")
                                                            .update({ avatar_url: profile.picture })
                                                            .eq("email", email)
                                                            .select("email")
                                                            .single();

                    if (updateError) throw updateError;
                }
                catch (error) {
                    console.error("Failed to save user during sign-in:", error);
                    return "/login-error";
                }

                return true;
            }

            return false;
        }
    }
});
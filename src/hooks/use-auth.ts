import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();

  // Public study features, including Ask POLY AI, should work without a
  // blocking sign-in screen. Create one anonymous Convex session per visitor.
  useEffect(() => {
    if (
      !isAuthLoading &&
      !isAuthenticated &&
      user === null
    ) {
      let cancelled = false;
      const connectAnonymousSession = async () => {
        for (let attempt = 0; attempt < 3 && !cancelled; attempt += 1) {
          try {
            await signIn("anonymous");
            return;
          } catch (error) {
            console.warn(`Anonymous session attempt ${attempt + 1} failed`, error);
            if (attempt < 2) {
              await new Promise((resolve) => window.setTimeout(resolve, 1_000 * (attempt + 1)));
            }
          }
        }
      };
      void connectAnonymousSession();
      return () => {
        cancelled = true;
      };
    }
  }, [isAuthLoading, isAuthenticated, user, signIn]);

  // Derive isLoading directly from the dependencies instead of managing separate state
  const isLoading = isAuthLoading || user === undefined;

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}

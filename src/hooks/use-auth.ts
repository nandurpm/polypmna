import { useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();
  const anonymousAttempted = useRef(false);

  // Public study features, including Ask POLY AI, should work without a
  // blocking sign-in screen. Create one anonymous Convex session per visitor.
  useEffect(() => {
    if (
      !isAuthLoading &&
      !isAuthenticated &&
      user === null &&
      !anonymousAttempted.current
    ) {
      anonymousAttempted.current = true;
      void signIn("anonymous").catch(() => {
        // Keep public read-only pages usable if anonymous auth is unavailable.
      });
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

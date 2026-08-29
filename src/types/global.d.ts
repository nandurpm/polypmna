/*
 * ============================================================
 * FILE: global.d.ts
 * PURPOSE: Declares application-wide browser and build-time type augmentations.
 * ============================================================
 */

declare global {
  interface Window {
    /**
     * Navigate to the auth page with a custom redirect URL
     * @param redirectUrl - URL to redirect to after successful authentication
     */
    navigateToAuth: (redirectUrl: string) => void;
  }
}

export {};

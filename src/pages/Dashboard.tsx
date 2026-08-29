/*
 * ============================================================
 * FILE: Dashboard.tsx
 * PURPOSE: Redirects the legacy authenticated dashboard route to the current POLY AI workspace.
 * ============================================================
 */

import { Navigate } from "react-router";

/** Compatibility route: legacy dashboard bookmarks now open the complete directory. */
export default function Dashboard() {
  return <Navigate to="/curriculum" replace />;
}

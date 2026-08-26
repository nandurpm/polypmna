import { Navigate } from "react-router";

/** Compatibility route: legacy dashboard bookmarks now open the complete directory. */
export default function Dashboard() {
  return <Navigate to="/curriculum" replace />;
}

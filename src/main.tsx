import { Toaster } from "@/components/ui/sonner";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import SeoHead from "./components/SeoHead";
import { RequireAuth } from "./components/RequireAuth";
import { getRuntimeBasePath } from "./lib/siteBase";
import "./index.css";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const AskAI = lazy(() => import("./pages/AskAI.tsx"));
const MockExams = lazy(() => import("./pages/MockExams.tsx"));
const QuestionPapers = lazy(() => import("./pages/QuestionPapers.tsx"));
const StudentTools = lazy(() => import("./pages/StudentTools.tsx"));
const SubjectDetail = lazy(() => import("./pages/SubjectDetail.tsx"));
const PDFViewer = lazy(() => import("./pages/PDFViewer.tsx"));
const LessonViewer = lazy(() => import("./pages/LessonViewer.tsx"));
const ResourceHub = lazy(() => import("./pages/ResourceHub.tsx"));
const CurriculumBrowser = lazy(() => import("./pages/CurriculumBrowser.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: "" };
  static getDerivedStateFromError() {
    return {
      hasError: true,
      message: "Something went wrong while loading this page.",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Please reload the page. If the problem continues, report the page and action that caused it.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function normalizeLegacyHashRoute() {
  if (!window.location.hash.startsWith("#/")) return;
  const base = getRuntimeBasePath().replace(/\/$/, "");
  const target = window.location.hash.slice(1);
  window.history.replaceState(null, "", `${base}${target}`);
}

// Static builds must provide their own backend URL. Do not silently connect
// forks or alternate deployments to the POLY PMNA production database.
const runtimeBasePath = getRuntimeBasePath();
normalizeLegacyHashRoute();

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL is required for this deployment");
}
const convex = new ConvexReactClient(convexUrl);



function RouteSyncer() {
  const location = useLocation();
  const parentOrigin = (() => {
    try {
      return document.referrer ? new URL(document.referrer).origin : window.location.origin;
    } catch {
      return window.location.origin;
    }
  })();

  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: "iframe-route-change", path: location.pathname },
        parentOrigin,
      );
    }
  }, [location.pathname, parentOrigin]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== window.parent || event.origin !== parentOrigin) return;
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [parentOrigin]);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter basename={runtimeBasePath}>
          <RouteSyncer />
          <SeoHead />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/auth"
                element={<AuthPage />}
              />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              {/* POLY AI remains public and creates an anonymous Convex session
                  when available; its offline fallback must work without auth. */}
              <Route path="/ask-ai" element={<AskAI />} />
              <Route path="/ask-poly.html" element={<AskAI />} />
              <Route path="/ask-ai" element={<RequireAuth><AskAI /></RequireAuth>} />
              <Route path="/mock-exams" element={<RequireAuth><MockExams /></RequireAuth>} />
              <Route path="/question-papers" element={<QuestionPapers />} />
              <Route path="/student-tools" element={<StudentTools />} />
              <Route path="/subject/:subjectId" element={<SubjectDetail />} />
              <Route path="/pdf" element={<PDFViewer />} />
              <Route path="/lesson" element={<LessonViewer />} />
              <Route path="/resources" element={<ResourceHub />} />
              <Route path="/curriculum" element={<CurriculumBrowser />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);

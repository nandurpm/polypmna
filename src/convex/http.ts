/*
 * ============================================================
 * FILE: http.ts
 * PURPOSE: Registers Convex Auth HTTP routes on the backend HTTP router.
 * ============================================================
 */

import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

export default http;

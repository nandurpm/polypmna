/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiChat from "../aiChat.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as chat from "../chat.js";
import type * as createRepo from "../createRepo.js";
import type * as departments from "../departments.js";
import type * as github from "../github.js";
import type * as http from "../http.js";
import type * as materials from "../materials.js";
import type * as mockExams from "../mockExams.js";
import type * as questionPapers from "../questionPapers.js";
import type * as seed from "../seed.js";
import type * as subjects from "../subjects.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiChat: typeof aiChat;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  chat: typeof chat;
  createRepo: typeof createRepo;
  departments: typeof departments;
  github: typeof github;
  http: typeof http;
  materials: typeof materials;
  mockExams: typeof mockExams;
  questionPapers: typeof questionPapers;
  seed: typeof seed;
  subjects: typeof subjects;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

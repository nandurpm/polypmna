/*
 * ============================================================
 * FILE: utils.ts
 * PURPOSE: Provides the shared Tailwind-aware class-name merge helper.
 * ============================================================
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*
 * ============================================================
 * FILE: skeleton.tsx
 * PURPOSE: Provides the reusable skeleton UI primitive used by POLY PMNA screens.
 * ============================================================
 */

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }

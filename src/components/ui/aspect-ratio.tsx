/*
 * ============================================================
 * FILE: aspect-ratio.tsx
 * PURPOSE: Provides the reusable aspect-ratio UI primitive used by POLY PMNA screens.
 * ============================================================
 */

"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }

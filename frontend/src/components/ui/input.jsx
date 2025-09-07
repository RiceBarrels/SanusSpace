import * as React from "react"

import { cn } from "@/lib/utils"
import { lightHapticsImpact } from "@/lib/haptics"

function Input({
  className,
  type,
  onFocus,
  onBlur,
  haptics = true,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-foreground/10 flex h-9 w-full min-w-0 rounded-md border-y bg-foreground/5 backdrop-blur-sm px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
        "focus-visible:bg-background/65",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      onFocus={() => {
        if (haptics) {
          lightHapticsImpact();
        }
        onFocus?.();
      }}
      onBlur={() => {
        if (haptics) {
          lightHapticsImpact();
        }
        onBlur?.();
      }}
      {...props} />
  );
}

export { Input }

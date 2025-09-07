import * as React from "react"
import { lightHapticsImpact } from "@/lib/haptics"
import { cn } from "@/lib/utils"

function Textarea({
  className,
  rows,
  haptics = true,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-foreground/10 border-t border-b bg-foreground/5 backdrop-blur-sm placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:bg-primary/10 aria-invalid:border-destructive/20 dark:aria-invalid:border-destructive/40 dark:bg-input/30 flex field-sizing-content w-full rounded-md px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      onFocus={() => {
        if (haptics) {
          lightHapticsImpact();
        }
      }}
      onBlur={() => {
        if (haptics) {
          lightHapticsImpact();
        }
      }}
      {...props} />
  );
}

export { Textarea }

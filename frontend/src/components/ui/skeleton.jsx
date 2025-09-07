import { cn } from "@/lib/utils"

function Skeleton({
  className,
  children,
  ...props
}) {
  return (
    <span
      data-slot="skeleton"
      className={cn("bg-foreground/10 animate-pulse rounded-md text-transparent inline-block", className)}
      {...props} 
    >
      {children}
    </span>
  );
}

export { Skeleton }

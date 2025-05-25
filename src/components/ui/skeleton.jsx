import { cn } from "@/lib/utils"

function Skeleton({
  className,
  children,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-foreground/10 animate-pulse rounded-md text-transparent", className)}
      {...props} 
    >
      {children}
    </div>
  );
}

export { Skeleton }

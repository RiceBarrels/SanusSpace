"use client"

import { MobileSafeAreaTopPx } from "@/lib/mobileSafeArea";
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";


const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      offset={{top: MobileSafeAreaTopPx()}} mobileOffset={{top: MobileSafeAreaTopPx()}}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        }
      }
      {...props} />
  );
}

export { Toaster }

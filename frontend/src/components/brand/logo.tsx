"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "icon" | "white" | "black" | "gradient" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: "text-lg", tagline: "text-[10px]" },
  md: { icon: 36, text: "text-2xl", tagline: "text-xs" },
  lg: { icon: 44, text: "text-3xl", tagline: "text-sm" },
  xl: { icon: 56, text: "text-4xl", tagline: "text-base" },
};

const textColors = {
  default: { command: "text-foreground", desk: "text-teal font-extrabold" },
  icon: { command: "text-foreground", desk: "text-teal font-extrabold" },
  white: { command: "text-white", desk: "text-teal-300 font-extrabold" },
  black: { command: "text-foreground", desk: "text-teal font-extrabold" },
  gradient: { command: "text-foreground", desk: "text-teal font-extrabold" },
  dark: { command: "text-white", desk: "text-teal-400 font-extrabold" },
};

export function CommandDeskLogo({
  variant = "default",
  size = "md",
  showTagline = false,
  className,
}: LogoProps) {
  const dimensions = sizes[size];
  const colors = textColors[variant];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex-shrink-0"
      >
        <Image
          src="/brand/commanddesk-icon-512.png"
          alt="CommandDesk"
          width={dimensions.icon}
          height={dimensions.icon}
          priority
        />
      </motion.div>

      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className={cn("font-heading font-bold tracking-tight", dimensions.text, colors.command)}>
            Command
          </span>
          <span className={cn("font-heading font-bold tracking-tight", dimensions.text, colors.desk)}>
            Desk
          </span>
        </div>
        {showTagline && (
          <span
            className={cn(
              "font-medium uppercase tracking-wider",
              dimensions.tagline,
              variant === "white" || variant === "dark" ? "text-white/70" : "text-muted-foreground",
            )}
          >
            Manage &bull; Monitor &bull; Grow
          </span>
        )}
      </div>
    </div>
  );
}

export function CommandDeskIcon({
  size = "md",
  className,
}: Omit<LogoProps, "showTagline">) {
  const iconSize = sizes[size].icon;

  return (
    <Image
      src="/brand/commanddesk-icon-512.png"
      alt="CommandDesk"
      width={iconSize}
      height={iconSize}
      className={cn("flex-shrink-0", className)}
      priority
    />
  );
}

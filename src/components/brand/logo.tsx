"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LogoProps {
  variant?: "default" | "icon" | "white" | "black" | "gradient" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

export function CommandDeskLogo({
  variant = "default",
  size = "md",
  showTagline = false,
  className,
}: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-lg", tagline: "text-[10px]" },
    md: { icon: 36, text: "text-2xl", tagline: "text-xs" },
    lg: { icon: 44, text: "text-3xl", tagline: "text-sm" },
    xl: { icon: 56, text: "text-4xl", tagline: "text-base" },
  };

  const { icon, text, tagline } = sizes[size];

  type LogoVariant = "default" | "icon" | "white" | "black" | "gradient" | "dark";

  const iconColors: Record<LogoVariant, string> = {
    default: "text-primary",
    icon: "text-primary",
    white: "text-white",
    black: "text-navy-900",
    gradient: "",
    dark: "text-white",
  };

  const textColors: Record<LogoVariant, { command: string; desk: string }> = {
    default: { command: "text-navy-900", desk: "text-teal" },
    icon: { command: "text-navy-900", desk: "text-teal" },
    white: { command: "text-white", desk: "text-teal-300" },
    black: { command: "text-navy-900", desk: "text-teal" },
    gradient: { command: "text-navy-900", desk: "text-teal" },
    dark: { command: "text-white", desk: "text-teal-400" },
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative flex-shrink-0",
          variant === "gradient" && "gradient-primary rounded-xl p-1"
        )}
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            variant !== "gradient" ? iconColors[variant] : "text-white"
          )}
        >
          {/* Outer square frame */}
          <rect
            x="2"
            y="2"
            width="52"
            height="52"
            rx="12"
            stroke="currentColor"
            strokeWidth="3"
            fill={variant === "gradient" ? "none" : "none"}
          />
          {/* Letter C */}
          <path
            d="M14 28C14 20.268 20.268 14 28 14"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M14 28C14 35.732 20.268 42 28 42"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Letter D */}
          <path
            d="M32 18V38"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M32 18C37.523 18 42 22.477 42 28C42 33.523 37.523 38 32 38"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Ascending bar chart (negative space) */}
          <rect x="20" y="30" width="4" height="8" rx="1" fill="currentColor" opacity="0.3" />
          <rect x="26" y="26" width="4" height="12" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="32" y="22" width="4" height="16" rx="1" fill="currentColor" opacity="0.7" />
        </svg>
      </motion.div>

      {/* Text */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-0">
          <span
            className={cn(
              "font-heading font-bold tracking-tight",
              text,
              textColors.command[variant]
            )}
          >
            Command
          </span>
          <span
            className={cn(
              "font-heading font-bold tracking-tight",
              text,
              textColors.desk[variant]
            )}
          >
            Desk
          </span>
        </div>
        {showTagline && (
          <span
            className={cn(
              "font-medium tracking-wider uppercase",
              tagline,
              variant === "white" || variant === "dark"
                ? "text-white/60"
                : "text-navy-400"
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
  variant = "default",
  size = "md",
  className,
}: Omit<LogoProps, "showTagline">) {
  const iconSize = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const size_px = iconSize[size];

  return (
    <svg
      width={size_px}
      height={size_px}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        variant === "default" && "text-primary",
        variant === "white" && "text-white",
        variant === "black" && "text-navy-900",
        variant === "dark" && "text-white",
        className
      )}
    >
      <rect
        x="2"
        y="2"
        width="52"
        height="52"
        rx="12"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M14 28C14 20.268 20.268 14 28 14"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M14 28C14 35.732 20.268 42 28 42"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 18V38"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 18C37.523 18 42 22.477 42 28C42 33.523 37.523 38 32 38"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="20" y="30" width="4" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="26" y="26" width="4" height="12" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="32" y="22" width="4" height="16" rx="1" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

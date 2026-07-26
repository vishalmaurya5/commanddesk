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
  default: { command: "text-[#1F1F1F] dark:text-white", desk: "text-[#1976FF] font-extrabold" },
  icon: { command: "text-[#1F1F1F] dark:text-white", desk: "text-[#1976FF] font-extrabold" },
  white: { command: "text-white", desk: "text-[#5EA0FF] font-extrabold" },
  black: { command: "text-[#1F1F1F]", desk: "text-[#1976FF] font-extrabold" },
  gradient: { command: "text-[#1F1F1F] dark:text-white", desk: "text-[#1976FF] font-extrabold" },
  dark: { command: "text-white", desk: "text-[#5EA0FF] font-extrabold" },
};

export function SolubrixLogo({
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
          src="/brand/solubrix-icon-transparent.png"
          alt="SOLUBRIX"
          width={dimensions.icon}
          height={dimensions.icon}
          priority
        />
      </motion.div>

      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className={cn("font-heading font-bold tracking-tight", dimensions.text, colors.command)}>
            SOLU
          </span>
          <span className={cn("font-heading font-bold tracking-tight", dimensions.text, colors.desk)}>
            BRIX
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
            Solutions That Build Futures
          </span>
        )}
      </div>
    </div>
  );
}

export function SolubrixIcon({
  size = "md",
  className,
}: Omit<LogoProps, "showTagline">) {
  const iconSize = sizes[size].icon;

  return (
    <Image
      src="/brand/solubrix-icon-transparent.png"
      alt="SOLUBRIX"
      width={iconSize}
      height={iconSize}
      className={cn("flex-shrink-0", className)}
      priority
    />
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function Avatar({ className, size = "md", ...props }: AvatarProps) {
  const sizeClass =
    size === "sm"
      ? "w-8 h-8"
      : size === "lg"
      ? "w-16 h-16"
      : "w-12 h-12";
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold ring-2 ring-indigo-300",
        sizeClass,
        className
      )}
      {...props}
    />
  );
}

export function AvatarFallback({ children }: { children: React.ReactNode }) {
  return <span className="select-none">{children}</span>;
}

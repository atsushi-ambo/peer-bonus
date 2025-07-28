import * as React from "react"
import { cn } from "@/lib/utils"

const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onValueChange?: (v: string) => void }
>(({ className, children, onValueChange, ...props }, ref) => {
  // Wrapper for value change logic
  return (
    <div ref={ref} className={cn("command relative w-full", className)} {...props}>
      {children}
    </div>
  )
})
Command.displayName = "Command"

export function CommandInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full px-3 py-2 border rounded mb-2" {...props} />
}

export function CommandList({ children }: { children: React.ReactNode }) {
  return <div className="max-h-60 overflow-auto border rounded bg-popover">{children}</div>
}

export function CommandGroup({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden">{children}</div>
}

export function CommandItem({ value, children, onSelect }: { value: string; children: React.ReactNode; onSelect?: (v: string) => void }) {
  return (
    <div
      className="px-3 py-2 cursor-pointer hover:bg-accent"
      onClick={() => onSelect?.(value)}
      tabIndex={0}
      role="option"
      aria-selected={false}
    >
      {children}
    </div>
  )
}

export { Command }

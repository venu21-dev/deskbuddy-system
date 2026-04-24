import { cn } from "../../lib/utils";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/20",
        className
      )}
      {...props}
    />
  );
}

import { cn } from "../../lib/utils";

export function Badge({ children, className = "" }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-white text-black", className)}>
      {children}
    </span>
  );
}

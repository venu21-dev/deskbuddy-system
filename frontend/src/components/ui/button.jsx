import { cn } from "../../lib/utils";

export function Button({ children, className = "", variant = "default", disabled, ...props }) {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition disabled:opacity-50";
  const variants = {
    default: "bg-[#d9dfd2] text-black hover:bg-white",
    outline: "border border-white/10 bg-transparent text-white hover:bg-white hover:text-black",
  };

  return (
    <button className={cn(base, variants[variant], className)} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

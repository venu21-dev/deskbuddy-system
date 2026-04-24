import { cn } from "../../lib/utils";

export function Card({ children, className = "" }) {
  return (
    <div className={cn("rounded-[28px] border border-white/10 bg-white/[0.03] text-white shadow-none", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function CardHeader({ children, className = "" }) {
  return <div className={cn("p-6 pb-0", className)}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={cn("text-lg font-semibold", className)}>{children}</h3>;
}

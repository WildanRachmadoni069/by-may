import { Loader2 } from "lucide-react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div role="status" className={className} {...props}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

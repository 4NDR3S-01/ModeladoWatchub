import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  className?: string;
}

export function CustomToast({ 
  title, 
  description, 
  type = "info",
  className 
}: ToastProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-l-green-500";
      case "error":
        return "border-l-red-500";
      case "warning":
        return "border-l-yellow-500";
      default:
        return "border-l-blue-500";
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 bg-background border border-border rounded-lg shadow-lg border-l-4",
        getBorderColor(),
        className
      )}
    >
      {getIcon()}
      <div className="flex-1">
        {title && (
          <h4 className="font-semibold text-foreground text-sm">{title}</h4>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
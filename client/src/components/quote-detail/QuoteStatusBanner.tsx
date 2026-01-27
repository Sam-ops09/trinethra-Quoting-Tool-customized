import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  Ban,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuoteStatusBannerProps {
  status: string;
}

export function QuoteStatusBanner({ status }: QuoteStatusBannerProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "draft":
        return {
          icon: Clock,
          label: "Draft",
          description: "This quote is in draft state and hasn't been sent yet.",
          color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800",
          iconColor: "text-slate-500",
        };
      case "sent":
        return {
          icon: AlertCircle,
          label: "Sent",
          description: "This quote has been sent to the client and is awaiting response.",
          color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
          iconColor: "text-blue-500",
        };
      case "approved":
        return {
          icon: CheckCircle2,
          label: "Approved",
          description: "This quote has been approved by the client.",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
          iconColor: "text-emerald-500",
        };
      case "rejected":
        return {
          icon: XCircle,
          label: "Rejected",
          description: "This quote has been rejected.",
          color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
          iconColor: "text-red-500",
        };
      case "invoiced":
        return {
          icon: FileCheck,
          label: "Invoiced",
          description: "This quote has been converted to an invoice.",
          color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
          iconColor: "text-purple-500",
        };
      case "closed_paid":
        return {
          icon: Archive,
          label: "Paid & Closed",
          description: "This quote is paid and closed.",
          color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
          iconColor: "text-green-500",
        };
       case "closed_cancelled":
        return {
          icon: Ban,
          label: "Cancelled",
          description: "This quote has been cancelled.",
          color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
          iconColor: "text-gray-500",
        };
      default:
        return {
          icon: Clock,
          label: status,
          description: "Unknown status",
          color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800",
          iconColor: "text-slate-500",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-4 rounded-xl border",
        config.color
      )}
    >
      <div className={cn("p-2 rounded-lg bg-white/50 dark:bg-black/20 shrink-0", config.iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-0.5">
        <h3 className="font-semibold">{config.label}</h3>
        <p className="text-sm opacity-90">{config.description}</p>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Home,
  ChevronRight,
  Pencil,
  Copy,
  Download,
  Send,
  Loader2,
  Package,
} from "lucide-react";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions-new";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

interface QuoteHeaderProps {
  quote: any;
  setLocation: (path: string) => void;
  onClone: () => void;
  onDownloadPdf: () => void;
  onSendEmail: () => void;
  onCreateSalesOrder: () => void;
  onCreateVendorPO: () => void;
  isDownloading: boolean;
  clonePending: boolean;
  createSalesOrderPending: boolean;
  hasSalesOrder: boolean;
  salesOrder?: any;
}

export function QuoteHeader({
  quote,
  setLocation,
  onClone,
  onDownloadPdf,
  onSendEmail,
  onCreateSalesOrder,
  onCreateVendorPO,
  isDownloading,
  clonePending,
  createSalesOrderPending,
  hasSalesOrder,
  salesOrder,
}: QuoteHeaderProps) {
  const { user } = useAuth();
  
  // Feature flags
  const canSendEmail = useFeatureFlag('quotes_emailSending');
  const canGeneratePDF = useFeatureFlag('quotes_pdfGeneration');
  const canConvertToSalesOrder = useFeatureFlag('quotes_convertToSalesOrder');
  const canClone = useFeatureFlag('quotes_clone');
  const canCreateVendorPO = useFeatureFlag('vendorPO_create');

  const canEdit = quote.status !== "invoiced" && user && hasPermission(user.role, "quotes", "edit");

  return (
    <div className="space-y-6">
      {/* Premium Breadcrumbs */}
      <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <button
          onClick={() => setLocation("/quotes")}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Quotes</span>
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
          <FileText className="h-3.5 w-3.5" />
          Quote {quote.quoteNumber} (v{quote.version})
        </span>
      </nav>

      {/* Header Content */}
      <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="relative px-6 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 shadow-lg">
                  <FileText className="h-6 w-6 text-white dark:text-slate-900" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    Quote {quote.quoteNumber}
                    <Badge variant="outline" className="text-sm font-medium h-7 px-3 bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                      v{quote.version}
                    </Badge>
                  </h1>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Edit Button */}
              {canEdit && (
                <PermissionGuard resource="quotes" action="edit">
                  <Button
                    variant="outline"
                    onClick={() => setLocation(`/quotes/${quote.id}/edit`)}
                    className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </PermissionGuard>
              )}

              {/* View Sales Order */}
              {hasSalesOrder && (
                  <Button
                    variant="outline"
                    onClick={() => setLocation(`/sales-orders/${salesOrder.id}`)}
                    className="h-10 px-4 rounded-xl border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    View Order
                  </Button>
              )}

              {/* Clone Button */}
              {canClone && (
                <PermissionGuard resource="quotes" action="create">
                  <Button
                    variant="outline"
                    onClick={onClone}
                    disabled={clonePending}
                    className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {clonePending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Clone
                  </Button>
                </PermissionGuard>
              )}

              {/* Download PDF */}
              {canGeneratePDF && (
                <Button
                    variant="outline"
                    onClick={onDownloadPdf}
                    disabled={isDownloading}
                    className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    {isDownloading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    PDF
                </Button>
              )}

              {/* Send Email */}
              {canSendEmail && (
                  <PermissionGuard resource="quotes" action="edit">
                      <Button
                        variant="outline"
                        onClick={onSendEmail}
                        className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                  </PermissionGuard>
              )}

              {/* Create Sales Order */}
              {quote.status === "approved" && canConvertToSalesOrder && !hasSalesOrder && (
                 <PermissionGuard resource="sales-orders" action="create">
                   <Button
                     onClick={onCreateSalesOrder}
                     disabled={createSalesOrderPending}
                     className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                   >
                     {createSalesOrderPending ? (
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     ) : (
                         <Package className="h-4 w-4 mr-2" />
                     )}
                     Create Order
                   </Button>
                 </PermissionGuard>
              )}

              {/* Create Vendor PO */}
               {canCreateVendorPO && user && hasPermission(user.role, "vendor-pos", "create") && (
                 <Button
                   variant="outline"
                   onClick={onCreateVendorPO}
                   className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                 >
                   <Package className="h-4 w-4 mr-2" />
                   Vendor PO
                 </Button>
               )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

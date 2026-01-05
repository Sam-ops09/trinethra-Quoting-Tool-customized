import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowRight } from "lucide-react";

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
}

interface QuoteVersion {
  id: string;
  version: number;
  status: string;
  total: string;
  subtotal: string;
  discount: string;
  shippingCharges: string;
  validityDays: number;
  referenceNumber: string;
  createdAt: string;
  itemsSnapshot: string;
  notes: string;
  termsAndConditions: string;
  revisionNotes: string;
}

interface CurrentQuote {
  version: number;
  status: string;
  total: string;
  subtotal: string;
  discount: string;
  shippingCharges: string;
  validityDays: number;
  referenceNumber: string;
  updatedAt: string;
  items: QuoteItem[];
  notes: string;
  termsAndConditions: string;
}

interface VersionComparisonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuote: CurrentQuote;
  versionNumber: number | null;
  quoteId: string;
}

export function VersionComparisonDialog({ 
  isOpen, 
  onOpenChange, 
  currentQuote, 
  versionNumber,
  quoteId
}: VersionComparisonDialogProps) {
  
  const { data: version, isLoading } = useQuery<QuoteVersion>({
    queryKey: [`/api/quotes/${quoteId}/versions/${versionNumber}`],
    enabled: !!versionNumber && isOpen,
  });

  if (!versionNumber) return null;

  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString()}`;
  };

  const hasChanged = (val1: unknown, val2: unknown) => val1 != val2;

  // Helper to render field comparison
  const FieldComparison = ({ label, oldVal, newVal, type = "text" }: { 
    label: string, 
    oldVal: string | number | undefined, 
    newVal: string | number | undefined, 
    type?: "text" | "currency" | "status" 
  }) => {
    const changed = hasChanged(oldVal, newVal);
    const displayOld = type === "currency" ? formatCurrency(oldVal ?? 0) : oldVal;
    const displayNew = type === "currency" ? formatCurrency(newVal ?? 0) : newVal;

    return (
      <div className={`grid grid-cols-2 gap-4 p-2 rounded ${changed ? 'bg-amber-50 dark:bg-amber-950/30' : ''}`}>
        <div className="text-xs">
          <p className="font-semibold text-slate-500 mb-0.5">{label}</p>
          <div className={`${changed ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-slate-200'}`}>
             {displayOld || '-'}
          </div>
        </div>
        <div className="text-xs border-l pl-4 border-slate-200 dark:border-slate-800">
           {changed ? (
             <div className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
               {displayNew || '-'}
             </div>
           ) : (
             <div className="text-slate-900 dark:text-slate-200">{displayNew || '-'}</div>
           )}
        </div>
      </div>
    );
  };

  // Parse items snapshot
  const oldItems = (version?.itemsSnapshot ? JSON.parse(version.itemsSnapshot) : []) as QuoteItem[];
  const newItems = currentQuote.items;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Compare Versions</DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-xs">
             <div className="flex flex-col">
               <span className="font-bold">Version {version?.version}</span>
               <span>{version?.createdAt ? new Date(version.createdAt).toLocaleDateString() : '-'}</span>
             </div>
             <ArrowRight className="h-4 w-4 text-slate-400" />
             <div className="flex flex-col">
               <span className="font-bold">Current (v{currentQuote.version || 'Draft'})</span>
               <span>{new Date(currentQuote.updatedAt || new Date()).toLocaleDateString()}</span>
             </div>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-6">
              
              {/* Header Fields Comparison */}
              <div>
                <h3 className="text-sm font-bold mb-3">Overview</h3>
                <div className="border rounded-lg p-2 space-y-1">
                   <div className="grid grid-cols-2 gap-4 px-2 py-1 text-xs font-bold text-slate-500 uppercase">
                      <div>Version {version?.version}</div>
                      <div className="pl-4">Current</div>
                   </div>
                   <Separator className="my-2" />
                   <FieldComparison label="Status" oldVal={version?.status} newVal={currentQuote.status} />
                   <FieldComparison label="Subtotal" oldVal={version?.subtotal} newVal={currentQuote.subtotal} type="currency" />
                   <FieldComparison label="Discount" oldVal={version?.discount} newVal={currentQuote.discount} type="currency" />
                   <FieldComparison label="Shipping" oldVal={version?.shippingCharges} newVal={currentQuote.shippingCharges} type="currency" />
                   <FieldComparison label="Total Amount" oldVal={version?.total} newVal={currentQuote.total} type="currency" />
                   <Separator className="my-2" />
                   <FieldComparison label="Validity (Days)" oldVal={version?.validityDays} newVal={currentQuote.validityDays} />
                   <FieldComparison label="Reference" oldVal={version?.referenceNumber} newVal={currentQuote.referenceNumber} />
                </div>
              </div>

              {/* Items Comparison */}
              <div>
                <h3 className="text-sm font-bold mb-3">Line Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Old Items */}
                  <div className="space-y-2">
                     <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Version {version?.version}</h4>
                     {oldItems.map((item: QuoteItem, i: number) => (
                       <div key={i} className="p-2 border rounded bg-slate-50 dark:bg-slate-900/50 text-xs">
                         <div className="font-semibold">{item.description}</div>
                         <div className="flex justify-between mt-1 text-slate-500">
                           <span>{item.quantity} x ₹{Number(item.unitPrice).toLocaleString()}</span>
                           <span className="font-mono">₹{Number(item.subtotal).toLocaleString()}</span>
                         </div>
                       </div>
                     ))}
                  </div>

                  {/* New Items */}
                  <div className="space-y-2">
                     <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Current</h4>
                     {newItems.map((item: QuoteItem, i: number) => (
                       <div key={i} className="p-2 border rounded bg-white dark:bg-slate-900 text-xs">
                         <div className="font-semibold">{item.description}</div>
                         <div className="flex justify-between mt-1 text-slate-500">
                           <span>{item.quantity} x ₹{Number(item.unitPrice).toLocaleString()}</span>
                           <span className="font-mono">₹{Number(item.subtotal).toLocaleString()}</span>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              {/* Notes & Terms Comparison */}
              <div>
                <h3 className="text-sm font-bold mb-3">Notes & Terms</h3>
                <div className="border rounded-lg p-2 space-y-1">
                   <FieldComparison label="Notes" oldVal={version?.notes} newVal={currentQuote.notes} />
                   <Separator className="my-2" />
                   <FieldComparison label="Terms & Conditions" oldVal={version?.termsAndConditions} newVal={currentQuote.termsAndConditions} />
                </div>
              </div>

              {/* Revision Notes */}
              {version?.revisionNotes && (
                 <div>
                    <h3 className="text-sm font-bold mb-2">Revision Notes</h3>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-300 italic">
                      "{version.revisionNotes}"
                    </div>
                 </div>
              )}

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

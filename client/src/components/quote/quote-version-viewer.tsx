import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, FileText, Hash, Receipt, User, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  createdByName?: string;
  attentionTo?: string;
  cgst?: string;
  sgst?: string;
  igst?: string;
}

interface QuoteVersionViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  versionNumber: number | null;
}

export function QuoteVersionViewer({ 
  isOpen, 
  onOpenChange, 
  quoteId, 
  versionNumber 
}: QuoteVersionViewerProps) {
  
  const { data: version, isLoading } = useQuery<QuoteVersion>({
    queryKey: [`/api/quotes/${quoteId}/versions/${versionNumber}`],
    enabled: !!versionNumber && isOpen,
  });

  if (!versionNumber) return null;

  const items: QuoteItem[] = version?.itemsSnapshot ? JSON.parse(version.itemsSnapshot) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 bg-slate-50 dark:bg-slate-950/50">
        <DialogHeader className="p-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
                <DialogTitle className="text-xl">Quote Version {version?.version}</DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Created on {version?.createdAt ? new Date(version.createdAt).toLocaleDateString() : '-'}
                </DialogDescription>
            </div>
            {version?.status && (
                <div className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold uppercase tracking-wider">
                    {version.status}
                </div>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : !version ? (
             <div className="p-8 text-center text-slate-500">Version not found</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Client / Ref Info */}
                <Card className="border-slate-200 dark:border-slate-800 md:col-span-2">
                    <CardHeader className="py-3 px-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2">
                            <User className="h-3 w-3" /> Estimate Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 grid grid-cols-2 gap-4">
                        {version.referenceNumber && (
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Reference</p>
                                <p className="text-sm font-medium">{version.referenceNumber}</p>
                            </div>
                        )}
                        {version.attentionTo && (
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Attention To</p>
                                <p className="text-sm font-medium">{version.attentionTo}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Validity</p>
                            <p className="text-sm font-medium">{version.validityDays} Days</p>
                        </div>
                    </CardContent>
                </Card>

                 {/* Financial Summary */}
                 <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="py-3 px-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2">
                            <Receipt className="h-3 w-3" /> Financials
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium">₹{Number(version.subtotal).toLocaleString()}</span>
                        </div>
                        {Number(version.discount) > 0 && (
                            <div className="flex justify-between text-xs text-rose-600">
                                <span>Discount</span>
                                <span>-₹{Number(version.discount).toLocaleString()}</span>
                            </div>
                        )}
                         {Number(version.shippingCharges) > 0 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Shipping</span>
                                <span>₹{Number(version.shippingCharges).toLocaleString()}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-sm font-bold">
                            <span>Total</span>
                            <span>₹{Number(version.total).toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Line Items */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="py-3 px-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2">
                        <Package className="h-3 w-3" /> Line Items
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold w-[50%]">Item Description</th>
                                    <th className="px-4 py-3 text-right font-semibold">Qty</th>
                                    <th className="px-4 py-3 text-right font-semibold">Unit Price</th>
                                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                        <td className="px-4 py-3 align-top">
                                            <p className="font-medium text-slate-900 dark:text-slate-100 whitespace-pre-line">{item.description}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right align-top">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right align-top">₹{Number(item.unitPrice).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right align-top font-semibold">₹{Number(item.subtotal).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Notes & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {version.notes && (
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="py-3 px-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                             <CardTitle className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2">
                                <FileText className="h-3 w-3" /> Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line">{version.notes}</p>
                        </CardContent>
                    </Card>
                )}
                 {version.termsAndConditions && (
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="py-3 px-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                             <CardTitle className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2">
                                <FileText className="h-3 w-3" /> Terms & Conditions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                             <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line">{version.termsAndConditions}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

             {/* Revision Notes */}
             {version.revisionNotes && (
                 <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase mb-1">Revision Notes</p>
                    <p className="text-sm text-amber-900 dark:text-amber-400 italic">"{version.revisionNotes}"</p>
                 </div>
             )}

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

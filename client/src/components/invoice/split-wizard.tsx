import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Plus, Minus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  fulfilledQuantity?: number;
  productId?: string;
}

interface InvoiceSplitWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  masterInvoiceId?: string;
  items: InvoiceItem[];
  onSuccess?: () => void;
  masterInvoice?: {
    discount: string;
    cgst: string;
    sgst: string;
    igst: string;
    shippingCharges: string;
  };
}

interface SplitItem {
  itemId: string;
  description: string;
  totalQuantity: number;
  remainingQuantity: number;
  selectedQuantity: number;
  unitPrice: string;
  subtotal: string;
  productId?: string;
}

export function InvoiceSplitWizard({
  open,
  onOpenChange,
  quoteId,
  masterInvoiceId,
  items,
  onSuccess,
  masterInvoice,
}: InvoiceSplitWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [splitItems, setSplitItems] = useState<SplitItem[]>(
    items.map((item) => ({
      itemId: item.id,
      description: item.description,
      totalQuantity: item.quantity,
      remainingQuantity: item.quantity - (item.fulfilledQuantity || 0),
      selectedQuantity: 0,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      productId: item.productId,
    }))
  );
  const [invoiceData, setInvoiceData] = useState({
    milestoneDescription: "",
    deliveryNotes: "",
    notes: "",
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      // If masterInvoiceId exists, create child invoice with proper validation
      if (masterInvoiceId) {
        console.log("Creating child invoice with items:", data.items);
        return await apiRequest("POST", `/api/invoices/${masterInvoiceId}/create-child-invoice`, {
          items: data.items.map((item: any) => ({
            itemId: item.itemId,
            description: item.description,
            productId: item.productId,
            quantity: item.quantity, // ✅ Use item.quantity (already mapped from selectedQuantity)
            serialNumbers: item.serialNumbers || [],
          })),
          milestoneDescription: data.milestoneDescription,
          deliveryNotes: data.deliveryNotes,
          notes: data.notes,
        });
      }

      // Otherwise, create new master invoice from quote
      return await apiRequest("POST", `/api/quotes/${quoteId}/create-invoice`, {
        ...data,
        isMaster: true,
      });
    },
    onSuccess: () => {
      // Force refetch to ensure data updates immediately (since staleTime is Infinity)
      queryClient.refetchQueries({ queryKey: ["/api/invoices", masterInvoiceId] });
      queryClient.refetchQueries({ queryKey: ["/api/invoices"] });
      queryClient.refetchQueries({ queryKey: ["/api/quotes", quoteId] });
      toast({
        title: "Success",
        description: masterInvoiceId ? "Child invoice created successfully" : "Invoice created successfully",
      });
      onSuccess?.();
      onOpenChange(false);
      resetWizard();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const resetWizard = () => {
    setStep(1);
    setSplitItems(
      items.map((item) => ({
        itemId: item.id,
        description: item.description,
        totalQuantity: item.quantity,
        remainingQuantity: item.quantity - (item.fulfilledQuantity || 0),
        selectedQuantity: 0,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        productId: item.productId,
      }))
    );
    setInvoiceData({
      milestoneDescription: "",
      deliveryNotes: "",
      notes: "",
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setSplitItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId
          ? { ...item, selectedQuantity: Math.max(0, Math.min(quantity, item.remainingQuantity)) }
          : item
      )
    );
  };

  const calculateTotals = () => {
    const selectedItems = splitItems.filter((item) => item.selectedQuantity > 0);
    const subtotal = selectedItems.reduce((sum, item) => {
      return sum + item.selectedQuantity * parseFloat(item.unitPrice);
    }, 0);

    // Calculate the master invoice's total subtotal to determine discount and tax rates
    const masterSubtotal = items.reduce((sum, item) => {
      return sum + item.quantity * parseFloat(item.unitPrice);
    }, 0);

    // Calculate proportional discount based on subtotal ratio
    let discount = 0;
    if (masterInvoice?.discount && masterSubtotal > 0) {
      const masterDiscount = parseFloat(masterInvoice.discount);
      if (masterDiscount > 0) {
        // Proportional discount: (child subtotal / master subtotal) * master discount
        discount = (subtotal / masterSubtotal) * masterDiscount;
      }
    }

    const afterDiscount = subtotal - discount;

    // Calculate taxes based on master invoice rates
    // First, we need to derive the tax RATES from master invoice amounts
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (masterInvoice && masterSubtotal > 0) {
      const masterDiscount = parseFloat(masterInvoice.discount || '0');
      const masterAfterDiscount = masterSubtotal - masterDiscount;

      if (masterAfterDiscount > 0) {
        // Calculate tax rates from master invoice
        const masterCgstAmount = parseFloat(masterInvoice.cgst || '0');
        const masterSgstAmount = parseFloat(masterInvoice.sgst || '0');
        const masterIgstAmount = parseFloat(masterInvoice.igst || '0');

        // Derive rates: rate = (amount / taxable_amount) * 100
        const cgstRate = (masterCgstAmount / masterAfterDiscount) * 100;
        const sgstRate = (masterSgstAmount / masterAfterDiscount) * 100;
        const igstRate = (masterIgstAmount / masterAfterDiscount) * 100;

        // Apply rates to child invoice
        cgst = (afterDiscount * cgstRate) / 100;
        sgst = (afterDiscount * sgstRate) / 100;
        igst = (afterDiscount * igstRate) / 100;
      }
    }

    // Shipping charges (proportional to selected quantity vs total quantity)
    let shippingCharges = 0;
    if (masterInvoice?.shippingCharges) {
      const masterShipping = parseFloat(masterInvoice.shippingCharges);
      const totalMasterQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const selectedQuantity = selectedItems.reduce((sum, item) => sum + item.selectedQuantity, 0);
      if (totalMasterQuantity > 0) {
        shippingCharges = (masterShipping * selectedQuantity) / totalMasterQuantity;
      }
    }

    const total = afterDiscount + cgst + sgst + igst + shippingCharges;

    return {
      items: selectedItems,
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      shippingCharges: shippingCharges.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const handleSubmit = () => {
    const totals = calculateTotals();

    if (totals.items.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item with quantity greater than 0",
        variant: "destructive",
      });
      return;
    }

    // For child invoice creation, send itemId and quantity
    // For new master invoice, send full item details
    const invoiceItems = masterInvoiceId
      ? totals.items.map((item) => ({
          itemId: item.itemId,
          description: item.description,
          productId: item.productId,
          unitPrice: item.unitPrice,
          quantity: item.selectedQuantity,
          serialNumbers: [], // Can be added later
        }))
      : totals.items.map((item, index) => ({
          description: item.description,
          quantity: item.selectedQuantity,
          unitPrice: item.unitPrice,
          subtotal: (item.selectedQuantity * parseFloat(item.unitPrice)).toFixed(2),
          sortOrder: index,
        }));

    createInvoiceMutation.mutate({
      ...invoiceData,
      items: invoiceItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      shippingCharges: totals.shippingCharges,
      total: totals.total,
      isMaster: false,
    });
  };

  const totals = calculateTotals();
  const hasSelection = totals.items.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create Child Invoice</span>
            <Badge variant="outline">Step {step} of 2</Badge>
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Select items for this invoice
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Choose the quantities you want to include in this child invoice. The system will prevent
                    over-invoicing.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Available Items</h3>
              {splitItems.map((item) => (
                <div key={item.itemId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Total: {item.totalQuantity}</span>
                        <span>•</span>
                        <span>Remaining: {item.remainingQuantity}</span>
                        <span>•</span>
                        <span>Unit Price: ₹{parseFloat(item.unitPrice).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Label className="w-32">Select Quantity:</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => updateItemQuantity(item.itemId, item.selectedQuantity - 1)}
                        disabled={item.selectedQuantity === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min={0}
                        max={item.remainingQuantity}
                        value={item.selectedQuantity}
                        onChange={(e) => updateItemQuantity(item.itemId, parseInt(e.target.value) || 0)}
                        className="w-24 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => updateItemQuantity(item.itemId, item.selectedQuantity + 1)}
                        disabled={item.selectedQuantity >= item.remainingQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateItemQuantity(item.itemId, item.remainingQuantity)}
                      >
                        Select All
                      </Button>
                    </div>
                  </div>

                  {item.selectedQuantity > 0 && (
                    <div className="bg-muted/50 rounded p-3">
                      <p className="text-sm font-medium">
                        Subtotal: ₹{(item.selectedQuantity * parseFloat(item.unitPrice)).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasSelection && (
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-3">Selected Items Summary</h3>
                <div className="space-y-2">
                  {totals.items.map((item) => (
                    <div key={item.itemId} className="flex justify-between text-sm">
                      <span>{item.description}</span>
                      <span>
                        {item.selectedQuantity} × ₹{parseFloat(item.unitPrice).toLocaleString()} = ₹
                        {(item.selectedQuantity * parseFloat(item.unitPrice)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <Separator className="my-2" />

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{parseFloat(totals.subtotal).toLocaleString()}</span>
                  </div>

                  {/* Discount */}
                  {parseFloat(totals.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>- ₹{parseFloat(totals.discount).toLocaleString()}</span>
                    </div>
                  )}

                  {/* CGST */}
                  {parseFloat(totals.cgst) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>CGST ({masterInvoice?.cgst}%)</span>
                      <span>₹{parseFloat(totals.cgst).toLocaleString()}</span>
                    </div>
                  )}

                  {/* SGST */}
                  {parseFloat(totals.sgst) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>SGST ({masterInvoice?.sgst}%)</span>
                      <span>₹{parseFloat(totals.sgst).toLocaleString()}</span>
                    </div>
                  )}

                  {/* IGST */}
                  {parseFloat(totals.igst) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>IGST ({masterInvoice?.igst}%)</span>
                      <span>₹{parseFloat(totals.igst).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  {parseFloat(totals.shippingCharges) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Shipping Charges</span>
                      <span>₹{parseFloat(totals.shippingCharges).toLocaleString()}</span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  {/* Total */}
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{parseFloat(totals.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="milestoneDescription">Milestone Description</Label>
                <Input
                  id="milestoneDescription"
                  placeholder="e.g., Phase 1 Delivery, Initial Setup"
                  value={invoiceData.milestoneDescription}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, milestoneDescription: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                <Textarea
                  id="deliveryNotes"
                  placeholder="Delivery instructions, tracking info, etc."
                  value={invoiceData.deliveryNotes}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, deliveryNotes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Invoice Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes for this invoice"
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-semibold mb-3">Invoice Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>{totals.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Quantity</span>
                  <span>{totals.items.reduce((sum, item) => sum + item.selectedQuantity, 0)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span>₹{parseFloat(totals.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep(2)} disabled={!hasSelection}>
                Next: Add Details
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={createInvoiceMutation.isPending}>
                {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


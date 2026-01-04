import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  sortOrder: number;
  hsnSac?: string;
}

interface EditInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  currentData: {
    items: InvoiceItem[];
    subtotal: string;
    discount: string;
    cgst: string;
    sgst: string;
    igst: string;
    shippingCharges: string;
    total: string;
    notes?: string;
    termsAndConditions?: string;
    deliveryNotes?: string;
    milestoneDescription?: string;
  };
  isDraft: boolean;
}

export function EditInvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
  currentData,
  isDraft,
}: EditInvoiceDialogProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [subtotal, setSubtotal] = useState("");
  const [discount, setDiscount] = useState("");
  const [cgst, setCgst] = useState("");
  const [sgst, setSgst] = useState("");
  const [igst, setIgst] = useState("");
  const [shippingCharges, setShippingCharges] = useState("");
  const [total, setTotal] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      setItems(currentData.items || []);
      setSubtotal(currentData.subtotal || "0");
      setDiscount(currentData.discount || "0");
      setCgst(currentData.cgst || "0");
      setSgst(currentData.sgst || "0");
      setIgst(currentData.igst || "0");
      setShippingCharges(currentData.shippingCharges || "0");
      setTotal(currentData.total || "0");
      setNotes(currentData.notes || "");
      setTermsAndConditions(currentData.termsAndConditions || "");
      setDeliveryNotes(currentData.deliveryNotes || "");
      setMilestoneDescription(currentData.milestoneDescription || "");
    }
  }, [open, currentData]);

  const updateInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/invoices/${invoiceId}/master-details`, data);
    },
    onSuccess: () => {
      // Force refetch to ensure data updates immediately (since staleTime is Infinity)
      queryClient.refetchQueries({ queryKey: [`/api/invoices/${invoiceId}`] });
      queryClient.refetchQueries({ queryKey: [`/api/invoices/${invoiceId}/master-summary`] });
      queryClient.refetchQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice Updated",
        description: "Invoice has been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update invoice.",
      });
    },
  });

  const calculateSubtotal = () => {
    const sum = items.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);
    setSubtotal(sum.toFixed(2));
    recalculateTotal(sum.toFixed(2), discount, cgst, sgst, igst, shippingCharges);
  };

  const recalculateTotal = (
    sub: string,
    disc: string,
    c: string,
    s: string,
    i: string,
    ship: string
  ) => {
    const newTotal =
      Number(sub) - Number(disc) + Number(c) + Number(s) + Number(i) + Number(ship);
    setTotal(newTotal.toFixed(2));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate subtotal if quantity or unitPrice changes
    if (field === "quantity" || field === "unitPrice") {
      const qty = Number(newItems[index].quantity || 0);
      const price = Number(newItems[index].unitPrice || 0);
      newItems[index].subtotal = (qty * price).toFixed(2);
    }

    setItems(newItems);

    // Recalculate totals
    const sum = newItems.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);
    setSubtotal(sum.toFixed(2));
    recalculateTotal(sum.toFixed(2), discount, cgst, sgst, igst, shippingCharges);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unitPrice: "0.00",
        subtotal: "0.00",
        sortOrder: items.length,
        hsnSac: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateSubtotal();
  };

  const handleSubmit = () => {
    const updateData: any = {
      notes,
      termsAndConditions,
      deliveryNotes,
      milestoneDescription,
    };

    if (isDraft) {
      // In draft, can update everything
      updateData.items = items.map((item, index) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        sortOrder: index,
        hsnSac: item.hsnSac || null,
      }));
      updateData.subtotal = subtotal;
      updateData.discount = discount;
      updateData.cgst = cgst;
      updateData.sgst = sgst;
      updateData.igst = igst;
      updateData.shippingCharges = shippingCharges;
      updateData.total = total;
    }

    updateInvoiceMutation.mutate(updateData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            {isDraft
              ? "You can edit all fields including items and amounts in draft status."
              : "Only notes, terms, and delivery information can be edited in confirmed status."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Items Section - Only in Draft */}
          {isDraft && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Items</Label>
                <Button size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Description</TableHead>
                      <TableHead className="w-[12%]">HSN/SAC</TableHead>
                      <TableHead className="w-[13%]">Quantity</TableHead>
                      <TableHead className="w-[20%]">Unit Price</TableHead>
                      <TableHead className="w-[10%]">Subtotal</TableHead>
                      <TableHead className="w-[5%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(index, "description", e.target.value)
                            }
                            placeholder="Item description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.hsnSac || ""}
                            onChange={(e) =>
                              handleItemChange(index, "hsnSac", e.target.value)
                            }
                            placeholder="HSN/SAC"
                            maxLength={10}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, "quantity", parseInt(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(index, "unitPrice", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input value={item.subtotal} readOnly className="bg-gray-50" />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Amounts Section - Only in Draft */}
          {isDraft && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subtotal</Label>
                <Input type="number" step="0.01" value={subtotal} readOnly className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label>Discount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => {
                    setDiscount(e.target.value);
                    recalculateTotal(subtotal, e.target.value, cgst, sgst, igst, shippingCharges);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>CGST</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={cgst}
                  onChange={(e) => {
                    setCgst(e.target.value);
                    recalculateTotal(subtotal, discount, e.target.value, sgst, igst, shippingCharges);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>SGST</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={sgst}
                  onChange={(e) => {
                    setSgst(e.target.value);
                    recalculateTotal(subtotal, discount, cgst, e.target.value, igst, shippingCharges);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>IGST</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={igst}
                  onChange={(e) => {
                    setIgst(e.target.value);
                    recalculateTotal(subtotal, discount, cgst, sgst, e.target.value, shippingCharges);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Shipping Charges</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={shippingCharges}
                  onChange={(e) => {
                    setShippingCharges(e.target.value);
                    recalculateTotal(subtotal, discount, cgst, sgst, igst, e.target.value);
                  }}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-lg font-semibold">Total</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={total}
                  readOnly
                  className="bg-gray-50 text-lg font-bold"
                />
              </div>
            </div>
          )}

          {/* Notes Section - Always Editable */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms or additional notes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Terms and Conditions</Label>
              <Textarea
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                placeholder="Terms and conditions..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Delivery Notes</Label>
              <Textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Delivery instructions..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Milestone Description</Label>
              <Input
                value={milestoneDescription}
                onChange={(e) => setMilestoneDescription(e.target.value)}
                placeholder="e.g., Phase 1 - Planning"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateInvoiceMutation.isPending}
          >
            {updateInvoiceMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


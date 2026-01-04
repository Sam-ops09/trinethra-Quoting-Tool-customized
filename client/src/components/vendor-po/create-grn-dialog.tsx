import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Package, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreateGRNDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorPoId: string;
  vendorPoNumber: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    receivedQuantity: number;
  }>;
}

export function CreateGRNDialog({
  open,
  onOpenChange,
  vendorPoId,
  vendorPoNumber,
  items,
}: CreateGRNDialogProps) {
  const safeItems = items ?? [];
  const { toast } = useToast();
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [formData, setFormData] = useState({
    quantityReceived: 0,
    quantityRejected: 0,
    deliveryNoteNumber: "",
    batchNumber: "",
    inspectionNotes: "",
  });

  const selectedItem = safeItems.find((item) => item.id === selectedItemId);

  const createGRNMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/grns", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-pos", vendorPoId] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-pos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grns"] });
      toast({
        title: "GRN Created",
        description: "Goods Received Note has been created successfully.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create GRN",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedItemId("");
    setFormData({
      quantityReceived: 0,
      quantityRejected: 0,
      deliveryNoteNumber: "",
      batchNumber: "",
      inspectionNotes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItemId) {
      toast({
        title: "Error",
        description: "Please select an item",
        variant: "destructive",
      });
      return;
    }

    if (!selectedItem) return;

    const totalProcessed = formData.quantityReceived + formData.quantityRejected;
    const remainingQty = selectedItem.quantity - selectedItem.receivedQuantity;

    if (totalProcessed > remainingQty) {
      toast({
        title: "Error",
        description: `Cannot process more than ${remainingQty} items (remaining quantity)`,
        variant: "destructive",
      });
      return;
    }

    if (formData.quantityReceived === 0 && formData.quantityRejected === 0) {
      toast({
        title: "Error",
        description: "Please enter received or rejected quantity",
        variant: "destructive",
      });
      return;
    }

    createGRNMutation.mutate({
      vendorPoId,
      vendorPoItemId: selectedItemId,
      quantityOrdered: selectedItem.quantity,
      quantityReceived: formData.quantityReceived,
      quantityRejected: formData.quantityRejected,
      deliveryNoteNumber: formData.deliveryNoteNumber,
      batchNumber: formData.batchNumber,
      inspectionNotes: formData.inspectionNotes,
      inspectionStatus: formData.quantityRejected > 0 ? "partial" : "approved",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-3 xs:p-4 sm:p-5 md:p-6">
        <DialogHeader className="space-y-1 xs:space-y-1.5">
          <DialogTitle className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-base xs:text-lg sm:text-xl md:text-2xl">
            <Package className="h-4 w-4 xs:h-5 xs:w-5" />
            Create GRN
          </DialogTitle>
          <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">
            Record delivery for PO: {vendorPoNumber}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-4 mt-2 xs:mt-3 sm:mt-4">
          {/* Item Selection */}
          <div className="space-y-1 xs:space-y-1.5">
            <Label htmlFor="item-select" className="text-[10px] xs:text-xs sm:text-sm">Select Item *</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger id="item-select">
                <SelectValue placeholder="Choose an item to receive" />
              </SelectTrigger>
              <SelectContent>
                {safeItems.length > 0 && safeItems.map((item) => {
                  const remaining = item.quantity - item.receivedQuantity;
                  return (
                    <SelectItem key={item.id} value={item.id} disabled={remaining === 0}>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{item.description}</span>
                        <span className="ml-4 text-xs text-muted-foreground">
                          {remaining} / {item.quantity} remaining
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedItem && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      {selectedItem.description}
                    </p>
                    <div className="text-blue-700 dark:text-blue-300 space-y-0.5">
                      <p>Ordered: {selectedItem.quantity}</p>
                      <p>Already Received: {selectedItem.receivedQuantity}</p>
                      <p className="font-semibold">
                        Remaining: {selectedItem.quantity - selectedItem.receivedQuantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty-received">Quantity Received *</Label>
              <Input
                id="qty-received"
                type="number"
                min="0"
                max={selectedItem ? selectedItem.quantity - selectedItem.receivedQuantity : 0}
                value={formData.quantityReceived}
                onChange={(e) =>
                  setFormData({ ...formData, quantityReceived: Number(e.target.value) || 0 })
                }
                disabled={!selectedItem}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty-rejected">Quantity Rejected</Label>
              <Input
                id="qty-rejected"
                type="number"
                min="0"
                max={selectedItem ? selectedItem.quantity - selectedItem.receivedQuantity : 0}
                value={formData.quantityRejected}
                onChange={(e) =>
                  setFormData({ ...formData, quantityRejected: Number(e.target.value) || 0 })
                }
                disabled={!selectedItem}
              />
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-note">Delivery Note Number</Label>
              <Input
                id="delivery-note"
                placeholder="DN-123456"
                value={formData.deliveryNoteNumber}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryNoteNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-number">Batch Number</Label>
              <Input
                id="batch-number"
                placeholder="BATCH-001"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Inspection Notes */}
          <div className="space-y-2">
            <Label htmlFor="inspection-notes">Inspection Notes</Label>
            <Textarea
              id="inspection-notes"
              placeholder="Add any inspection notes, quality issues, or remarks..."
              rows={4}
              value={formData.inspectionNotes}
              onChange={(e) => setFormData({ ...formData, inspectionNotes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGRNMutation.isPending || !selectedItemId}
            >
              {createGRNMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create GRN"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateGRNDialog;

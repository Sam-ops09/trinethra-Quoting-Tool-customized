import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Vendor {
  id: string;
  name: string;
  email: string;
}

interface CreateVendorPoDialogProps {
  quoteId: string;
  quoteNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateVendorPoDialog({ quoteId, quoteNumber, open, onOpenChange }: CreateVendorPoDialogProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    vendorId: "",
    expectedDeliveryDate: "",
    notes: "",
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
    enabled: open,
  });

  const createPoMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", `/api/quotes/${quoteId}/create-vendor-po`, data);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-pos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes", quoteId] });
      toast({
        title: "Vendor PO created",
        description: "Purchase order has been created successfully.",
      });
      onOpenChange(false);
      setFormData({ vendorId: "", expectedDeliveryDate: "", notes: "" });
      if (response?.id) {
        setLocation(`/vendor-pos/${response.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create vendor purchase order.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.vendorId) {
      toast({
        title: "Validation Error",
        description: "Please select a vendor.",
        variant: "destructive",
      });
      return;
    }
    createPoMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-3 xs:p-4 sm:p-5 md:p-6">
        <DialogHeader className="space-y-1 xs:space-y-1.5">
          <DialogTitle className="text-base xs:text-lg sm:text-xl md:text-2xl">Create Vendor PO</DialogTitle>
          <DialogDescription className="text-[10px] xs:text-xs sm:text-sm">
            Create PO for quote {quoteNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-4 py-2 xs:py-3 sm:py-4">
          <div className="space-y-1 xs:space-y-1.5">
            <label className="text-[10px] xs:text-xs sm:text-sm font-medium">
              Vendor <span className="text-destructive">*</span>
            </label>
            {vendorsLoading ? (
              <div className="flex items-center justify-center p-3 xs:p-4">
                <Loader2 className="h-4 w-4 xs:h-5 xs:w-5 animate-spin" />
              </div>
            ) : (
              <Select value={formData.vendorId} onValueChange={(value) => setFormData({ ...formData, vendorId: value })}>
                <SelectTrigger className="h-8 xs:h-9 text-[10px] xs:text-xs sm:text-sm">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors?.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id} className="text-xs">
                      {vendor.name}
                    </SelectItem>
                  ))}
                  {vendors?.length === 0 && (
                    <div className="p-2 text-center text-[10px] xs:text-xs text-muted-foreground">
                      No vendors found.{" "}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-[10px] xs:text-xs"
                        onClick={() => setLocation("/vendors")}
                      >
                        Add one
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1 xs:space-y-1.5">
            <label className="text-[10px] xs:text-xs sm:text-sm font-medium">Expected Delivery</label>
            <Input
              type="date"
              value={formData.expectedDeliveryDate}
              onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
              className="h-8 xs:h-9 text-[10px] xs:text-xs sm:text-sm"
            />
          </div>
          <div className="space-y-1 xs:space-y-1.5">
            <label className="text-[10px] xs:text-xs sm:text-sm font-medium">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
              className="text-[10px] xs:text-xs sm:text-sm resize-none"
            />
          </div>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-1.5 xs:gap-2 pt-2 xs:pt-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-8 xs:h-9 text-xs sm:text-sm w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createPoMutation.isPending}
            className="h-8 xs:h-9 text-xs sm:text-sm w-full sm:w-auto"
          >
            {createPoMutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1.5 animate-spin" />
            )}
            Create PO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


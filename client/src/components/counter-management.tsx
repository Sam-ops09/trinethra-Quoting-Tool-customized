import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

interface CounterData {
  quote?: number;
  vendor_po?: number;
  invoice?: number;
  grn?: number;
  sales_order?: number;
  year: number;
}

interface CounterManagementProps {}

export function CounterManagement({}: CounterManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  // Feature flags
  const quotesEnabled = useFeatureFlag('quotes_module');
  const vendorPOEnabled = useFeatureFlag('vendorPO_module');
  const invoicesEnabled = useFeatureFlag('invoices_module');
  const grnEnabled = useFeatureFlag('grn_module');
  const salesOrdersEnabled = useFeatureFlag('sales_orders_module');

  const [customValues, setCustomValues] = useState<Record<string, string>>({
    quote: "",
    vendor_po: "",
    invoice: "",
    grn: "",
    sales_order: "",
  });

  // Fetch current counter values
  const { data: counters, isLoading } = useQuery<CounterData>({
    queryKey: ["numbering-counters"],
    queryFn: async () => {
      const response = await fetch("/api/numbering/counters", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch counters");
      }
      return response.json();
    },
  });

  // Reset counter mutation
  const resetCounterMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await fetch("/api/numbering/reset-counter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type, year: currentYear }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reset counter");
      }
      return response.json();
    },
    onSuccess: (data, type) => {
      queryClient.invalidateQueries({ queryKey: ["numbering-counters"] });
      toast({
        title: "Counter Reset",
        description: data.message || `Counter for ${type} has been reset to 0`,
      });
    },
    onError: (error: any, type) => {
      toast({
        title: "Error",
        description: error?.message || `Failed to reset counter for ${type}`,
        variant: "destructive",
      });
    },
  });

  // Set custom counter value mutation
  const setCounterMutation = useMutation({
    mutationFn: async ({ type, value }: { type: string; value: number }) => {
      const response = await fetch("/api/numbering/set-counter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type, year: currentYear, value }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to set counter");
      }
      return response.json();
    },
    onSuccess: (data, { type }) => {
      queryClient.invalidateQueries({ queryKey: ["numbering-counters"] });
      setCustomValues((prev) => ({ ...prev, [type]: "" }));
      toast({
        title: "Counter Updated",
        description: data.message || `Counter for ${type} has been updated`,
      });
    },
    onError: (error: any, { type }) => {
      toast({
        title: "Error",
        description: error?.message || `Failed to set counter for ${type}`,
        variant: "destructive",
      });
    },
  });

  const handleSetCounter = (type: string) => {
    const value = parseInt(customValues[type], 10);
    if (isNaN(value) || value < 0) {
      toast({
        title: "Invalid Value",
        description: "Please enter a valid non-negative number",
        variant: "destructive",
      });
      return;
    }
    setCounterMutation.mutate({ type, value });
  };

  const getDocumentLabel = (type: string): string => {
    const labels: Record<string, string> = {
      quote: "Quotes",
      vendor_po: "Vendor POs",
      invoice: "Invoices",
      grn: "GRNs",
      sales_order: "Sales Orders",
    };
    return labels[type] || type;
  };

  const getDocumentColor = (type: string): string => {
    const colors: Record<string, string> = {
      quote: "blue",
      vendor_po: "green",
      invoice: "purple",
      grn: "indigo",
      sales_order: "orange",
    };
    return colors[type] || "gray";
  };

  // Build available types based on feature flags
  const availableTypes: Array<keyof CounterData> = [];
  if (quotesEnabled && counters?.quote !== undefined) availableTypes.push("quote");
  if (vendorPOEnabled && counters?.vendor_po !== undefined) availableTypes.push("vendor_po");
  if (invoicesEnabled && counters?.invoice !== undefined) availableTypes.push("invoice");
  if (grnEnabled && counters?.grn !== undefined) availableTypes.push("grn");
  if (salesOrdersEnabled && counters?.sales_order !== undefined) availableTypes.push("sales_order");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (availableTypes.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No document types are currently enabled. Enable features in the feature flags to manage their counters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed p-4 sm:p-5 bg-gradient-to-br from-orange-500/5 to-red-500/5">
        <div className="mb-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Current Year: <span className="font-semibold">{counters?.year || currentYear}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            The next document number will be one more than the current counter value
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {availableTypes.map((type) => {
            const color = getDocumentColor(type);
            const currentValue = counters?.[type] ?? 0;

            return (
              <div
                key={type}
                className="bg-background p-4 rounded-lg border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-lg bg-${color}-500/10 flex items-center justify-center shrink-0`}
                    >
                      <span className={`text-xs font-bold text-${color}-600`}>
                        {type === "vendor_po" ? "PO" : type === "sales_order" ? "SO" : type.toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{getDocumentLabel(type)}</p>
                      <p className="text-xs text-muted-foreground">
                        Current: <span className="font-semibold">{currentValue}</span>
                        {" "}(Next will be: {currentValue + 1})
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resetCounterMutation.mutate(type)}
                    disabled={resetCounterMutation.isPending}
                    className="h-8"
                  >
                    {resetCounterMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Reset</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`custom-${type}`} className="text-xs">
                      Set Custom Value
                    </Label>
                    <Input
                      id={`custom-${type}`}
                      type="number"
                      min="0"
                      placeholder={`e.g., ${currentValue + 100}`}
                      value={customValues[type]}
                      onChange={(e) =>
                        setCustomValues((prev) => ({
                          ...prev,
                          [type]: e.target.value,
                        }))
                      }
                      className="h-9 text-xs mt-1"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSetCounter(type)}
                    disabled={
                      setCounterMutation.isPending || !customValues[type]
                    }
                    className="h-9 mt-[22px]"
                  >
                    {setCounterMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Set</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

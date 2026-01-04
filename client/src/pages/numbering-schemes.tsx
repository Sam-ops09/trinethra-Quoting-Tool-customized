import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface NumberingScheme {
  type: "quote" | "masterInvoice" | "childInvoice" | "vendorPo" | "grn";
  label: string;
  prefix: string;
  format: string;
  example: string;
}

// Utility functions
const getLabelForType = (type: string): string => {
  const labels: Record<string, string> = {
    quote: "Quote",
    masterInvoice: "Master Invoice",
    childInvoice: "Child Invoice",
    vendorPo: "Vendor Purchase Order (PO)",
    grn: "Goods Received Note (GRN)",
  };
  return labels[type] || type;
};

const getDefaultPrefix = (type: string): string => {
  const defaults: Record<string, string> = {
    quote: "QT",
    masterInvoice: "MINV",
    childInvoice: "INV",
    vendorPo: "PO",
    grn: "GRN",
  };
  return defaults[type] || type.toUpperCase();
};

const getDefaultFormat = (): string => {
  return "{PREFIX}-{YEAR}-{COUNTER:04d}";
};

const generateExample = (prefix: string, format: string): string => {
  const year = new Date().getFullYear();
  const result = format
    .replace(/{PREFIX}/g, prefix)
    .replace(/{YEAR}/g, String(year))
    .replace(/{COUNTER:(\d+)d}/g, (match, padding) => {
      return "1".padStart(parseInt(padding), "0");
    })
    .replace(/{COUNTER}/g, "0001");
  return result;
};

const SCHEME_TYPES: NumberingScheme["type"][] = ["quote", "masterInvoice", "childInvoice", "vendorPo", "grn"];

export default function NumberingSchemesPage() {
  const { toast } = useToast();
  const [editingType, setEditingType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, { prefix: string; format: string }>>({});

  // Fetch settings from /api/settings
  const { isLoading, data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  // Initialize form data when settings load
  useEffect(() => {
    if (settings) {
      const initialized: Record<string, { prefix: string; format: string }> = {};
      for (const type of SCHEME_TYPES) {
        const prefixKey = `${type}Prefix`;
        const formatKey = `${type}Format`;
        const prefix = settings[prefixKey] || getDefaultPrefix(type);
        const format = settings[formatKey] || getDefaultFormat();
        initialized[type] = {
          prefix,
          format,
        };
      }
      setFormData(initialized);
    }
  }, [settings]);

  // Update numbering scheme
  const updateMutation = useMutation({
    mutationFn: async (data: { type: string; prefix: string; format: string }) => {
      const settingsToSave = [
        { key: `${data.type}Prefix`, value: data.prefix },
        { key: `${data.type}Format`, value: data.format },
      ];

      for (const setting of settingsToSave) {
        await apiRequest("POST", "/api/settings", setting);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setEditingType(null);
      toast({
        title: "Success",
        description: "Numbering scheme updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update numbering scheme.",
        variant: "destructive",
      });
    },
  });

  // Reset counter
  const resetMutation = useMutation({
    mutationFn: async (type: string) => {
      return await apiRequest("POST", `/api/debug/reset-counter/${type}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/debug/counters"] });
      toast({
        title: "Success",
        description: "Counter reset to 0. Next number will start from 001.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to reset counter.",
        variant: "destructive",
      });
    },
  });

  const handleSave = async (type: string) => {
    const data = formData[type];
    if (!data.prefix || !data.format) {
      toast({
        title: "Error",
        description: "Prefix and format are required.",
        variant: "destructive",
      });
      return;
    }

    await updateMutation.mutateAsync({
      type,
      prefix: data.prefix,
      format: data.format,
    });
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Document Numbering Schemes</h1>
        <p className="text-gray-600 mt-2">
          Configure automatic numbering formats for all document types
        </p>
      </div>

      <div className="grid gap-6">
        {SCHEME_TYPES.map((type) => {
          const data = formData[type];
          if (!data) return null;

          const example = generateExample(data.prefix, data.format);

          return (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{getLabelForType(type)} Numbering</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingType === type ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`prefix-${type}`}>Prefix</Label>
                      <Input
                        id={`prefix-${type}`}
                        value={data.prefix}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            [type]: { ...data, prefix: e.target.value },
                          });
                        }}
                        placeholder="e.g., QT, INV, PO"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`format-${type}`}>Format Template</Label>
                      <Input
                        id={`format-${type}`}
                        value={data.format}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            [type]: { ...data, format: e.target.value },
                          });
                        }}
                        placeholder="{PREFIX}-{YEAR}-{COUNTER:04d}"
                      />
                      <p className="text-sm text-gray-600">
                        Variables: {"{PREFIX}"} {"{YEAR}"} {"{COUNTER:04d}"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Example Output</Label>
                      <div className="p-3 bg-gray-100 rounded font-mono text-sm">
                        {example}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleSave(type)}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingType(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Prefix</p>
                        <p className="font-mono text-lg">{data.prefix}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Format</p>
                        <p className="font-mono text-sm">{data.format}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Example Output</p>
                      <div className="p-3 bg-blue-50 rounded font-mono text-sm border border-blue-200">
                        {example}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setEditingType(type)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => resetMutation.mutate(type)}
                        disabled={resetMutation.isPending}
                      >
                        {resetMutation.isPending ? "Resetting..." : "Reset Counter"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Format Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-mono">{"{PREFIX}"}</span> - Document prefix (QT, INV, PO, GRN)</p>
          <p><span className="font-mono">{"{YEAR}"}</span> - Current year (2025)</p>
          <p><span className="font-mono">{"{COUNTER}"}</span> - Auto-incrementing counter (1, 2, 3...)</p>
          <p><span className="font-mono">{"{COUNTER:04d}"}</span> - Counter with zero padding (0001, 0002...)</p>
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="font-semibold mb-2">Examples:</p>
            <ul className="space-y-1 font-mono text-xs">
              <li>• {"{PREFIX}-{YEAR}-{COUNTER:04d}"} → QT-2025-0001</li>
              <li>• {"{PREFIX}_{YEAR}_{COUNTER}"} → QT_2025_1</li>
              <li>• {"{PREFIX}-{COUNTER:05d}"} → QT-00001</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


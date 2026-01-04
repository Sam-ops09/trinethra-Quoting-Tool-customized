import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, AlertCircle, CheckCircle, X, Download } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SerialNumberImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceItemId?: string;
  productId?: string;
  vendorPoItemId?: string;
  grnId?: string;
  expectedCount?: number;
}

interface ParsedSerial {
  serialNumber: string;
  valid: boolean;
  error?: string;
}

export default function SerialNumberImportDialog({
  open,
  onOpenChange,
  invoiceItemId,
  productId,
  vendorPoItemId,
  grnId,
  expectedCount,
}: SerialNumberImportDialogProps) {
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [parsedSerials, setParsedSerials] = useState<ParsedSerial[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const importMutation = useMutation({
    mutationFn: async (serials: string[]) => {
      const payload = {
        serialNumbers: serials,
        invoiceItemId,
        productId,
        vendorPoItemId,
        grnId,
      };
      return await apiRequest("POST", "/api/serial-numbers/bulk", payload);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/serial-numbers"] });
      if (invoiceItemId) {
        queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      }
      if (vendorPoItemId) {
        queryClient.invalidateQueries({ queryKey: ["/api/vendor-pos"] });
      }
      toast({
        title: "Serial numbers imported",
        description: `Successfully imported ${data.count} serial numbers`,
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import serial numbers",
        variant: "destructive",
      });
    },
  });

  const parseSerialNumbers = () => {
    const lines = inputText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const parsed: ParsedSerial[] = [];
    const errors: string[] = [];
    const seen = new Set<string>();

    lines.forEach((line, index) => {
      // Try to parse CSV format: serial,product,notes
      const parts = line.split(",").map((p) => p.trim());
      const serialNumber = parts[0];

      if (!serialNumber) {
        errors.push(`Line ${index + 1}: Empty serial number`);
        parsed.push({ serialNumber: line, valid: false, error: "Empty" });
        return;
      }

      // Check for duplicates in current batch
      if (seen.has(serialNumber)) {
        errors.push(`Line ${index + 1}: Duplicate serial "${serialNumber}"`);
        parsed.push({ serialNumber, valid: false, error: "Duplicate in batch" });
        return;
      }

      seen.add(serialNumber);
      parsed.push({ serialNumber, valid: true });
    });

    setParsedSerials(parsed);
    setParseErrors(errors);

    // Check count if expected
    if (expectedCount && parsed.filter((p) => p.valid).length !== expectedCount) {
      errors.push(
        `Count mismatch: Expected ${expectedCount} serials, got ${parsed.filter((p) => p.valid).length}`
      );
      setParseErrors(errors);
    }
  };

  const handleImport = () => {
    const validSerials = parsedSerials.filter((p) => p.valid).map((p) => p.serialNumber);

    if (validSerials.length === 0) {
      toast({
        title: "No valid serial numbers",
        description: "Please enter at least one valid serial number",
        variant: "destructive",
      });
      return;
    }

    if (expectedCount && validSerials.length !== expectedCount) {
      toast({
        title: "Count mismatch",
        description: `Expected ${expectedCount} serials, got ${validSerials.length}`,
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate(validSerials);
  };

  const resetForm = () => {
    setInputText("");
    setParsedSerials([]);
    setParseErrors([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `SERIAL001
SERIAL002
SERIAL003
# Or use CSV format:
# SerialNumber,Notes
# SN-2024-001,New batch
# SN-2024-002,Quality checked`;

    const blob = new Blob([template], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "serial_numbers_template.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedSerials.filter((p) => p.valid).length;
  const invalidCount = parsedSerials.filter((p) => !p.valid).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Serial Numbers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enter serial numbers one per line, or upload a CSV/TXT file.
              {expectedCount && <> Expected count: <strong>{expectedCount}</strong> serials.</>}
            </AlertDescription>
          </Alert>

          {/* Template Download */}
          <div className="flex justify-between items-center">
            <Label>Serial Numbers</Label>
            <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-3 w-3 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="sm" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload File
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </Button>
              <span className="text-sm text-muted-foreground">or paste below</span>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <Textarea
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`SN-2024-001
SN-2024-002
SN-2024-003
...

Or CSV format:
SerialNumber,Notes
SN-2024-001,Batch A
SN-2024-002,Batch A`}
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{inputText.split("\n").filter((l) => l.trim()).length} lines entered</span>
              {expectedCount && (
                <span>
                  Expected: {expectedCount} serials
                </span>
              )}
            </div>
          </div>

          {/* Parse Button */}
          {inputText.trim() && (
            <Button type="button" variant="outline" onClick={parseSerialNumbers} className="w-full">
              <AlertCircle className="h-4 w-4 mr-2" />
              Validate Serial Numbers
            </Button>
          )}

          {/* Validation Results */}
          {parsedSerials.length > 0 && (
            <div className="space-y-4">
              <Separator />

              {/* Summary */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold">{validCount} Valid</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold">{invalidCount} Invalid</span>
                  </div>
                )}
                {expectedCount && (
                  <Badge variant={validCount === expectedCount ? "default" : "destructive"}>
                    {validCount === expectedCount ? "Count Matches" : `Expected ${expectedCount}`}
                  </Badge>
                )}
              </div>

              {/* Errors */}
              {parseErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">Validation Errors:</div>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {parseErrors.slice(0, 10).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                      {parseErrors.length > 10 && (
                        <li className="text-muted-foreground">
                          ...and {parseErrors.length - 10} more errors
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview of valid serials */}
              {validCount > 0 && (
                <div className="p-4 bg-muted rounded-lg max-h-48 overflow-y-auto">
                  <div className="text-sm font-semibold mb-2">Valid Serial Numbers Preview:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    {parsedSerials
                      .filter((p) => p.valid)
                      .slice(0, 50)
                      .map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>{p.serialNumber}</span>
                        </div>
                      ))}
                    {validCount > 50 && (
                      <div className="text-muted-foreground col-span-2">
                        ...and {validCount - 50} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={importMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={
              importMutation.isPending ||
              validCount === 0 ||
              parseErrors.length > 0 ||
              (!!expectedCount && validCount !== expectedCount)
            }
          >
            {importMutation.isPending ? "Importing..." : `Import ${validCount} Serial Numbers`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


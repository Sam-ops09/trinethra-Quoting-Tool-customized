import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, AlertTriangle, CheckCircle2, Hash, ClipboardList, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SerialNumberEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemDescription: string;
  expectedQuantity: number;
  existingSerials?: string[];
  onSave: (serials: string[]) => void;
  isLoading?: boolean;
  invoiceId?: string;
  itemId?: string;
}

interface ValidationError {
  type: "count" | "duplicate" | "empty" | "duplicate_in_invoice" | "duplicate_in_quote" | "duplicate_in_system";
  message: string;
  affectedSerials?: string[];
}

export function SerialNumberEntry({
  open,
  onOpenChange,
  itemDescription,
  expectedQuantity,
  existingSerials = [],
  onSave,
  isLoading = false,
  invoiceId,
  itemId,
}: SerialNumberEntryProps) {
  const [serials, setSerials] = useState<string[]>(existingSerials);
  const [currentSerial, setCurrentSerial] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [activeTab, setActiveTab] = useState<"one-by-one" | "bulk" | "pattern">("one-by-one");

  // Pattern-based entry state
  const [patternPrefix, setPatternPrefix] = useState("");
  const [patternStart, setPatternStart] = useState<number>(1);
  const [patternPadding, setPatternPadding] = useState<number>(5);
  const [patternPreview, setPatternPreview] = useState<string[]>([]);

  // Reset state when dialog opens with existing serials
  useEffect(() => {
    if (open) {
      setSerials(existingSerials);
      setBulkInput(existingSerials.join("\n"));
      setCurrentSerial("");
      setValidationErrors([]);
    }
  }, [open, existingSerials]);

  // Validate serials in real-time
  useEffect(() => {
    validateSerials(serials);
  }, [serials, expectedQuantity]);

  const validateSerials = (serialList: string[]) => {
    const errors: ValidationError[] = [];

    // Check count mismatch
    if (serialList.length !== expectedQuantity) {
      errors.push({
        type: "count",
        message: `Expected ${expectedQuantity} serial numbers, but received ${serialList.length}`,
      });
    }

    // Check for duplicates
    const duplicates = serialList.filter((serial, index) =>
      serialList.indexOf(serial) !== index
    );
    const uniqueDuplicates = Array.from(new Set(duplicates));

    if (uniqueDuplicates.length > 0) {
      errors.push({
        type: "duplicate",
        message: `Duplicate serial number${uniqueDuplicates.length > 1 ? 's' : ''} detected`,
        affectedSerials: uniqueDuplicates,
      });
    }

    // Check for empty serials
    if (serialList.some(s => !s || s.trim().length === 0)) {
      errors.push({
        type: "empty",
        message: "Empty serial numbers are not allowed",
      });
    }

    setValidationErrors(errors);
  };

  const handleAddSerial = () => {
    const trimmed = currentSerial.trim();
    if (!trimmed) return;

    if (serials.includes(trimmed)) {
      setValidationErrors([
        ...validationErrors,
        {
          type: "duplicate",
          message: `Serial number "${trimmed}" already exists`,
          affectedSerials: [trimmed],
        },
      ]);
      return;
    }

    setSerials([...serials, trimmed]);
    setCurrentSerial("");
  };

  const handleRemoveSerial = (index: number) => {
    setSerials(serials.filter((_, i) => i !== index));
  };

  const handleBulkPaste = () => {
    const lines = bulkInput
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    setSerials(lines);
  };

  // Pattern-based generation
  const generatePatternPreview = () => {
    if (!patternPrefix) return [];

    const generated: string[] = [];
    for (let i = 0; i < expectedQuantity; i++) {
      const number = (patternStart + i).toString().padStart(patternPadding, '0');
      generated.push(`${patternPrefix}${number}`);
    }
    return generated;
  };

  const handleGeneratePattern = () => {
    const generated = generatePatternPreview();
    setPatternPreview(generated);
    setSerials(generated);
  };

  // Update preview when pattern changes
  useEffect(() => {
    if (activeTab === 'pattern' && patternPrefix) {
      setPatternPreview(generatePatternPreview());
    }
  }, [patternPrefix, patternStart, patternPadding, expectedQuantity, activeTab]);

  const handleSave = () => {
    // Filter out empty serials and trim whitespace
    const cleanedSerials = serials
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Final validation
    if (cleanedSerials.length !== expectedQuantity) {
      return; // Validation errors will show
    }

    // Check for duplicates
    const uniqueSerials = Array.from(new Set(cleanedSerials));
    if (uniqueSerials.length !== cleanedSerials.length) {
      return; // Validation errors will show
    }

    onSave(cleanedSerials);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSerial();
    }
  };

  const isDuplicate = (serial: string) => {
    return serials.filter(s => s === serial).length > 1;
  };

  const canSave = validationErrors.length === 0 && serials.length === expectedQuantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Assign Serial Numbers
          </DialogTitle>
          <DialogDescription>
            Add serial numbers for: <span className="font-semibold text-foreground">{itemDescription}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Progress Indicator */}
          <div className="mb-4 p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className={cn(
                "text-sm font-semibold",
                serials.length === expectedQuantity
                  ? "text-green-600 dark:text-green-400"
                  : serials.length > expectedQuantity
                  ? "text-red-600 dark:text-red-400"
                  : "text-blue-600 dark:text-blue-400"
              )}>
                {serials.length} / {expectedQuantity}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  serials.length === expectedQuantity
                    ? "bg-green-500"
                    : serials.length > expectedQuantity
                    ? "bg-red-500"
                    : "bg-blue-500"
                )}
                style={{
                  width: `${Math.min((serials.length / expectedQuantity) * 100, 100)}%`
                }}
              />
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="space-y-2 mb-4">
              {validationErrors.map((error, index) => (
                <Alert
                  key={index}
                  variant={error.type === "count" && serials.length === 0 ? "default" : "destructive"}
                  className="py-3"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <div className="font-semibold">{error.message}</div>
                    {error.affectedSerials && error.affectedSerials.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {error.affectedSerials.map((serial, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {serial}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Tabs for entry methods */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="one-by-one" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                One-by-One
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Bulk Paste
              </TabsTrigger>
              <TabsTrigger value="pattern" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Pattern
              </TabsTrigger>
            </TabsList>

            <TabsContent value="one-by-one" className="space-y-4 mt-4">
              {/* Add Serial Input */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter serial number (e.g., SN12345)"
                    value={currentSerial}
                    onChange={(e) => setCurrentSerial(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="font-mono"
                  />
                </div>
                <Button
                  onClick={handleAddSerial}
                  disabled={!currentSerial.trim() || serials.length >= expectedQuantity}
                  size="default"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Serial List */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Entered Serial Numbers ({serials.length})
                </Label>
                <ScrollArea className="h-[300px] rounded-md border p-3">
                  {serials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                      <Hash className="h-12 w-12 mb-2 opacity-20" />
                      <p className="text-sm">No serial numbers added yet</p>
                      <p className="text-xs">Enter serials one at a time or use bulk paste</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {serials.map((serial, index) => (
                        <Badge
                          key={index}
                          variant={isDuplicate(serial) ? "destructive" : "secondary"}
                          className={cn(
                            "text-xs font-mono pr-1 pl-3 py-1.5 flex items-center gap-2",
                            isDuplicate(serial) && "animate-pulse"
                          )}
                        >
                          {serial}
                          <button
                            onClick={() => handleRemoveSerial(index)}
                            className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4 mt-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Paste Serial Numbers (one per line)
                </Label>
                <Textarea
                  placeholder="SN12345&#10;SN12346&#10;SN12347&#10;..."
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="h-[300px] font-mono text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Paste or type one serial number per line. Lines will be automatically trimmed.
                </p>
              </div>

              <Button
                onClick={handleBulkPaste}
                variant="secondary"
                className="w-full"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Parse Serial Numbers ({bulkInput.split('\n').filter(l => l.trim().length > 0).length} detected)
              </Button>

              {/* Preview after parsing */}
              {serials.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Preview ({serials.length} serials)
                  </Label>
                  <ScrollArea className="h-[150px] rounded-md border p-3">
                    <div className="flex flex-wrap gap-2">
                      {serials.map((serial, index) => (
                        <Badge
                          key={index}
                          variant={isDuplicate(serial) ? "destructive" : "secondary"}
                          className="text-xs font-mono"
                        >
                          {serial}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pattern" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <Label className="text-sm font-medium mb-2 block">
                      Prefix
                    </Label>
                    <Input
                      placeholder="SN-"
                      value={patternPrefix}
                      onChange={(e) => setPatternPrefix(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-sm font-medium mb-2 block">
                      Start Number
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={patternStart}
                      onChange={(e) => setPatternStart(parseInt(e.target.value) || 1)}
                      className="font-mono"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-sm font-medium mb-2 block">
                      Padding
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={patternPadding}
                      onChange={(e) => setPatternPadding(parseInt(e.target.value) || 5)}
                      className="font-mono"
                    />
                  </div>
                </div>

                {patternPrefix && (
                  <Alert>
                    <Wand2 className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <div className="font-semibold mb-1">Pattern Preview</div>
                      <div className="font-mono text-xs">
                        {patternPreview.slice(0, 3).join(", ")}
                        {patternPreview.length > 3 && ` ... ${patternPreview[patternPreview.length - 1]}`}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleGeneratePattern}
                  variant="secondary"
                  className="w-full"
                  disabled={!patternPrefix}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate {expectedQuantity} Serial Numbers
                </Button>

                {/* Preview after generation */}
                {serials.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Generated Serials ({serials.length})
                    </Label>
                    <ScrollArea className="h-[200px] rounded-md border p-3">
                      <div className="flex flex-wrap gap-2">
                        {serials.map((serial, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs font-mono"
                          >
                            {serial}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Save {serials.length} Serial Number{serials.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


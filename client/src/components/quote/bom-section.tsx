import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Package } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export interface BOMItem {
  id: string;
  partNumber: string;
  description: string;
  manufacturer?: string;
  quantity: number;
  unitOfMeasure: string;
  specifications?: string;
  notes?: string;
}

interface BOMSectionProps {
  items: BOMItem[];
  onChange: (items: BOMItem[]) => void;
  readonly?: boolean;
}

export function BOMSection({ items, onChange, readonly = false }: BOMSectionProps) {
  const addItem = () => {
    const newItem: BOMItem = {
      id: crypto.randomUUID(),
      partNumber: "",
      description: "",
      manufacturer: "",
      quantity: 1,
      unitOfMeasure: "pcs",
      specifications: "",
      notes: "",
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof BOMItem, value: any) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold">Bill of Materials (BOM)</h3>
        </div>
        {!readonly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            data-testid="button-add-bom-item"
            className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Add Item
          </Button>
        )}
      </div>
      <div className="space-y-4 sm:space-y-6">
        {items.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-30" />
            <p className="text-sm sm:text-base">No BOM items added yet</p>
            {!readonly && <p className="text-xs sm:text-sm mt-1">Click "Add Item" to get started</p>}
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-br from-muted/10 to-transparent">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm sm:text-base">Item {index + 1}</h4>
                {!readonly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    data-testid={`button-remove-bom-${index}`}
                    className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Part Number *</label>
                  <Input
                    value={item.partNumber}
                    onChange={(e) => updateItem(item.id, "partNumber", e.target.value)}
                    placeholder="e.g., PN-12345"
                    disabled={readonly}
                    data-testid={`input-bom-part-number-${index}`}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Manufacturer</label>
                  <Input
                    value={item.manufacturer || ""}
                    onChange={(e) => updateItem(item.id, "manufacturer", e.target.value)}
                    placeholder="e.g., Acme Corp"
                    disabled={readonly}
                    data-testid={`input-bom-manufacturer-${index}`}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Description *</label>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  placeholder="Detailed description of the component"
                  disabled={readonly}
                  rows={2}
                  data-testid={`input-bom-description-${index}`}
                  className="min-h-[60px] sm:min-h-[70px] text-sm resize-none"
                />
              </div>

              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Quantity *</label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                    min="1"
                    disabled={readonly}
                    data-testid={`input-bom-quantity-${index}`}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-xs sm:text-sm font-medium">Unit of Measure</label>
                  <Input
                    value={item.unitOfMeasure}
                    onChange={(e) => updateItem(item.id, "unitOfMeasure", e.target.value)}
                    placeholder="pcs, kg, m, etc."
                    disabled={readonly}
                    data-testid={`input-bom-uom-${index}`}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Specifications</label>
                <Textarea
                  value={item.specifications || ""}
                  onChange={(e) => updateItem(item.id, "specifications", e.target.value)}
                  placeholder="Technical specifications, dimensions, standards, etc."
                  disabled={readonly}
                  rows={2}
                  data-testid={`input-bom-specs-${index}`}
                  className="min-h-[60px] sm:min-h-[70px] text-sm resize-none"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Notes</label>
                <Textarea
                  value={item.notes || ""}
                  onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                  placeholder="Additional notes or comments"
                  disabled={readonly}
                  rows={2}
                  data-testid={`input-bom-notes-${index}`}
                  className="min-h-[60px] sm:min-h-[70px] text-sm resize-none"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


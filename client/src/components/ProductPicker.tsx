import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Package, PackageOpen, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  basePrice?: string;
  stockQuantity?: number;
  availableQuantity?: number;
  isActive?: boolean;
}

interface ProductPickerProps {
  value?: string | null;
  onSelect: (product: Product | null) => void;
  onAddWithoutProduct?: () => void;
  showStock?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /** Set to true when free text mode is active (controlled from parent) */
  isFreeTextMode?: boolean;
}

export function ProductPicker({
  value,
  onSelect,
  onAddWithoutProduct,
  showStock = true,
  placeholder = "Select product...",
  disabled = false,
  isFreeTextMode = false,
}: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [localFreeTextMode, setLocalFreeTextMode] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Determine if we're in free text mode
  const isInFreeTextMode = isFreeTextMode || localFreeTextMode;

  // Find and set selected product when value changes
  useEffect(() => {
    if (value && products.length > 0) {
      const product = products.find((p) => p.id === value);
      setSelectedProduct(product || null);
      setLocalFreeTextMode(false);
    } else if (value === null && !isInFreeTextMode) {
      setSelectedProduct(null);
    }
  }, [value, products, isInFreeTextMode]);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setLocalFreeTextMode(false);
    onSelect(product);
    setOpen(false);
  };

  const handleAddWithoutProduct = () => {
    setSelectedProduct(null);
    setLocalFreeTextMode(true);
    onSelect(null);
    onAddWithoutProduct?.();
    setOpen(false);
  };

  const handleClearFreeText = () => {
    setLocalFreeTextMode(false);
    setSelectedProduct(null);
  };

  const getStockBadge = (product: Product) => {
    if (!showStock) return null;
    const available = product.availableQuantity || 0;
    if (available > 10) {
      return (
        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
          {available} in stock
        </Badge>
      );
    } else if (available > 0) {
      return (
        <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
          {available} in stock
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
          Out of stock
        </Badge>
      );
    }
  };

  const activeProducts = products.filter((p) => p.isActive !== false);

  // Render the button content based on state
  const renderButtonContent = () => {
    if (selectedProduct) {
      return (
        <div className="flex items-center gap-2 truncate">
          <Package className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {selectedProduct.sku} - {selectedProduct.name}
          </span>
        </div>
      );
    }
    
    if (isInFreeTextMode) {
      return (
        <div className="flex items-center gap-2 truncate">
          <Edit3 className="h-4 w-4 shrink-0 text-blue-500" />
          <span className="text-blue-600 font-medium">Free text entry</span>
        </div>
      );
    }
    
    return <span>{placeholder}</span>;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedProduct && !isInFreeTextMode && "text-muted-foreground",
            isInFreeTextMode && "border-blue-300 bg-blue-50/50"
          )}
          disabled={disabled}
        >
          {renderButtonContent()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(400px,calc(100vw-2rem))] p-0" align="start">
        {/* Free text option - always visible, outside command filtering */}
        <div className="border-b p-2">
          <Button
            variant={isInFreeTextMode ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2 text-left",
              isInFreeTextMode && "bg-blue-100 text-blue-700 hover:bg-blue-100"
            )}
            onClick={handleAddWithoutProduct}
          >
            <PackageOpen className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Add without product (free text)</span>
              <span className="text-xs text-muted-foreground">Enter custom description manually</span>
            </div>
            {isInFreeTextMode && <Check className="ml-auto h-4 w-4" />}
          </Button>
        </div>
        
        <Command>
          <CommandInput placeholder="Search by name or SKU..." />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            
            {/* Products from catalog */}
            <CommandGroup heading="Products">
              {isLoading ? (
                <CommandItem disabled>Loading products...</CommandItem>
              ) : (
                activeProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={`${product.sku} ${product.name}`}
                    onSelect={() => handleSelect(product)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center">
                        <span className="font-medium">{product.sku}</span>
                        <span className="mx-2 text-muted-foreground">|</span>
                        <span className="truncate">{product.name}</span>
                        {getStockBadge(product)}
                      </div>
                      {product.basePrice && (
                        <span className="text-xs text-muted-foreground">
                          Base price: {formatCurrency(parseFloat(product.basePrice))}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default ProductPicker;


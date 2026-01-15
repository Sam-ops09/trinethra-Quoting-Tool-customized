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
import { Check, ChevronsUpDown, Package, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
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
}

export function ProductPicker({
  value,
  onSelect,
  onAddWithoutProduct,
  showStock = true,
  placeholder = "Search products...",
  disabled = false,
}: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Find and set selected product when value changes
  useEffect(() => {
    if (value && products.length > 0) {
      const product = products.find((p) => p.id === value);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [value, products]);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    onSelect(product);
    setOpen(false);
  };

  const handleAddWithoutProduct = () => {
    setSelectedProduct(null);
    onSelect(null);
    onAddWithoutProduct?.();
    setOpen(false);
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedProduct && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {selectedProduct ? (
            <div className="flex items-center gap-2 truncate">
              <Package className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {selectedProduct.sku} - {selectedProduct.name}
              </span>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(400px,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by name or SKU..." />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            
            {/* Option to add without product link */}
            <CommandGroup heading="Options">
              <CommandItem onSelect={handleAddWithoutProduct}>
                <PackageOpen className="mr-2 h-4 w-4" />
                <span>Add without product (free text)</span>
              </CommandItem>
            </CommandGroup>
            
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
                          Base price: ₹{parseFloat(product.basePrice).toLocaleString()}
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

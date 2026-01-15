import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Edit, Package, AlertTriangle, CheckCircle, Grid3x3, List, Box, DollarSign, Home, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { PermissionGuard } from "@/components/permission-guard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unitPrice: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  requiresSerialNumber: boolean;
  warrantyMonths: number;
  isActive: boolean;
  createdAt: string;
}

export default function Products() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Feature flags for stock tracking
  const stockTrackingEnabled = useFeatureFlag('products_stock_tracking');
  const stockWarningsEnabled = useFeatureFlag('products_stock_warnings');
  
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    category: "",
    unitPrice: "",
    stockQuantity: 0,
    reorderLevel: 10,
    requiresSerialNumber: false,
    warrantyMonths: 12,
    isActive: true,
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product created successfully" });
      setShowDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      return await apiRequest("PATCH", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated successfully" });
      setShowDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      description: "",
      category: "",
      unitPrice: "",
      stockQuantity: 0,
      reorderLevel: 10,
      requiresSerialNumber: false,
      warrantyMonths: 12,
      isActive: true,
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      unitPrice: product.unitPrice,
      stockQuantity: product.stockQuantity,
      reorderLevel: product.reorderLevel,
      requiresSerialNumber: product.requiresSerialNumber,
      warrantyMonths: product.warrantyMonths,
      isActive: product.isActive,
    });
    setShowDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (product: Product) => {
    if (!stockTrackingEnabled) {
      return { label: "Catalog", color: "default" };
    }
    if (product.availableQuantity === 0) {
      return { label: "Out of Stock", color: "destructive" };
    } else if (product.availableQuantity <= product.reorderLevel) {
      return { label: "Low Stock", color: "warning" };
    } else {
      return { label: "In Stock", color: "success" };
    }
  };

  // Calculate stats
  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.availableQuantity <= p.reorderLevel && p.availableQuantity > 0).length,
    outOfStock: products.filter(p => p.availableQuantity === 0).length,
    totalValue: products.reduce((sum, p) => sum + (parseFloat(p.unitPrice) * p.stockQuantity), 0),
  };

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">

        {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
              <button
                  onClick={() => setLocation("/")}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
              >
                  <Home className="h-3.5 w-3.5" />
                  <span>Home</span>
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                <Package className="h-3.5 w-3.5" />
                Products
              </span>
          </nav>


        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Products & Inventory
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Manage catalog & stock
            </p>
          </div>
          <PermissionGuard resource="products" action="create">
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 h-8 text-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </PermissionGuard>
        </div>

        {/* Statistics Cards - Stock stats only when tracking enabled */}
        <div className={`grid gap-2 ${stockTrackingEnabled ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Total</span>
                <Box className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">Products</p>
            </CardContent>
          </Card>

          {stockTrackingEnabled && stockWarningsEnabled && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Low</span>
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.lowStock}</div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">Low Stock</p>
              </CardContent>
            </Card>
          )}

          {stockTrackingEnabled && stockWarningsEnabled && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Out</span>
                  <Package className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{stats.outOfStock}</div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">Out of Stock</p>
              </CardContent>
            </Card>
          )}

          {stockTrackingEnabled && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Value</span>
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{(stats.totalValue / 1000).toFixed(0)}K</div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">Inventory</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Search & Filter */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search by name, SKU, or category..."
                  className="pl-9 h-9 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger value="grid" className="gap-1.5 text-xs">
                    <Grid3x3 className="h-3 w-3" />
                    <span className="hidden sm:inline">Grid</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-1.5 text-xs">
                    <List className="h-3 w-3" />
                    <span className="hidden sm:inline">List</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Products Display - Grid or List View */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                <div className="rounded-full bg-slate-100 dark:bg-slate-900 p-5">
                  <Package className="h-10 w-10 text-slate-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {searchTerm ? "No products found" : "No products yet"}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {searchTerm
                      ? "Try adjusting your search criteria to find what you're looking for."
                      : "Get started by adding your first product to your inventory."}
                  </p>
                </div>
                {!searchTerm && (
                  <PermissionGuard resource="products" action="create">
                    <Button
                      onClick={() => setShowDialog(true)}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 h-8 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add First Product
                    </Button>
                  </PermissionGuard>
                )}
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product);
              return (
                <Card key={product.id} className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2.5 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                          {product.name}
                        </CardTitle>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono truncate">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Badge
                          className={`text-[10px] px-1.5 py-0 ${
                            status.color === 'destructive' 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900' 
                              : status.color === 'warning' 
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                          }`}
                        >
                          {status.label}
                        </Badge>
                        <Badge
                          className={`text-[10px] px-1.5 py-0 ${
                            product.isActive 
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' 
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-2">
                        {product.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-2.5 p-3 pt-0">
                    {/* Price & Category */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5 uppercase font-semibold">Price</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">₹{parseFloat(product.unitPrice).toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5 uppercase font-semibold">Category</p>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{product.category || "—"}</p>
                      </div>
                    </div>

                    {/* Stock Info - only when stock tracking enabled */}
                    {stockTrackingEnabled && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5 uppercase font-semibold">Stock</p>
                          <p className="text-base font-bold text-slate-900 dark:text-white">{product.stockQuantity}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5 uppercase font-semibold">Available</p>
                          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{product.availableQuantity}</p>
                        </div>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {product.requiresSerialNumber && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700">
                          Serial #
                        </Badge>
                      )}
                      {product.warrantyMonths > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700">
                          {product.warrantyMonths}M Warranty
                        </Badge>
                      )}
                      {stockTrackingEnabled && stockWarningsEnabled && product.availableQuantity <= product.reorderLevel && product.availableQuantity > 0 && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900">
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                          Reorder
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    {/* Edit Button */}
                    <PermissionGuard resource="products" action="edit">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="w-full h-8 text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1.5" />
                        Edit Product
                      </Button>
                    </PermissionGuard>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product);
              return (
                <Card key={product.id} className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Left: Product Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono truncate">
                              SKU: {product.sku}
                            </p>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${
                                status.color === 'destructive' 
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900' 
                                  : status.color === 'warning' 
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                              }`}
                            >
                              {status.label}
                            </Badge>
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${
                                product.isActive 
                                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' 
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>

                        {/* Product Details Row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-semibold text-slate-900 dark:text-white">₹{parseFloat(product.unitPrice).toLocaleString()}</span>
                          </div>
                          {stockTrackingEnabled && (
                            <>
                              <div className="flex items-center gap-1.5">
                                <Package className="h-3 w-3" />
                                <span>Stock: <strong className="text-slate-900 dark:text-white">{product.stockQuantity}</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Available: <strong className="text-slate-900 dark:text-white">{product.availableQuantity}</strong></span>
                              </div>
                            </>
                          )}
                          {product.category && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700">{product.category}</Badge>
                          )}
                        </div>
                      </div>

                      {/* Right: Action Button */}
                      <div className="flex gap-2 shrink-0">
                        <PermissionGuard resource="products" action="edit">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-3 w-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog stays the same - no changes needed */}

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              {stockTrackingEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                    <Input
                      id="reorderLevel"
                      type="number"
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warrantyMonths">Warranty (Months)</Label>
                  <Input
                    id="warrantyMonths"
                    type="number"
                    value={formData.warrantyMonths}
                    onChange={(e) => setFormData({ ...formData, warrantyMonths: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="requiresSerialNumber"
                    checked={formData.requiresSerialNumber}
                    onCheckedChange={(checked) => setFormData({ ...formData, requiresSerialNumber: checked })}
                  />
                  <Label htmlFor="requiresSerialNumber">Requires Serial Number</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProduct ? "Update" : "Create"} Product
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


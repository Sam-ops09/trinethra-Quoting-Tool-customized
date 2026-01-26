import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  CheckCircle,
  Edit,
  Plus,
  Package,
  TrendingUp,
  FileText,
  Calendar,
  DollarSign,
  Minus,
  X,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from "@/components/permission-guard";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currency";

interface MasterInvoiceProps {
  invoiceId: string;
}

interface MasterSummary {
  masterInvoice: {
    id: string;
    invoiceNumber: string;
    status: "draft" | "confirmed" | "locked";
    total: string;
    subtotal: string;
    discount: string;
    cgst: string;
    sgst: string;
    igst: string;
    shippingCharges: string;
    currency: string;
    createdAt: string;
  };
  items: Array<{
    id: string;
    description: string;
    masterQuantity: number;
    masterUnitPrice: string;
    masterSubtotal: string;
    invoicedQuantity: number;
    invoicedAmount: number;
    remainingQuantity: number;
    remainingAmount: number;
  }>;
  childInvoices: Array<{
    id: string;
    invoiceNumber: string;
    total: string;
    paymentStatus: string;
    paidAmount: string;
    createdAt: string;
  }>;
  totals: {
    masterTotal: string;
    totalInvoiced: string;
    totalRemaining: string;
    invoicedPercentage: string;
  };
}

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    icon: Edit,
    color: "bg-gray-500",
    description: "Under preparation; can be edited",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "bg-blue-500",
    description: "Finalized as commercial baseline",
  },
  locked: {
    label: "Locked",
    icon: Lock,
    color: "bg-green-500",
    description: "Fully locked; view only",
  },
};

export function MasterInvoiceManager({ invoiceId }: MasterInvoiceProps) {
  const { toast } = useToast();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showChildInvoiceDialog, setShowChildInvoiceDialog] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editTerms, setEditTerms] = useState("");
  const [editDeliveryNotes, setEditDeliveryNotes] = useState("");
  const [childInvoiceItems, setChildInvoiceItems] = useState<any[]>([]);

  // Fetch master invoice summary
  const { data: summary, isLoading } = useQuery<MasterSummary>({
    queryKey: [`/api/invoices/${invoiceId}/master-summary`],
  });

  // Update master invoice status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: "confirmed" | "locked") => {
      return await apiRequest("PUT", `/api/invoices/${invoiceId}/master-status`, {
        masterInvoiceStatus: newStatus,
      });
    },
    onSuccess: () => {
      // Force refetch to ensure data updates immediately (since staleTime is Infinity)
      queryClient.refetchQueries({ queryKey: [`/api/invoices/${invoiceId}/master-summary`] });
      queryClient.refetchQueries({ queryKey: [`/api/invoices/${invoiceId}`] });
      toast({
        title: "Status Updated",
        description: "Master invoice status has been updated successfully.",
      });
      setShowStatusDialog(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update master invoice status.",
      });
    },
  });

  // Update master invoice details mutation
  const updateDetailsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/invoices/${invoiceId}/master-details`, data);
    },
    onSuccess: () => {
      // Force refetch to ensure data updates immediately (since staleTime is Infinity)
      queryClient.refetchQueries({ queryKey: [`/api/invoices/${invoiceId}/master-summary`] });
      queryClient.refetchQueries({ queryKey: [`/api/invoices/${invoiceId}`] });
      toast({
        title: "Details Updated",
        description: "Master invoice details have been updated successfully.",
      });
      setShowEditDialog(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update master invoice details.",
      });
    },
  });

  // Create child invoice mutation
  const createChildInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/invoices/${invoiceId}/create-child-invoice`, data);
    },
    onSuccess: () => {
      // Force refetch to ensure data updates immediately (since staleTime is Infinity)
      queryClient.refetchQueries({ queryKey: [`/api/invoices/${invoiceId}/master-summary`] });
      toast({
        title: "Child Invoice Created",
        description: "Child invoice has been created successfully.",
      });
      setShowChildInvoiceDialog(false);
      setChildInvoiceItems([]);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Failed to create child invoice.",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Master Invoice Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-gray-100 animate-pulse rounded" />
            <div className="h-40 bg-gray-100 animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const currentStatus = summary.masterInvoice.status;
  const StatusIcon = STATUS_CONFIG[currentStatus].icon;
  const canEdit = currentStatus !== "locked";
  const canConfirm = currentStatus === "draft";
  const canLock = currentStatus === "confirmed";
  const canCreateChild = currentStatus !== "draft";

  const invoicedPercentage = parseFloat(summary.totals.invoicedPercentage);

  const handleStatusUpdate = (newStatus: "confirmed" | "locked") => {
    updateStatusMutation.mutate(newStatus);
  };

  const handleDetailsUpdate = () => {
    updateDetailsMutation.mutate({
      notes: editNotes,
      termsAndConditions: editTerms,
      deliveryNotes: editDeliveryNotes,
    });
  };

  const handleAddItemToChild = (item: any) => {
    const existing = childInvoiceItems.find(i => i.description === item.description);
    if (existing) {
      toast({
        variant: "default",
        title: "Item Already Added",
        description: "This item is already in the child invoice. Please adjust the quantity in the selected items section below.",
      });
      return;
    }

    if (item.remainingQuantity <= 0) {
      toast({
        variant: "destructive",
        title: "No Quantity Remaining",
        description: "This item has been fully invoiced.",
      });
      return;
    }

    setChildInvoiceItems([
      ...childInvoiceItems,
      {
        description: item.description,
        quantity: 1,
        maxQuantity: item.remainingQuantity,
        unitPrice: item.masterUnitPrice,
        sortOrder: childInvoiceItems.length,
      },
    ]);
  };

  const handleCreateChildInvoice = () => {
    if (childInvoiceItems.length === 0) {
      toast({
        variant: "destructive",
        title: "No Items",
        description: "Please add at least one item to the child invoice.",
      });
      return;
    }

    createChildInvoiceMutation.mutate({
      items: childInvoiceItems,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "",
      deliveryNotes: "",
      milestoneDescription: "",
    });
  };

  return (
    <div className="space-y-2">
      {/* Master Invoice Header Card - Compact & Responsive */}
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-blue-500/20 shrink-0">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                  Master Invoice Control
                  <Badge
                    className={`${STATUS_CONFIG[currentStatus].color} text-white text-[9px] px-1.5 py-0 shrink-0`}
                    variant="default"
                  >
                    <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                    {STATUS_CONFIG[currentStatus].label}
                  </Badge>
                </h3>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                  {STATUS_CONFIG[currentStatus].description}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {canConfirm && (
                <PermissionGuard resource="invoices" action="finalize" tooltipText="Only Sales Executives, Finance/Accounts can confirm master invoices">
                  <Button
                    size="sm"
                    onClick={() => setShowStatusDialog(true)}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span className="hidden xs:inline">Confirm</span>
                    <span className="xs:hidden">✓</span>
                  </Button>
                </PermissionGuard>
              )}
              {canLock && (
                <PermissionGuard resource="invoices" action="lock" tooltipText="Only Finance/Accounts can lock master invoices">
                  <Button
                    size="sm"
                    onClick={() => setShowStatusDialog(true)}
                    className="h-7 text-xs bg-green-600 hover:bg-green-700"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    <span className="hidden xs:inline">Lock</span>
                    <span className="xs:hidden">🔒</span>
                  </Button>
                </PermissionGuard>
              )}
              {canEdit && (
                <PermissionGuard resource="invoices" action="edit" tooltipText="Only Finance/Accounts can edit master invoices">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEditDialog(true)}
                    className="h-7 text-xs"
                  >
                    <Edit className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                </PermissionGuard>
              )}
            </div>
          </div>
        </div>

        {/* Progress Section - Redesigned */}
        <CardContent className="p-3 space-y-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase">Total</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {formatCurrency(summary.totals.masterTotal, summary.masterInvoice.currency)}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-[10px] font-semibold text-green-700 dark:text-green-400 uppercase">Invoiced</span>
              </div>
              <p className="text-sm font-bold text-green-900 dark:text-green-100 truncate">
                {formatCurrency(summary.totals.totalInvoiced, summary.masterInvoice.currency)}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 uppercase">Remaining</span>
              </div>
              <p className="text-sm font-bold text-orange-900 dark:text-orange-100 truncate">
                {formatCurrency(summary.totals.totalRemaining, summary.masterInvoice.currency)}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 uppercase">Children</span>
              </div>
              <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                {summary.childInvoices.length}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Invoicing Progress
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {invoicedPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={invoicedPercentage} className="h-2" />
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
              <span>{formatCurrency(summary.totals.totalInvoiced, summary.masterInvoice.currency)}</span>
              <span>{formatCurrency(summary.totals.masterTotal, summary.masterInvoice.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Breakdown - New Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Subtotal</p>
            <p className="text-sm font-bold">{formatCurrency(summary.masterInvoice.subtotal, summary.masterInvoice.currency)}</p>
        </Card>
        {Number(summary.masterInvoice.discount) > 0 && (
            <Card className="border-emerald-200 dark:border-emerald-900 p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Discount</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">-{formatCurrency(summary.masterInvoice.discount, summary.masterInvoice.currency)}</p>
            </Card>
        )}
        {(Number(summary.masterInvoice.cgst) > 0 || Number(summary.masterInvoice.sgst) > 0 || Number(summary.masterInvoice.igst) > 0) && (
             <Card className="border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Taxes</p>
                <p className="text-sm font-bold">{formatCurrency((Number(summary.masterInvoice.cgst) + Number(summary.masterInvoice.sgst) + Number(summary.masterInvoice.igst)), summary.masterInvoice.currency)}</p>
            </Card>
        )}
        {Number(summary.masterInvoice.shippingCharges) > 0 && (
            <Card className="border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Shipping</p>
                <p className="text-sm font-bold">{formatCurrency(summary.masterInvoice.shippingCharges, summary.masterInvoice.currency)}</p>
            </Card>
        )}
      </div>

      {/* Items Breakdown - New Card Design */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              <CardTitle className="text-sm font-bold">Items Breakdown</CardTitle>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {summary.items.length} items
              </Badge>
            </div>
            {canCreateChild && (
              <PermissionGuard resource="invoices" action="create" tooltipText="Sales Executives, Sales Managers, and Finance/Accounts can create child invoices">
                <Button
                  size="sm"
                  onClick={() => setShowChildInvoiceDialog(true)}
                  className="h-7 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Create Child Invoice</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </PermissionGuard>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile-First Item Cards */}
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {summary.items.map((item, index) => {
              const itemProgress = (item.invoicedQuantity / item.masterQuantity) * 100;
              return (
                <div key={index} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-slate-600 dark:text-slate-400">
                          {formatCurrency(item.masterUnitPrice, summary.masterInvoice.currency)} × {item.masterQuantity}
                        </span>
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                          = {formatCurrency(item.masterSubtotal, summary.masterInvoice.currency)}
                        </span>
                      </div>
                    </div>
                    {canCreateChild && item.remainingQuantity > 0 && (
                      <PermissionGuard resource="invoices" action="create" tooltipText="Only Finance/Accounts can create child invoices">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddItemToChild(item)}
                          className="h-7 text-xs shrink-0"
                        >
                          <Plus className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Add</span>
                        </Button>
                      </PermissionGuard>
                    )}
                  </div>

                  {/* Quantity Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <p className="text-blue-700 dark:text-blue-400 font-semibold mb-0.5">Master</p>
                      <p className="text-blue-900 dark:text-blue-100 font-bold">{item.masterQuantity}</p>
                    </div>
                    <div className="p-1.5 rounded bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                      <p className="text-green-700 dark:text-green-400 font-semibold mb-0.5">Invoiced</p>
                      <p className="text-green-900 dark:text-green-100 font-bold">{item.invoicedQuantity}</p>
                    </div>
                    <div className="p-1.5 rounded bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                      <p className="text-orange-700 dark:text-orange-400 font-semibold mb-0.5">Remaining</p>
                      <p className="text-orange-900 dark:text-orange-100 font-bold">{item.remainingQuantity}</p>
                    </div>
                  </div>

                  {/* Item Progress */}
                  <div className="mt-2 space-y-1">
                    <Progress value={itemProgress} className="h-1.5" />
                    <div className="flex justify-between text-[9px] text-slate-600 dark:text-slate-400">
                      <span>{itemProgress.toFixed(0)}% complete</span>
                      <span>{formatCurrency(item.remainingAmount, summary.masterInvoice.currency)} left</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Child Invoices - Redesigned Cards */}
      {summary.childInvoices.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              <CardTitle className="text-sm font-bold">Child Invoices</CardTitle>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {summary.childInvoices.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {summary.childInvoices.map((child) => (
                <a
                  key={child.id}
                  href={`/invoices/${child.id}`}
                  className="block p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {child.invoiceNumber}
                        </p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(child.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 shrink-0 ${
                        child.paymentStatus === 'paid' 
                          ? 'bg-green-50 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400'
                          : child.paymentStatus === 'partial'
                          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-700 dark:text-orange-400'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {child.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Total:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(child.total, summary.masterInvoice.currency)}
                    </span>
                  </div>
                  {Number(child.paidAmount) > 0 && (
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-green-600 dark:text-green-400">Paid:</span>
                      <span className="font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(child.paidAmount, summary.masterInvoice.currency)}
                      </span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Change Dialog - Redesigned */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {canConfirm ? (
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
              )}
              <div>
                <DialogTitle className="text-base">
                  {canConfirm ? "Confirm Master Invoice?" : "Lock Master Invoice?"}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {canConfirm
                    ? "Finalize this invoice as the commercial baseline"
                    : "Lock this invoice permanently (cannot be undone)"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Current Status:</span>
                <Badge className={`${STATUS_CONFIG[currentStatus].color} text-white text-xs`}>
                  {STATUS_CONFIG[currentStatus].label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">New Status:</span>
                <Badge className={`${canConfirm ? STATUS_CONFIG.confirmed.color : STATUS_CONFIG.locked.color} text-white text-xs`}>
                  {canConfirm ? STATUS_CONFIG.confirmed.label : STATUS_CONFIG.locked.label}
                </Badge>
              </div>
            </div>

            {!canConfirm && (
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-orange-900 dark:text-orange-100">
                      Warning: This action cannot be undone
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Locking the master invoice will prevent all future edits and status changes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleStatusUpdate(canConfirm ? "confirmed" : "locked");
                setShowStatusDialog(false);
              }}
              disabled={updateStatusMutation.isPending}
              className={`h-9 text-xs ${canConfirm ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
            >
              {updateStatusMutation.isPending && (
                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {canConfirm ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1.5" />
                  Confirm Invoice
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1.5" />
                  Lock Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Details Dialog - Redesigned */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Edit className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-base">Edit Master Invoice Details</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Update notes, terms, and delivery information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="edit-notes" className="text-xs font-semibold">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add internal notes..."
                className="mt-1.5 min-h-[80px] text-xs"
              />
            </div>

            <div>
              <Label htmlFor="edit-terms" className="text-xs font-semibold">
                Terms & Conditions
              </Label>
              <Textarea
                id="edit-terms"
                value={editTerms}
                onChange={(e) => setEditTerms(e.target.value)}
                placeholder="Enter terms and conditions..."
                className="mt-1.5 min-h-[80px] text-xs"
              />
            </div>

            <div>
              <Label htmlFor="edit-delivery" className="text-xs font-semibold">
                Delivery Notes
              </Label>
              <Textarea
                id="edit-delivery"
                value={editDeliveryNotes}
                onChange={(e) => setEditDeliveryNotes(e.target.value)}
                placeholder="Add delivery instructions..."
                className="mt-1.5 min-h-[80px] text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDetailsUpdate}
              disabled={updateDetailsMutation.isPending}
              className="h-9 text-xs bg-blue-600 hover:bg-blue-700"
            >
              {updateDetailsMutation.isPending && (
                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Child Invoice Dialog - Completely Redesigned */}
      <Dialog open={showChildInvoiceDialog} onOpenChange={setShowChildInvoiceDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Plus className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-base">Create Child Invoice</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Select items and quantities for the new invoice
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Available Items Section */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">
                Available Items ({summary.items.filter(i => i.remainingQuantity > 0).length})
              </Label>
              {summary.items.filter(item => item.remainingQuantity > 0).length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {summary.items
                    .filter(item => item.remainingQuantity > 0)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Package className="h-2.5 w-2.5" />
                              {item.remainingQuantity} available
                            </span>
                            <span>•</span>
                            <span>₹{Number(item.masterUnitPrice).toLocaleString()}/unit</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddItemToChild(item)}
                          disabled={childInvoiceItems.some(ci => ci.description === item.description)}
                          className="h-7 text-xs shrink-0"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                  <Package className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    No items available. All items have been fully invoiced.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Selected Items Section */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">
                Selected Items ({childInvoiceItems.length})
              </Label>
              {childInvoiceItems.length > 0 ? (
                <div className="space-y-2">
                  {childInvoiceItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-blue-50 dark:bg-blue-950/20"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {item.description}
                          </p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                            ₹{Number(item.unitPrice).toLocaleString()} per unit
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setChildInvoiceItems(childInvoiceItems.filter((_, i) => i !== index))}
                          className="h-6 w-6 p-0 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 flex-1">
                          <Label className="text-[10px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            Qty:
                          </Label>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newItems = [...childInvoiceItems];
                                if (newItems[index].quantity > 1) {
                                  newItems[index].quantity--;
                                  setChildInvoiceItems(newItems);
                                }
                              }}
                              className="h-7 w-7 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.maxQuantity}
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...childInvoiceItems];
                                newItems[index].quantity = Math.min(
                                  Math.max(parseInt(e.target.value) || 1, 1),
                                  item.maxQuantity
                                );
                                setChildInvoiceItems(newItems);
                              }}
                              className="w-16 h-7 text-center text-xs"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newItems = [...childInvoiceItems];
                                if (newItems[index].quantity < item.maxQuantity) {
                                  newItems[index].quantity++;
                                  setChildInvoiceItems(newItems);
                                }
                              }}
                              className="h-7 w-7 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400">
                            / {item.maxQuantity}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-600 dark:text-slate-400">Subtotal</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            ₹{(parseFloat(item.unitPrice) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Total Section */}
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Invoice Total
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ₹{childInvoiceItems
                          .reduce((sum, item) => sum + parseFloat(item.unitPrice) * item.quantity, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                  <FileText className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    No items selected. Add items from the list above.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowChildInvoiceDialog(false);
                setChildInvoiceItems([]);
              }}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChildInvoice}
              disabled={createChildInvoiceMutation.isPending || childInvoiceItems.length === 0}
              className="h-9 text-xs bg-purple-600 hover:bg-purple-700"
            >
              {createChildInvoiceMutation.isPending && (
                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <Plus className="h-3 w-3 mr-1.5" />
              Create Child Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

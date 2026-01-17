import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Send, Check, X, Receipt, Loader2, Pencil, Package, FileText, User, Mail, Phone, MapPin, Calendar, Hash, Home, ChevronRight, History, Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from "@/components/permission-guard";
import { AdvancedSectionsDisplay } from "@/components/quote/advanced-sections-display";
import { CreateVendorPoDialog } from "@/components/vendor-po/create-vendor-po-dialog";
import type { BOMItem } from "@/components/quote/bom-section";
import type { SLAData } from "@/components/quote/sla-section";
import type { TimelineData } from "@/components/quote/timeline-section";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions-new";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { VersionComparisonDialog } from "@/components/quote/version-comparison-dialog";
import { QuoteVersionViewer } from "@/components/quote/quote-version-viewer";

interface QuoteDetail {
  id: string;
  quoteNumber: string;
  version: number;
  status: string;
  client: {
    name: string;
    email: string;
    phone: string;
    billingAddress: string;
    gstin: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    hsnSac?: string;
  }>;
  subtotal: string;
  discount: string;
  cgst: string;
  sgst: string;
  igst: string;
  shippingCharges: string;
  total: string;
  validityDays: number;
  quoteDate: string;
  referenceNumber: string;
  attentionTo: string;
  notes: string;
  termsAndConditions: string;
  bomSection?: string; // JSON string
  slaSection?: string; // JSON string
  timelineSection?: string; // JSON string
  createdByName?: string;
  updatedAt: string;
}

export default function QuoteDetail() {
  const [, params] = useRoute("/quotes/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailData, setEmailData] = useState({ email: "", message: "" });
  const [isDownloading, setIsDownloading] = useState(false);

  const [showVendorPoDialog, setShowVendorPoDialog] = useState(false);
  const [comparingVersionNumber, setComparingVersionNumber] = useState<number | null>(null);
  const [viewingVersionNumber, setViewingVersionNumber] = useState<number | null>(null);

  // Feature flags
  const canCreateVendorPO = useFeatureFlag('vendorPO_create');
  const canSendEmail = useFeatureFlag('quotes_emailSending');
  const canGeneratePDF = useFeatureFlag('quotes_pdfGeneration');
  const canConvertToInvoice = useFeatureFlag('quotes_convertToInvoice');
  const canSendQuote = useFeatureFlag('quotes_sendQuote');
  const canClone = useFeatureFlag('quotes_clone');

  const { data: quote, isLoading } = useQuery<QuoteDetail>({
    queryKey: ["/api/quotes", params?.id],
    enabled: !!params?.id,
  });

  // Check if sales order exists for this quote
  const { data: salesOrders } = useQuery<any[]>({
    queryKey: [`/api/sales-orders?quoteId=${params?.id}`],
    enabled: !!params?.id && quote?.status === "approved",
  });
  const hasSalesOrder = salesOrders && salesOrders.length > 0;
  const salesOrder = hasSalesOrder ? salesOrders[0] : null;

  const { data: versions } = useQuery<any[]>({
    queryKey: [`/api/quotes/${params?.id}/versions`],
    enabled: !!params?.id,
  });

  // Check for linked invoices
  const { data: invoices } = useQuery<any[]>({
    queryKey: [`/api/quotes/${params?.id}/invoices`],
    enabled: !!params?.id,
  });
  const hasInvoices = invoices && invoices.length > 0;

  // Check for linked vendor POs
  const { data: vendorPos } = useQuery<any[]>({
    queryKey: [`/api/vendor-pos?quoteId=${params?.id}`],
    enabled: !!params?.id,
  });
  const hasVendorPos = vendorPos && vendorPos.length > 0;

  const createSalesOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/quotes/${params?.id}/sales-orders`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sales Order Created",
        description: `Order #${data.orderNumber} has been created successfully.`,
      });
      setLocation(`/sales-orders/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create Sales Order",
        variant: "destructive",
      });
    }
  });

  const reviseQuoteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/quotes/${params?.id}/revise`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes", params?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${params?.id}/versions`] });
      toast({
        title: "Quote Revised",
        description: `New version ${data.version} created (Draft). Previous version saved.`,
      });
      // Optionally reload or just rely on query invalidation
    },
    onError: (error: any) => {
      toast({
        title: "Revision Failed",
        description: error.message || "Failed to revise quote",
        variant: "destructive",
      });
    }
  });

  const cloneQuoteMutation = useMutation({
    mutationFn: async () => {
       const response = await fetch(`/api/quotes/${params?.id}/clone`, {
           method: "POST",
           headers: {
               "Content-Type": "application/json",
           },
       });
       
       if (!response.ok) {
           const error = await response.json();
           throw new Error(error.error || "Failed to clone quote");
       }
       
       return response.json();
    },
    onSuccess: (data) => {
        toast({
            title: "Success",
            description: "Quote cloned successfully",
        });
        setLocation(`/quotes/${data.id}`);
    },
    onError: (error: Error) => {
        toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
        });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest("PATCH", `/api/quotes/${params?.id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes", params?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Status updated",
        description: "Quote status has been updated successfully.",
      });
    },
  });

  const convertToInvoiceMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/quotes/${params?.id}/convert-to-invoice`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes", params?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice created",
        description: "Quote has been converted to invoice successfully.",
      });
    },
  });

  const downloadPdfMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/quotes/${params?.id}/pdf`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to download PDF");
      const blob = await response.blob();

      // PRIORITY 1: Extract filename from Content-Disposition header (most reliable)
      let filename = `Quote-${quote?.quoteNumber || "document"}.pdf`;
      const contentDisposition = response.headers.get("Content-Disposition") || "";

      console.log("[PDF Download] Raw Content-Disposition header:", contentDisposition);
      console.log("[PDF Download] Quote object:", quote);
      console.log("[PDF Download] Quote number:", quote?.quoteNumber);

      if (contentDisposition) {
        // Try RFC 5987 format first (filename*)
        const rfc5987Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
        if (rfc5987Match && rfc5987Match[1]) {
          try {
            filename = decodeURIComponent(rfc5987Match[1]);
            console.log("Using RFC 5987 filename:", filename);
          } catch (e) {
            console.log("RFC 5987 decode failed, trying standard format");
          }
        }

        // Fall back to standard format (filename=)
        if (filename === `Quote-${quote?.quoteNumber || "document"}.pdf`) {
          const standardMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (standardMatch && standardMatch[1]) {
            filename = standardMatch[1];
            console.log("Using standard filename:", filename);
          }
        }
      }

      console.log("Final filename for download:", filename);

      // Create download link with explicit blob type
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;  // Set download attribute
      link.style.display = "none";
      link.setAttribute("download", filename);  // Explicit attribute

      // Append to DOM, click, and cleanup
      document.body.appendChild(link);
      link.click();

      // Cleanup with delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quote PDF downloaded successfully.",
      });
      setIsDownloading(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to download quote PDF.",
        variant: "destructive",
      });
      setIsDownloading(false);
    },
  });

  const emailQuoteMutation = useMutation({
    mutationFn: async () => {
      if (!emailData.email) throw new Error("Email is required");
      try {
        const response = await apiRequest("POST", `/api/quotes/${params?.id}/email`, {
          recipientEmail: emailData.email,
          message: emailData.message || "",
        });
        console.log("[Email Mutation] Success response:", response);
        return response;
      } catch (error) {
        console.error("[Email Mutation] Error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("[Email Toast] Showing success toast", data);
      toast({
        title: "Success",
        description: "Quote sent via email successfully.",
      });
      setShowEmailDialog(false);
      setEmailData({ email: "", message: "" });
    },
    onError: (error: any) => {
      console.error("[Email Error Handler]", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to send quote via email.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-muted text-muted-foreground";
      case "sent":
        return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
      case "approved":
        return "bg-success/10 text-success dark:bg-success/20 dark:text-success";
      case "rejected":
        return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
      case "invoiced":
        return "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent";
      case "closed_paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "closed_cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-12">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Quote not found</p>
              <Button onClick={() => setLocation("/quotes")} className="h-9 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quotes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <button
                  onClick={() => setLocation("/quotes")}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
              >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Quotes</span>
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                <Hash className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{quote.quoteNumber}</span>
              </span>
          </nav>


        {/* Header */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/quotes")}
            data-testid="button-back"
            className="h-8 w-8 shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                {quote.quoteNumber} <span className="text-slate-400 font-normal text-base">(v{quote.version})</span>
              </h1>
              <Badge className={`${getStatusColor(quote.status)} text-[10px] px-2 py-0.5`}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Created {new Date(quote.quoteDate).toLocaleDateString()}
              {quote.createdByName && ` • by ${quote.createdByName}`}
            </p>
          </div>
        </div>

        {/* Status Badge and Quick Actions Card */}
        <Card className="border-slate-200 dark:border-slate-800 border-l-4" style={{ borderLeftColor: quote.status === 'approved' ? 'rgb(34, 197, 94)' : quote.status === 'rejected' ? 'rgb(239, 68, 68)' : quote.status === 'invoiced' ? 'rgb(168, 85, 247)' : 'rgb(59, 130, 246)' }}>
          <CardContent className="p-3">
            <div className="flex flex-col gap-3">
              {/* Total Amount Display */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase mb-0.5">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{Number(quote.total).toLocaleString()}</p>
                </div>
                <Receipt className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-50" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quote.status !== "invoiced" && quote.status === "draft" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation(`/quotes/${params?.id}/edit`)}
                    data-testid="button-edit-quote"
                    className="flex-1 sm:flex-initial h-7 text-xs"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    <span className="hidden xs:inline">Edit</span>
                  </Button>
                )}
                {["draft", "sent", "approved", "rejected"].includes(quote.status) && (
                   <PermissionGuard resource="quotes" action="edit" tooltipText="Only authorized users can revise quotes">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reviseQuoteMutation.mutate()}
                        disabled={reviseQuoteMutation.isPending}
                        className="flex-1 sm:flex-initial h-7 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 dark:text-amber-400 dark:border-amber-800"
                      >
                         {reviseQuoteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <History className="h-3 w-3 mr-1" />}
                         Revise
                      </Button>
                   </PermissionGuard>
                )}
                {canClone && (
                  <PermissionGuard resource="quotes" action="create">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to clone this quote?")) {
                          cloneQuoteMutation.mutate();
                        }
                      }}
                      className="flex-1 sm:flex-initial h-7 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Clone</span>
                    </Button>
                  </PermissionGuard>
                )}
                {canGeneratePDF && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsDownloading(true);
                      downloadPdfMutation.mutate();
                    }}
                    disabled={isDownloading}
                    data-testid="button-download-pdf"
                    className="flex-1 sm:flex-initial h-7 text-xs"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    <span className="hidden xs:inline">PDF</span>
                  </Button>
                )}
                {canSendEmail && (
                  <PermissionGuard resource="quotes" action="edit" tooltipText="Only authorized users can email quotes">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEmailDialog(true)}
                      data-testid="button-email-quote"
                      className="flex-1 sm:flex-initial h-7 text-xs"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Email</span>
                    </Button>
                  </PermissionGuard>
                )}
                {canSendQuote && quote.status === "draft" && (
                  <PermissionGuard resource="quotes" action="create" tooltipText="Only authorized users can send quotes">
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate("sent")}
                      data-testid="button-send-quote"
                      className="flex-1 sm:flex-initial h-7 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </Button>
                  </PermissionGuard>
                )}
                {quote.status === "sent" && (
                  <>
                    <PermissionGuard resource="quotes" action="approve" tooltipText="Only Sales Managers can approve quotes">
                      <Button
                        size="sm"
                        onClick={() => updateStatusMutation.mutate("approved")}
                        data-testid="button-approve-quote"
                        className="flex-1 sm:flex-initial h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard resource="quotes" action="cancel" tooltipText="Only Sales Managers can reject quotes">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatusMutation.mutate("rejected")}
                        data-testid="button-reject-quote"
                        className="flex-1 sm:flex-initial h-7 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </PermissionGuard>
                  </>
                )}

                {/* Always show View buttons if linked items exist */}
                
                {/* View Sales Order */}
                {hasSalesOrder && salesOrder && (
                  <Button
                    size="sm"
                    variant="outline" // Changed to outline to differentiate from primary actions
                    onClick={() => setLocation(`/sales-orders/${salesOrder.id}`)}
                    className="flex-1 sm:flex-initial h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <Package className="h-3 w-3 mr-1" />
                    View Order
                  </Button>
                )}

                {/* View Invoices */}
                {hasInvoices && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (invoices && invoices.length === 1) {
                         setLocation(`/invoices/${invoices[0].id}`);
                      } else {
                         // If multiple, maybe go to invoices list with filter? or just the first one?
                         // For now, let's go to the first one or a list. 
                         // Given the UI usually links to detail, let's go to the first one.
                         // Or ideally, open a dialog to choose.
                         // But simplify: go to first one.
                         setLocation(`/invoices/${invoices![0].id}`);
                      }
                    }}
                    className="flex-1 sm:flex-initial h-7 text-xs border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  >
                    <Receipt className="h-3 w-3 mr-1" />
                    View Invoice{invoices!.length > 1 ? 's' : ''}
                  </Button>
                )}

                {/* View Vendor POs */}
                {hasVendorPos && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                         // Similar logic, go to first one
                         setLocation(`/vendor-pos/${vendorPos![0].id}`);
                    }}
                    className="flex-1 sm:flex-initial h-7 text-xs border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
                  >
                    <Package className="h-3 w-3 mr-1" />
                    View Vendor PO{vendorPos!.length > 1 ? 's' : ''}
                  </Button>
                )}

                {/* Actions available only when Approved */}
                {quote.status === "approved" && (
                  <>
                    {/* Only show Invoice button if NO sales order exists AND NO existing invoices */}
                    {canConvertToInvoice && !hasSalesOrder && !hasInvoices && (
                      <Button
                        size="sm"
                        onClick={() => convertToInvoiceMutation.mutate()}
                        data-testid="button-convert-to-invoice"
                        className="flex-1 sm:flex-initial h-7 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                      >
                        <Receipt className="h-3 w-3 mr-1" />
                        Invoice
                      </Button>
                    )}
                    
                    {/* Show Create Sales Order button if NO sales order exists */}
                    {!hasSalesOrder && (
                      <PermissionGuard resource="sales-orders" action="create" tooltipText="Only authorized users can create Sales Orders">
                        <Button
                          size="sm"
                          onClick={() => createSalesOrderMutation.mutate()}
                          disabled={createSalesOrderMutation.isPending}
                          className="flex-1 sm:flex-initial h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        >
                           {createSalesOrderMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Package className="h-3 w-3 mr-1" />}
                           Create Order
                        </Button>
                      </PermissionGuard>
                    )}
                    
                    {canCreateVendorPO && user && hasPermission(user.role, "vendor-pos", "create") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowVendorPoDialog(true)}
                        data-testid="button-create-vendor-po"
                        className="flex-1 sm:flex-initial h-7 text-xs"
                      >
                        <Package className="h-3 w-3 mr-1" />
                        Vendor PO
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {/* Client Information Card */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <CardTitle className="text-sm font-bold">Client Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Company Name */}
                  <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 mb-1">
                      <User className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Company</p>
                    </div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white break-words">{quote.client.name}</p>
                  </div>

                  {/* Email */}
                  <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Mail className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Email</p>
                    </div>
                    <p className="text-xs text-slate-900 dark:text-white break-all">{quote.client.email}</p>
                  </div>

                  {/* Phone */}
                  {quote.client.phone && (
                    <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Phone className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Phone</p>
                      </div>
                      <p className="text-xs text-slate-900 dark:text-white">{quote.client.phone}</p>
                    </div>
                  )}

                  {/* GSTIN */}
                  {quote.client.gstin && (
                    <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Hash className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">GSTIN</p>
                      </div>
                      <p className="font-mono text-xs text-slate-900 dark:text-white break-all">{quote.client.gstin}</p>
                    </div>
                  )}

                  {/* Billing Address */}
                  {quote.client.billingAddress && (
                    <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sm:col-span-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Billing Address</p>
                      </div>
                      <p className="text-xs text-slate-900 dark:text-white whitespace-pre-line break-words">{quote.client.billingAddress}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Line Items Card */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <CardTitle className="text-sm font-bold">Line Items</CardTitle>
                  </div>
                  <Badge className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-[10px] px-2 py-0.5">
                    {quote.items.length} {quote.items.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {quote.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 transition-colors"
                    >
                      {/* Item Number Badge */}
                      <div className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pl-4 sm:pl-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white break-words mb-1.5">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Qty:</span>
                              <span className="font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Unit:</span>
                              <span className="font-bold">₹{Number(item.unitPrice).toLocaleString()}</span>
                            </span>
                            {item.hsnSac && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">HSN/SAC:</span>
                                <span className="font-mono font-bold bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-900 dark:text-white">{item.hsnSac}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5 uppercase font-semibold">Subtotal</p>
                          <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">₹{Number(item.subtotal).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes Section */}
            {quote.notes && (
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <CardTitle className="text-sm font-bold">Notes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900 border-l-4 border-amber-500">
                    <p className="text-xs text-slate-900 dark:text-white whitespace-pre-line break-words leading-relaxed">{quote.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Terms & Conditions Section */}
            {quote.termsAndConditions && (
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <CardTitle className="text-sm font-bold">Terms & Conditions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900 border-l-4 border-purple-500">
                    <p className="text-xs text-slate-900 dark:text-white whitespace-pre-line break-words leading-relaxed">{quote.termsAndConditions}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advanced Sections Display */}
            <AdvancedSectionsDisplay
              bomData={quote.bomSection ? JSON.parse(quote.bomSection) : undefined}
              slaData={quote.slaSection ? JSON.parse(quote.slaSection) : undefined}
              timelineData={quote.timelineSection ? JSON.parse(quote.timelineSection) : undefined}
            />
          </div>

          {/* Quote Summary Sidebar */}
          <div className="lg:sticky lg:top-6 space-y-3">
             {/* Versions History */}
             {versions && versions.length > 0 && (
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center shrink-0">
                                <History className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <CardTitle className="text-sm font-bold">Version History</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[200px] overflow-y-auto">
                            {versions.map((version: any) => (
                                <div key={version.id} className="p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-between group">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Version {version.version}</p>
                                        <p className="text-[10px] text-slate-500">{new Date(version.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="ghost" size="sm" className="h-6 w-16 text-[10px]" onClick={() => setViewingVersionNumber(version.version)}>
                                          View
                                      </Button>
                                      <Button variant="outline" size="sm" className="h-6 px-2 text-[10px]" onClick={() => {
                                        console.log("Comparing version:", version.version);
                                        setComparingVersionNumber(version.version);
                                      }}>
                                          Compare
                                      </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
             )}

             <VersionComparisonDialog
                isOpen={!!comparingVersionNumber}
                onOpenChange={(open) => !open && setComparingVersionNumber(null)}
                currentQuote={quote!}
                versionNumber={comparingVersionNumber}
                quoteId={params?.id || ""}
             />
             <QuoteVersionViewer
                isOpen={!!viewingVersionNumber}
                onOpenChange={(open) => !open && setViewingVersionNumber(null)}
                quoteId={params?.id || ""}
                versionNumber={viewingVersionNumber}
             />
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                    <Receipt className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <CardTitle className="text-sm font-bold">Quote Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {/* Prepared By */}
                {quote.createdByName && (
                  <div className="p-2.5 rounded-md bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500">
                    <div className="flex items-center gap-1.5 mb-1">
                      <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">Prepared By</p>
                    </div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white break-words">{quote.createdByName}</p>
                  </div>
                )}

                {/* Reference Number */}
                {quote.referenceNumber && (
                  <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950 border-l-4 border-emerald-500">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Hash className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Reference</p>
                    </div>
                    <p className="font-mono text-xs text-slate-900 dark:text-white break-words">{quote.referenceNumber}</p>
                  </div>
                )}

                {/* Attention To */}
                {quote.attentionTo && (
                  <div className="p-2.5 rounded-md bg-purple-50 dark:bg-purple-950 border-l-4 border-purple-500">
                    <div className="flex items-center gap-1.5 mb-1">
                      <User className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase">Attention To</p>
                    </div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white break-words">{quote.attentionTo}</p>
                  </div>
                )}

                {/* Validity Days */}
                <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">Valid For</p>
                  </div>
                  <p className="font-bold text-base text-amber-600 dark:text-amber-400">{quote.validityDays} days</p>
                </div>

                {/* Financial Summary */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Financial Summary</p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                      <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{Number(quote.subtotal).toLocaleString()}</span>
                    </div>

                    {Number(quote.discount) > 0 && (
                      <div className="flex justify-between items-center text-xs p-1.5 rounded bg-rose-50 dark:bg-rose-950">
                        <span className="text-slate-600 dark:text-slate-400">Discount</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">-₹{Number(quote.discount).toLocaleString()}</span>
                      </div>
                    )}

                    {Number(quote.cgst) > 0 && (
                      <div className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                        <span className="text-slate-600 dark:text-slate-400">CGST</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹{Number(quote.cgst).toLocaleString()}</span>
                      </div>
                    )}

                    {Number(quote.sgst) > 0 && (
                      <div className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                        <span className="text-slate-600 dark:text-slate-400">SGST</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹{Number(quote.sgst).toLocaleString()}</span>
                      </div>
                    )}

                    {Number(quote.igst) > 0 && (
                      <div className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                        <span className="text-slate-600 dark:text-slate-400">IGST</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹{Number(quote.igst).toLocaleString()}</span>
                      </div>
                    )}

                    {Number(quote.shippingCharges) > 0 && (
                      <div className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                        <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹{Number(quote.shippingCharges).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 mt-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Total</span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{Number(quote.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Email Quote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Recipient Email</label>
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={emailData.email}
                  onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                  data-testid="input-email-recipient"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message (Optional)</label>
                <Textarea
                  placeholder="Add a message to include with the quote..."
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  data-testid="textarea-email-message"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEmailDialog(false)}
                data-testid="button-email-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={() => emailQuoteMutation.mutate()}
                disabled={!emailData.email || emailQuoteMutation.isPending}
                data-testid="button-email-send"
              >
                {emailQuoteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Email"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Vendor PO Dialog */}
        {quote && (
          <CreateVendorPoDialog
            quoteId={quote.id}
            quoteNumber={quote.quoteNumber}
            open={showVendorPoDialog}
            onOpenChange={setShowVendorPoDialog}
          />
        )}
      </div>
    </div>
  );
}

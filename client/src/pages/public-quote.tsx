import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, XCircle, MessageSquare, Send, FileText, User, Calendar, DollarSign, Clock, Building2, Receipt, Home, ChevronRight, Hash } from "lucide-react";
import { format } from "date-fns";
import { Quote, QuoteItem, QuoteComment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox as CheckboxUI } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type PublicQuoteData = Quote & {
  items: (QuoteItem & { isOptional?: boolean; isSelected?: boolean })[];
  client: {
    name: string;
    email: string;
    billingAddress: string;
    gstin: string;
    phone: string;
  };
  sender: {
    name: string;
    email: string;
  };
};

export default function PublicQuote() {
  const [, params] = useRoute("/p/quote/:token");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  
  // Comment state
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentMessage, setCommentMessage] = useState("");

  // Track local item selections for optimistic updates
  const [localSelections, setLocalSelections] = useState<Record<string, boolean>>({});

  const { data: quote, isLoading, error } = useQuery<PublicQuoteData>({
    queryKey: ["/api/quotes/public", params?.token],
    queryFn: async () => {
      const res = await fetch(`/api/quotes/public/${params?.token}`);
      if (!res.ok) {
        if (res.status === 410) throw new Error("This quote link has expired.");
        if (res.status === 404) throw new Error("Quote not found.");
        throw new Error("Failed to load quote.");
      }
      return res.json();
    },
    enabled: !!params?.token,
  });

  // Fetch comments
  const { data: comments = [] } = useQuery<QuoteComment[]>({
    queryKey: ["/api/quotes/public/comments", params?.token],
    queryFn: async () => {
      const res = await fetch(`/api/quotes/public/${params?.token}/comments`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!params?.token,
  });

  // Accept mutation with signature
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quotes/public/${params?.token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to accept quote");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/public", params?.token] });
      toast({
        title: "Quote Accepted",
        description: "Thank you. The quote has been accepted.",
      });
      setIsAcceptDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quotes/public/${params?.token}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to reject quote");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/public", params?.token] });
      toast({
        title: "Quote Rejected",
        description: "The quote has been rejected.",
      });
      setIsRejectDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quotes/public/${params?.token}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: commentName,
          authorEmail: commentEmail,
          message: commentMessage,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add comment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/public/comments", params?.token] });
      toast({
        title: "Comment Added",
        description: "Your question has been submitted.",
      });
      setCommentMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Optional item selection mutation
  const selectItemMutation = useMutation({
    mutationFn: async (selections: { itemId: string; isSelected: boolean }[]) => {
      const res = await fetch(`/api/quotes/public/${params?.token}/select-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update selections");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/public", params?.token] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate totals based on selected items
  const { displaySubtotal, displayTotal } = useMemo(() => {
    if (!quote) return { displaySubtotal: 0, displayTotal: 0 };

    const items = quote.items.map(item => ({
      ...item,
      isSelected: localSelections[item.id] !== undefined ? localSelections[item.id] : (item.isSelected ?? true)
    }));

    const selectedItems = items.filter(i => i.isSelected);
    const subtotal = selectedItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    
    const discount = Number(quote.discount) || 0;
    const cgst = Number(quote.cgst) || 0;
    const sgst = Number(quote.sgst) || 0;
    const igst = Number(quote.igst) || 0;
    const shippingCharges = Number(quote.shippingCharges) || 0;
    const total = subtotal - discount + cgst + sgst + igst + shippingCharges;

    return { displaySubtotal: subtotal, displayTotal: total };
  }, [quote, localSelections]);

  const handleItemToggle = (itemId: string, currentSelected: boolean) => {
    const newSelected = !currentSelected;
    setLocalSelections(prev => ({ ...prev, [itemId]: newSelected }));
    selectItemMutation.mutate([{ itemId, isSelected: newSelected }]);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', { 
      style: 'currency', 
      currency: quote?.currency || 'INR' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success/10 text-success dark:bg-success/20 dark:text-success";
      case "rejected":
        return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
      case "sent":
        return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 opacity-60" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Unable to Load Quote</h3>
              <p className="text-sm text-muted-foreground">{(error as Error)?.message || "The link may be invalid or expired."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isPending = quote.status === "sent" || quote.status === "draft";
  const hasOptionalItems = quote.items.some(item => item.isOptional);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Home className="h-3.5 w-3.5" />
            <span>Quote</span>
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
            <Hash className="h-3.5 w-3.5" />
            <span className="truncate max-w-[200px]">{quote.quoteNumber}</span>
          </span>
        </nav>

        {/* HEADER */}
        <Card className="border border-border/70 bg-card/95 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                      {quote.quoteNumber}
                    </h1>
                    <Badge className={cn("px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs", getStatusColor(quote.status))}>
                      <span className="capitalize">{quote.status}</span>
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
                    <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(quote.quoteDate), "MMM d, yyyy")}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                      <Clock className="h-3 w-3" />
                      <span>Valid until: {quote.validUntil ? format(new Date(quote.validUntil), "MMM d, yyyy") : "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Amount Display */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase mb-0.5">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(displayTotal)}</p>
                </div>
                <Receipt className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-50" />
              </div>
            </div>

            {/* Actions (Only if pending) */}
            {isPending && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                {/* Accept Dialog */}
                <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Accept Quote</span>
                      <span className="sm:hidden">Accept</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Accept Quote</DialogTitle>
                      <DialogDescription>Confirm your acceptance by entering your name below.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <Label htmlFor="clientName">Your Full Name *</Label>
                        <Input 
                          id="clientName" 
                          placeholder="Enter your full name" 
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          Total Amount: {formatCurrency(displayTotal)}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsAcceptDialogOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => acceptMutation.mutate()}
                        disabled={!clientName || acceptMutation.isPending}
                      >
                        {acceptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm Acceptance"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Reject Dialog */}
                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm text-destructive border-destructive/30 hover:bg-destructive/10">
                      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4"/>
                      <span className="hidden sm:inline">Reject Quote</span>
                      <span className="sm:hidden">Reject</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Quote</DialogTitle>
                      <DialogDescription>Please tell us why you are rejecting this quote.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="reason">Reason for Rejection</Label>
                      <Textarea 
                        id="reason" 
                        placeholder="e.g., Price is too high, specs incorrect..." 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => rejectMutation.mutate()}
                        disabled={!rejectReason || rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm Rejection"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* From Card */}
          <Card className="border border-border/70 bg-card/95 backdrop-blur-sm shadow-sm">
            <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base sm:text-lg font-semibold text-foreground">{quote.sender.name}</p>
                  <p className="text-sm text-muted-foreground">{quote.sender.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill To Card */}
          <Card className="border border-border/70 bg-card/95 backdrop-blur-sm shadow-sm">
            <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bill To</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base sm:text-lg font-semibold text-foreground">{quote.client.name}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-2">{quote.client.billingAddress}</p>
                  {quote.client.gstin && <p className="text-xs text-muted-foreground mt-1">GSTIN: {quote.client.gstin}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table Card */}
        <Card className="border border-border/70 bg-card/95 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold">Quote Items</CardTitle>
            {hasOptionalItems && isPending && (
              <CardDescription className="text-xs">Toggle optional items to adjust your total.</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {hasOptionalItems && isPending && <TableHead className="w-[60px] text-xs">Include</TableHead>}
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-right text-xs w-[60px]">Qty</TableHead>
                    <TableHead className="text-right text-xs">Unit Price</TableHead>
                    <TableHead className="text-right text-xs">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items.map((item) => {
                    const isSelected = localSelections[item.id] !== undefined 
                      ? localSelections[item.id] 
                      : (item.isSelected ?? true);
                    
                    return (
                      <TableRow key={item.id} className={cn("transition-opacity", !isSelected && "opacity-50 bg-muted/30")}>
                        {hasOptionalItems && isPending && (
                          <TableCell className="p-2 sm:p-4">
                            {item.isOptional ? (
                              <CheckboxUI
                                checked={isSelected}
                                onCheckedChange={() => handleItemToggle(item.id, isSelected)}
                                disabled={selectItemMutation.isPending}
                              />
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Req'd</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="p-2 sm:p-4">
                          <div className="font-medium text-foreground text-sm">{item.description}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.hsnSac && <span className="text-[10px] text-muted-foreground">HSN: {item.hsnSac}</span>}
                            {item.isOptional && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Optional</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm p-2 sm:p-4">{item.quantity}</TableCell>
                        <TableCell className="text-right text-sm p-2 sm:p-4">{formatCurrency(Number(item.unitPrice))}</TableCell>
                        <TableCell className="text-right text-sm font-medium p-2 sm:p-4">{formatCurrency(Number(item.subtotal))}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Totals Section */}
            <div className="p-4 sm:p-5 border-t border-border/50">
              <div className="flex justify-end">
                <div className="w-full sm:w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(displaySubtotal)}</span>
                  </div>
                  {Number(quote.discount) > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount</span>
                      <span className="font-medium">-{formatCurrency(Number(quote.discount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(Number(quote.cgst) + Number(quote.sgst) + Number(quote.igst))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatCurrency(Number(quote.shippingCharges))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">Total</span>
                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(displayTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        {quote.termsAndConditions && (
          <Card className="border border-border/70 bg-card/95 backdrop-blur-sm shadow-sm">
            <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{quote.termsAndConditions}</div>
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        <Card className="border border-border/70 bg-card/95 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm sm:text-base font-semibold">Questions & Comments</CardTitle>
            </div>
            <CardDescription className="text-xs">Have a question about this quote? Leave a comment below.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
            {/* Existing Comments */}
            {comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{comment.authorName}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {comment.authorType === "client" ? "You" : "Staff"}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Form */}
            {isPending && (
              <div className="border-t border-border/50 pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="commentName" className="text-xs">Your Name *</Label>
                    <Input
                      id="commentName"
                      placeholder="Enter your name"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commentEmail" className="text-xs">Email (optional)</Label>
                    <Input
                      id="commentEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="commentMessage" className="text-xs">Your Question or Comment *</Label>
                  <Textarea
                    id="commentMessage"
                    placeholder="Type your question or comment here..."
                    value={commentMessage}
                    onChange={(e) => setCommentMessage(e.target.value)}
                    className="mt-1 text-sm"
                    rows={3}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => addCommentMutation.mutate()}
                  disabled={!commentName || !commentMessage || addCommentMutation.isPending}
                  className="gap-2"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send Comment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

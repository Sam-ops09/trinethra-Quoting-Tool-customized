import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, XCircle, FileText, Download, Mail } from "lucide-react";
import { format } from "date-fns";
import { Quote, QuoteItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PublicQuoteData = Quote & {
  items: QuoteItem[];
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

  const actionMutation = useMutation({
    mutationFn: async ({ action, reason }: { action: "approve" | "reject"; reason?: string }) => {
      const res = await fetch(`/api/quotes/public/${params?.token}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${action} quote`);
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/public", params?.token] });
      toast({
        title: variables.action === "approve" ? "Quote Approved" : "Quote Rejected",
        description: `Thank you. The quote has been ${variables.action}d.`,
      });
      if (variables.action === "reject") setIsRejectDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold text-slate-900">Unable to load quote</h1>
        <p className="text-slate-500">{(error as Error)?.message || "The link may be invalid or expired."}</p>
      </div>
    );
  }

  const isPending = quote.status === "sent" || quote.status === "draft";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quote {quote.quoteNumber}</h1>
                <p className="text-slate-500 mt-1">
                    Created on {format(new Date(quote.quoteDate), "MMMM d, yyyy")} • Valid until {quote.validUntil ? format(new Date(quote.validUntil), "MMMM d, yyyy") : 'N/A'}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={quote.status === "approved" ? "default" : quote.status === "rejected" ? "destructive" : "secondary"} className="text-lg px-4 py-1 capitalize">
                    {quote.status}
                </Badge>
            </div>
        </div>

        {/* Actions Card (Only if pending) */}
        {isPending && (
            <Card className="border-primary/20 shadow-md bg-white">
                <CardHeader>
                    <CardTitle className="text-lg">Review Quote</CardTitle>
                    <CardDescription>Please review the quote details below and take action.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Button 
                        size="lg" 
                        className="w-full md:w-auto gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => actionMutation.mutate({ action: "approve" })}
                        disabled={actionMutation.isPending}
                    >
                        {actionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle2 className="h-4 w-4"/>}
                        Approve Quote
                    </Button>
                    
                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                        <DialogTrigger asChild>
                             <Button variant="outline" size="lg" className="w-full md:w-auto gap-2 text-destructive border-destructive hover:bg-destructive/10">
                                <XCircle className="h-4 w-4"/>
                                Reject Quote
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject Quote</DialogTitle>
                                <DialogDescription>
                                    Please tell us why you are rejecting this quote so we can improve it.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Label htmlFor="reason">Reason for Rejection</Label>
                                <Textarea 
                                    id="reason" 
                                    placeholder="e.g., Price is too high, specs incorrect..." 
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={() => actionMutation.mutate({ action: "reject", reason: rejectReason })}
                                    disabled={!rejectReason || actionMutation.isPending}
                                >
                                    {actionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm Rejection"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">From</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="font-semibold text-lg">{quote.sender.name}</div>
                    <div className="text-slate-600">{quote.sender.email}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Bill To</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="font-semibold text-lg">{quote.client.name}</div>
                    <div className="text-slate-600 whitespace-pre-line">{quote.client.billingAddress}</div>
                    {quote.client.gstin && <div className="mt-2 text-sm text-slate-500">GSTIN: {quote.client.gstin}</div>}
                </CardContent>
            </Card>
        </div>

        {/* Items Table */}
        <Card>
            <CardHeader>
                <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Description</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quote.items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="font-medium">{item.description}</div>
                                    {item.hsnSac && <div className="text-xs text-slate-500">HSN/SAC: {item.hsnSac}</div>}
                                </TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{Number(item.unitPrice).toLocaleString('en-IN', { style: 'currency', currency: quote.currency || 'INR' })}</TableCell>
                                <TableCell className="text-right">{Number(item.subtotal).toLocaleString('en-IN', { style: 'currency', currency: quote.currency || 'INR' })}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                <Separator className="my-6" />

                <div className="flex justify-end">
                    <div className="w-full md:w-1/3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span>{Number(quote.subtotal).toLocaleString('en-IN', { style: 'currency', currency: quote.currency || 'INR' })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Tax</span>
                            <span>{(Number(quote.cgst) + Number(quote.sgst) + Number(quote.igst)).toLocaleString('en-IN', { style: 'currency', currency: quote.currency || 'INR' })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Shipping</span>
                            <span>{Number(quote.shippingCharges).toLocaleString('en-IN', { style: 'currency', currency: quote.currency || 'INR' })}</span>
                        </div>
                         {Number(quote.discount) > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span>-{Number(quote.discount).toLocaleString('en-IN', { style: 'currency', currency: quote.currency || 'INR' })}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{Number(quote.total).toLocaleString('en-IN', { style: 'currency', currency: quote.currency || 'INR' })}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Terms */}
         {quote.termsAndConditions && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="whitespace-pre-wrap text-sm text-slate-600">{quote.termsAndConditions}</div>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

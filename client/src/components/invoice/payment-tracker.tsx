import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PermissionGuard } from "@/components/permission-guard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Trash2,
    Loader2,
    CreditCard,
    Calendar,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    DollarSign
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PaymentHistoryEntry {
    id: string;
    amount: string;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
    paymentDate: string;
    recordedBy: string;
    recordedByName?: string;
}

interface PaymentTrackerProps {
    invoiceId: string;
    total: number;
    paidAmount: number;
    paymentStatus: string;
    parentInvoiceId?: string | null;
    isMaster?: boolean;
    onUpdate?: () => void;
}

export function PaymentTracker({
                                   invoiceId,
                                   total,
                                   paidAmount,
                                   paymentStatus,
                                   parentInvoiceId,
                                   isMaster,
                                   onUpdate
                               }: PaymentTrackerProps) {
    const { toast } = useToast();
    const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
    const [newPayment, setNewPayment] = useState({
        amount: "",
        paymentMethod: "",
        transactionId: "",
        notes: "",
        paymentDate: new Date().toISOString().split("T")[0]
    });

    const { data: paymentHistory, isLoading } = useQuery<PaymentHistoryEntry[]>({
        queryKey: [`/api/invoices/${invoiceId}/payment-history-detailed`],
        enabled: !!invoiceId
    });

    const addPaymentMutation = useMutation({
        mutationFn: async (payment: typeof newPayment) => {
            return await apiRequest("POST", `/api/invoices/${invoiceId}/payment`, payment);
        },
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: [`/api/invoices/${invoiceId}/payment-history-detailed`]
            });
            queryClient.refetchQueries({ queryKey: ["/api/invoices", invoiceId] });
            queryClient.refetchQueries({ queryKey: ["/api/invoices"] });

            if (parentInvoiceId) {
                queryClient.refetchQueries({ queryKey: ["/api/invoices", parentInvoiceId] });
                queryClient.refetchQueries({
                    queryKey: [`/api/invoices/${parentInvoiceId}/payment-history-detailed`]
                });
            }

            toast({
                title: "Success",
                description: "Payment recorded successfully."
            });
            setShowAddPaymentDialog(false);
            setNewPayment({
                amount: "",
                paymentMethod: "",
                transactionId: "",
                notes: "",
                paymentDate: new Date().toISOString().split("T")[0]
            });
            onUpdate?.();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to record payment.",
                variant: "destructive"
            });
        }
    });

    const deletePaymentMutation = useMutation({
        mutationFn: async (paymentId: string) => {
            return await apiRequest("DELETE", `/api/payment-history/${paymentId}`);
        },
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: [`/api/invoices/${invoiceId}/payment-history-detailed`]
            });
            queryClient.refetchQueries({ queryKey: ["/api/invoices", invoiceId] });
            queryClient.refetchQueries({ queryKey: ["/api/invoices"] });

            if (parentInvoiceId) {
                queryClient.refetchQueries({ queryKey: ["/api/invoices", parentInvoiceId] });
                queryClient.refetchQueries({
                    queryKey: [`/api/invoices/${parentInvoiceId}/payment-history-detailed`]
                });
            }

            toast({
                title: "Success",
                description: "Payment deleted successfully."
            });
            onUpdate?.();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete payment.",
                variant: "destructive"
            });
        }
    });

    const handleAddPayment = () => {
        if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
            toast({
                title: "Error",
                description: "Please enter a valid payment amount.",
                variant: "destructive"
            });
            return;
        }

        if (!newPayment.paymentMethod) {
            toast({
                title: "Error",
                description: "Please select a payment method.",
                variant: "destructive"
            });
            return;
        }

        const amount = parseFloat(newPayment.amount);
        const currentPaid = parseFloat(paidAmount.toString());

        if (currentPaid + amount > total) {
            toast({
                title: "Warning",
                description: "Payment amount exceeds outstanding balance. Proceeding anyway."
            });
        }

        addPaymentMutation.mutate(newPayment);
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            bank_transfer: "Bank Transfer",
            credit_card: "Credit Card",
            debit_card: "Debit Card",
            check: "Check",
            cash: "Cash",
            upi: "UPI",
            other: "Other"
        };
        return labels[method] || method;
    };

    const outstanding = total - paidAmount;
    const percentPaid = (paidAmount / total) * 100;
    const isFullyPaid = outstanding <= 0;

    return (
        <Card className="card-elegant shadow-elegant overflow-hidden h-full">
            {/* HEADER */}
            <CardHeader className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border-b border-border/50 px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-1 min-w-0 items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-elegant-sm">
                            <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="truncate text-sm font-semibold sm:text-base">
                                Payment Tracking
                            </CardTitle>
                            <p className="text-[10px] font-['Open_Sans'] text-muted-foreground sm:text-xs">
                                {isMaster ? "Aggregated from child invoices" : "Monitor payments"}
                            </p>
                        </div>
                    </div>

                    <PermissionGuard resource="payments" action="create" tooltipText="Only Finance/Accounts can record payments">
                          <Button
                            size="sm"
                            className="btn-classy shadow-elegant h-8 shrink-0 px-2.5 text-[11px] sm:px-3 sm:text-xs"
                            onClick={() => setShowAddPaymentDialog(true)}
                            data-testid="button-add-payment"
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            <span className="hidden sm:inline">Record</span>
                            <span className="sm:hidden">Add</span>
                          </Button>
                        </PermissionGuard>
                </div>
            </CardHeader>

            {/* BODY */}
            <CardContent className="space-y-3 px-3 py-3 sm:px-4 sm:py-4 md:space-y-4">
                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="card-elegant hover-glow rounded-lg border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-2.5 sm:p-3">
                        <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total
              </span>
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                <DollarSign className="h-3.5 w-3.5 text-primary" />
                            </div>
                        </div>
                        <span className="block text-base font-bold text-primary sm:text-lg">
              ₹{total.toLocaleString()}
            </span>
                    </div>

                    <div className="card-elegant hover-glow rounded-lg border-success/20 bg-gradient-to-br from-success/5 to-transparent p-2.5 sm:p-3">
                        <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Paid
              </span>
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-success/10">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            </div>
                        </div>
                        <span className="block text-base font-bold text-success sm:text-lg">
              ₹{paidAmount.toLocaleString()}
            </span>
                    </div>

                    <div className="card-elegant hover-glow rounded-lg border-warning/20 bg-gradient-to-br from-warning/5 to-transparent p-2.5 sm:p-3">
                        <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Due
              </span>
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-warning/10">
                                <AlertCircle className="h-3.5 w-3.5 text-warning" />
                            </div>
                        </div>
                        <span className="block text-base font-bold text-warning sm:text-lg">
              ₹{outstanding.toLocaleString()}
            </span>
                    </div>
                </div>

                {/* PROGRESS STRIP */}
                <div className="glass-effect rounded-lg border px-2.5 py-2.5 shadow-elegant-xs sm:px-3 sm:py-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10">
                <TrendingUp className="h-3 w-3 text-primary" />
              </div>
              <span>Progress</span>
            </span>
                        <Badge
                            className={`px-1.5 py-0.5 text-[9px] font-bold ${
                                isFullyPaid
                                    ? "border-success/30 bg-success/10 text-success"
                                    : "border-primary/30 bg-primary/10 text-primary"
                            }`}
                        >
                            {percentPaid.toFixed(0)}%
                        </Badge>
                    </div>

                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted shadow-inner">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${
                                isFullyPaid
                                    ? "bg-gradient-to-r from-success to-success/90"
                                    : "bg-gradient-to-r from-primary to-secondary"
                            }`}
                            style={{ width: `${Math.min(percentPaid, 100)}%` }}
                        />
                    </div>

                    {isFullyPaid && (
                        <div className="flex items-center justify-center gap-1 rounded bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Paid!</span>
                        </div>
                    )}
                </div>

                {/* HISTORY */}
                <div className="space-y-2">
                    <div className="mb-1 flex items-center justify-between gap-2">
                        <h4 className="flex items-center gap-1.5 text-xs font-semibold">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                                <Calendar className="h-3 w-3 text-primary" />
                            </div>
                            <span>{isMaster ? "Child Payments" : "History"}</span>
                        </h4>
                        {paymentHistory && paymentHistory.length > 0 && (
                            <Badge className="border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">
                                {paymentHistory.length}
                            </Badge>
                        )}
                    </div>

                    {/* Empty for master */}
                    {isMaster && paymentHistory && paymentHistory.length === 0 && (
                        <div className="glass-effect rounded-lg border border-dashed py-5 text-center sm:py-6">
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-foreground">
                                        No child payments yet
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                        Record payments on child invoices
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading ? (
                        <div className="glass-effect rounded-lg border py-6 text-center sm:py-8">
                            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
                            <p className="text-[10px] text-muted-foreground">Loading...</p>
                        </div>
                    ) : paymentHistory && paymentHistory.length > 0 ? (
                        // LIST
                        <div className="custom-scrollbar max-h-[220px] overflow-y-auto pr-1 sm:max-h-[260px] md:max-h-[300px]">
                            <div className="space-y-1.5">
                                {paymentHistory.map((payment, index) => (
                                    <div
                                        key={payment.id}
                                        className={`group relative rounded-lg p-2 transition-all duration-200 hover:-translate-y-0.5 sm:p-2.5 ${
                                            index === 0
                                                ? "border border-primary/30 bg-gradient-to-br from-primary/8 to-primary/3 shadow-elegant-xs"
                                                : "border border-border/50 bg-card hover:border-primary/20 hover:shadow-elegant-xs"
                                        }`}
                                    >
                                        {index === 0 && (
                                            <div className="absolute -top-1 -right-1 z-10">
                                                <Badge className="bg-success px-1.5 py-0 text-[8px] leading-tight text-white">
                                                    New
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-1.5">
                                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10">
                                                <DollarSign className="h-3.5 w-3.5 text-primary" />
                                            </div>

                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-bold text-primary">
                            ₹{parseFloat(payment.amount).toLocaleString()}
                          </span>
                                                    <Badge className="border-primary/30 bg-primary/10 px-1.5 py-0 text-[9px] text-primary">
                                                        {getPaymentMethodLabel(payment.paymentMethod)}
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                                                    <Calendar className="h-2.5 w-2.5" />
                                                    <span>
                            {new Date(payment.paymentDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "2-digit"
                            })}
                          </span>
                                                    {payment.recordedByName && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="truncate">{payment.recordedByName}</span>
                                                        </>
                                                    )}
                                                </div>

                                                {payment.transactionId && (
                                                    <div className="rounded bg-muted/50 px-1.5 py-0.5 text-[9px]">
                                                        <span className="text-muted-foreground">ID:</span>{" "}
                                                        <span className="font-mono">{payment.transactionId}</span>
                                                    </div>
                                                )}

                                                {payment.notes && (
                                                    <div className="rounded border-l-2 border-primary bg-primary/5 px-1.5 py-1 text-[10px] italic text-muted-foreground">
                                                        {payment.notes}
                                                    </div>
                                                )}
                                            </div>

                                            {!isMaster && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 shrink-0 rounded opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                                                    onClick={() => {
                                                        if (confirm("Delete this payment?")) {
                                                            deletePaymentMutation.mutate(payment.id);
                                                        }
                                                    }}
                                                    data-testid={`button-delete-payment-${payment.id}`}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : !isMaster ? (
                        <div className="glass-effect rounded-lg border border-dashed py-5 text-center sm:py-6">
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-foreground">
                                        No payments yet
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                        Click &quot;Record&quot; to start
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </CardContent>

            {/* DIALOG */}
            <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
                <DialogContent className="glass-effect shadow-elegant-2xl max-h-[90vh] w-[95vw] max-w-[600px] overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                    <DialogHeader className="border-b pb-3 sm:pb-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-elegant">
                                <CreditCard className="h-6 w-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <DialogTitle className="text-lg sm:text-xl md:text-2xl text-heading">
                                    Record Payment
                                </DialogTitle>
                                <p className="mt-1 text-xs font-['Open_Sans'] text-muted-foreground sm:text-sm">
                                    Add a new payment transaction to this invoice
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-3 space-y-4 sm:space-y-5">
                        {/* AMOUNT */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="payment-amount"
                                className="flex items-center gap-1.5 text-sm font-semibold"
                            >
                                Payment Amount <span className="text-destructive">*</span>
                            </Label>
                            <div className="card-elegant flex items-center gap-3 rounded-2xl border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 sm:px-5 sm:py-4">
                <span className="shrink-0 text-3xl font-bold text-primary sm:text-4xl">
                  ₹
                </span>
                                <Input
                                    id="payment-amount"
                                    type="number"
                                    placeholder="0.00"
                                    className="input-elegant flex-1 border-0 bg-transparent text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-3xl"
                                    value={newPayment.amount}
                                    onChange={(e) =>
                                        setNewPayment({ ...newPayment, amount: e.target.value })
                                    }
                                    min="0"
                                    step="0.01"
                                    data-testid="input-payment-amount"
                                />
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-['Open_Sans']">
                                <span className="text-muted-foreground">Outstanding Balance:</span>
                                <span className="text-sm font-bold text-warning">
                  ₹{outstanding.toLocaleString()}
                </span>
                            </div>
                        </div>

                        {/* METHOD & DATE */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="payment-method"
                                    className="flex items-center gap-1.5 text-sm font-semibold"
                                >
                                    Payment Method <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={newPayment.paymentMethod}
                                    onValueChange={(value) =>
                                        setNewPayment({ ...newPayment, paymentMethod: value })
                                    }
                                >
                                    <SelectTrigger
                                        id="payment-method"
                                        data-testid="select-payment-method"
                                        className="input-elegant h-11 shadow-elegant-xs sm:h-12"
                                    >
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank_transfer">
                                            <div className="flex items-center gap-2">
                                                <span>🏦</span> Bank Transfer
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="credit_card">
                                            <div className="flex items-center gap-2">
                                                <span>💳</span> Credit Card
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="debit_card">
                                            <div className="flex items-center gap-2">
                                                <span>💳</span> Debit Card
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="check">
                                            <div className="flex items-center gap-2">
                                                <span>📝</span> Check
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="cash">
                                            <div className="flex items-center gap-2">
                                                <span>💵</span> Cash
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="upi">
                                            <div className="flex items-center gap-2">
                                                <span>📱</span> UPI
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="other">
                                            <div className="flex items-center gap-2">
                                                <span>⚙️</span> Other
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment-date" className="text-sm font-semibold">
                                    Payment Date
                                </Label>
                                <Input
                                    id="payment-date"
                                    type="date"
                                    className="input-elegant h-11 shadow-elegant-xs sm:h-12"
                                    value={newPayment.paymentDate}
                                    onChange={(e) =>
                                        setNewPayment({ ...newPayment, paymentDate: e.target.value })
                                    }
                                    data-testid="input-payment-date"
                                />
                            </div>
                        </div>

                        {/* TXN ID */}
                        <div className="space-y-2">
                            <Label htmlFor="transaction-id" className="text-sm font-semibold">
                                Transaction ID / Reference
                            </Label>
                            <Input
                                id="transaction-id"
                                type="text"
                                placeholder="e.g., TXN123456789 (optional)"
                                className="input-elegant h-11 font-mono text-sm shadow-elegant-xs sm:h-12"
                                value={newPayment.transactionId}
                                onChange={(e) =>
                                    setNewPayment({ ...newPayment, transactionId: e.target.value })
                                }
                                data-testid="input-transaction-id"
                            />
                        </div>

                        {/* NOTES */}
                        <div className="space-y-2">
                            <Label htmlFor="payment-notes" className="text-sm font-semibold">
                                Additional Notes
                            </Label>
                            <Textarea
                                id="payment-notes"
                                placeholder="Add any additional notes about this payment (optional)..."
                                className="input-elegant min-h-[90px] resize-none text-sm font-['Open_Sans'] shadow-elegant-xs sm:min-h-[110px]"
                                value={newPayment.notes}
                                onChange={(e) =>
                                    setNewPayment({ ...newPayment, notes: e.target.value })
                                }
                                rows={4}
                                data-testid="textarea-payment-notes"
                            />
                            <p className="px-1 text-xs font-['Open_Sans'] text-muted-foreground">
                                Any relevant information about this transaction
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse gap-2 border-t pt-3 sm:flex-row sm:gap-3 sm:pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddPaymentDialog(false)}
                            data-testid="button-payment-cancel"
                            className="transition-elegant w-full sm:flex-1 sm:min-w-[140px] hover:shadow-elegant-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddPayment}
                            disabled={addPaymentMutation.isPending}
                            data-testid="button-payment-save"
                            className="btn-classy w-full sm:flex-1 sm:min-w-[160px] shadow-elegant-lg"
                        >
                            {addPaymentMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
                                    <span>Recording...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4 shrink-0" />
                                    <span>Record Payment</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
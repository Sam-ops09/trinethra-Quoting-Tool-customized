
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Loader2,
    ArrowLeft,
    Home,
    ChevronRight,
    Repeat,
    Edit,
    Ban,
    Calendar,
    CreditCard,
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    PauseCircle,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Subscription {
    id: string;
    subscriptionNumber: string;
    clientId: string;
    planName: string;
    status: string;
    billingCycle: string;
    startDate: string;
    nextBillingDate: string;
    amount: string;
    currency: string;
    autoRenew: boolean;
    itemsSnapshot: string;
    notes?: string;
    invoices?: {
        id: string;
        invoiceNumber: string;
        issueDate: string;
        status: string;
        total: string;
    }[];
     client?: {
        id: string;
        name: string;
    };
}


const STATUS_CONFIG: Record<string, {
    color: string;
    label: string;
    icon: any;
}> = {
    active: {
        color: "bg-emerald-50 text-emerald-600 border-emerald-200",
        label: "Active",
        icon: CheckCircle2,
    },
    paused: {
        color: "bg-amber-50 text-amber-600 border-amber-200",
        label: "Paused",
        icon: PauseCircle,
    },
    cancelled: {
        color: "bg-rose-50 text-rose-600 border-rose-200",
        label: "Cancelled",
        icon: XCircle,
    },
    expired: {
        color: "bg-slate-50 text-slate-600 border-slate-200",
        label: "Expired",
        icon: Clock,
    },
};

export default function SubscriptionDetail() {
    const [, setLocation] = useLocation();
    const [, params] = useRoute("/subscriptions/:id");
    const { toast } = useToast();
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    const { data: subscription, isLoading } = useQuery<Subscription>({
        queryKey: ["/api/subscriptions", params?.id],
        enabled: !!params?.id,
    });

    const cancelMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest("POST", `/api/subscriptions/${params?.id}/cancel`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/subscriptions", params?.id] });
            toast({ title: "Subscription cancelled successfully" });
            setCancelDialogOpen(false);
        },
        onError: (err: any) => {
            toast({ title: "Failed to cancel subscription", description: err.message, variant: "destructive" });
        }
    });

    if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;
    if (!subscription) return <div className="p-8 text-center text-red-500">Subscription not found</div>;

    const statusConfig = STATUS_CONFIG[subscription.status] || STATUS_CONFIG.expired;
    const StatusIcon = statusConfig.icon;
    const items = JSON.parse(subscription.itemsSnapshot || "[]");

    const formatCurrency = (val: string | number) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: subscription.currency }).format(Number(val));

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
                    <button onClick={() => setLocation("/")} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                        <Home className="h-3.5 w-3.5" /><span>Home</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <button onClick={() => setLocation("/subscriptions")} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                        <Repeat className="h-3.5 w-3.5" /><span>Subscriptions</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <span>{subscription.subscriptionNumber}</span>
                    </span>
                </nav>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{subscription.planName}</h1>
                            <Badge variant="outline" className={`${statusConfig.color} ml-2`}>
                                <StatusIcon className="h-3.5 w-3.5 mr-1" />
                                {statusConfig.label}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="font-mono">{subscription.subscriptionNumber}</span>
                            <span>•</span>
                            <span>{subscription.client?.name}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {subscription.status === 'active' && (
                            <>
                                <Button variant="outline" onClick={() => setLocation(`/subscriptions/${subscription.id}/edit`)}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Ban className="h-4 w-4 mr-2" /> Cancel Subscription
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Cancel Subscription?</DialogTitle>
                                            <DialogDescription>
                                                This will stop all future billing for this subscription. This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Active</Button>
                                            <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
                                                {cancelMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                Confirm Cancellation
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                        <Button variant="outline" onClick={() => setLocation("/subscriptions")}>
                            Back
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Subscription Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Billing Cycle</p>
                                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white capitalize">
                                        <Repeat className="h-4 w-4 text-primary" />
                                        {subscription.billingCycle}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Amount</p>
                                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                                        <CreditCard className="h-4 w-4 text-emerald-600" />
                                        {formatCurrency(subscription.amount)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Next Billing</p>
                                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        {subscription.status === 'active' ? format(new Date(subscription.nextBillingDate), "dd MMM yyyy") : "-"}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Start Date</p>
                                    <div className="font-medium text-slate-700 dark:text-slate-300">
                                        {format(new Date(subscription.startDate), "dd MMM yyyy")}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Invoices History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {subscription.invoices && subscription.invoices.length > 0 ? (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Invoice #</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Amount</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {subscription.invoices.map((inv: any) => (
                                                    <TableRow key={inv.id}>
                                                        <TableCell className="font-mono font-medium">{inv.invoiceNumber}</TableCell>
                                                        <TableCell>{format(new Date(inv.issueDate), "dd MMM yyyy")}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="uppercase text-[10px]">{inv.status}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">{formatCurrency(inv.total)}</TableCell>
                                                        <TableCell>
                                                            <Button size="sm" variant="ghost" onClick={() => setLocation(`/invoices/${inv.id}`)}>
                                                                <ArrowLeft className="h-3 w-3 rotate-180" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No invoices generated yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Included Items</CardTitle>
                                <CardDescription>Snapshot of items in this plan</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-start text-sm border-b last:border-0 pb-3 last:pb-0">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.description}</p>
                                            <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="font-medium">
                                            {formatCurrency(item.unitPrice * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2 flex justify-between font-bold text-sm">
                                    <span>Total</span>
                                    <span>{formatCurrency(subscription.amount)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {subscription.client && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Client Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            {subscription.client?.name.charAt(0)}
                                        </div>
                                        <div className="font-semibold">{subscription.client?.name}</div>
                                    </div>
                                    <Separator />
                                    <div className="text-muted-foreground">
                                        {/* Add more client details if needed */}
                                    </div>
                                    <Button variant="link" className="p-0 h-auto" onClick={() => setLocation(`/clients/${subscription.client?.id}`)}>
                                        View Client Profile
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
    Search,
    Package,
    User,
    FileText,
    Calendar,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    Layers,
    ShieldCheck,
    StickyNote,
    ChevronRight,
    Home,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// New UI building blocks (shadcn/ui)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";

interface SerialTraceabilityInfo {
    serialNumber: string;
    status: string;

    customer: { id: string; name: string; email: string };
    quote: { id: string; quoteNumber: string };

    invoice: {
        id: string;
        invoiceNumber: string;
        invoiceDate: string;
        isMaster: boolean;
        masterInvoiceId?: string;
    };

    invoiceItem: { id: string; description: string; quantity: number };

    product?: { id: string; name: string; sku: string };
    vendorPo?: { id: string; poNumber: string };
    warranty?: { startDate: string; endDate: string };
    location?: string;
    notes?: string;

    history: { action: string; user: string; timestamp: string }[];
}

export default function SerialNumberSearch() {
    const [query, setQuery] = React.useState("");
    const [term, setTerm] = React.useState("");
    const [, navigate] = useLocation();

    // Command palette state + search history
    const [cmdOpen, setCmdOpen] = React.useState(false);
    const [recent, setRecent] = React.useState<string[]>(() => {
        try {
            const raw = localStorage.getItem("serial_search_recent");
            return raw ? (JSON.parse(raw) as string[]) : [];
        } catch {
            return [];
        }
    });

    // Keyboard shortcut: ⌘K / Ctrl+K
    React.useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const isK = e.key.toLowerCase() === "k";
            if ((e.metaKey || e.ctrlKey) && isK) {
                e.preventDefault();
                setCmdOpen(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const pushRecent = React.useCallback((value: string) => {
        const v = value.trim();
        if (!v) return;

        setRecent((prev) => {
            const next = [v, ...prev.filter((x) => x !== v)].slice(0, 8);
            try {
                localStorage.setItem("serial_search_recent", JSON.stringify(next));
            } catch {
                // ignore storage failures
            }
            return next;
        });
    }, []);

    const { data, isLoading, error, isFetching } = useQuery<SerialTraceabilityInfo>({
        queryKey: ["/api/serial-numbers/search", term],
        queryFn: async () => {
            const res = await fetch(`/api/serial-numbers/search?q=${encodeURIComponent(term)}`, {
                credentials: "include",
            });
            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.error || "Failed to search serial number");
            }
            return res.json();
        },
        enabled: !!term,
        retry: false,
    });

    const onSearch = React.useCallback(() => {
        const v = query.trim();
        if (!v) return;
        setTerm(v);
        pushRecent(v);
    }, [query, pushRecent]);

    const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onSearch();
    };

    const statusTone = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered":
            case "in_stock":
                return "bg-success/10 text-success dark:bg-success/20 dark:text-success";
            case "reserved":
                return "bg-amber-100/50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
            case "returned":
            case "defective":
                return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    const statusSoft = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered":
            case "in_stock":
                return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900";
            case "reserved":
                return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900";
            case "returned":
            case "defective":
                return "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-900";
            default:
                return "bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800";
        }
    };

    const warrantyActive = (w?: { startDate: string; endDate: string }) => {
        if (!w) return false;
        const now = new Date();
        const end = new Date(w.endDate);
        return now <= end;
    };

    const fmtDate = (iso?: string) => {
        if (!iso) return "—";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString();
    };


    const safeUpper = (s?: string) => (s ? s.replace(/_/g, " ").toUpperCase() : "—");

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // ignore
        }
    };

    const entityItems = React.useMemo(() => {
        if (!data) return [];
        return [
            {
                key: "customer",
                label: "Customer",
                sub: data.customer?.name,
                icon: User,
                onClick: () => navigate(`/clients/${data.customer.id}`),
            },
            {
                key: "quote",
                label: "Quote",
                sub: data.quote?.quoteNumber,
                icon: FileText,
                onClick: () => navigate(`/quotes/${data.quote.id}`),
            },
            data.vendorPo
                ? {
                    key: "vendorPo",
                    label: "Vendor PO",
                    sub: data.vendorPo.poNumber,
                    icon: Layers,
                    onClick: () => navigate(`/vendor-pos/${data.vendorPo!.id}`),
                }
                : null,
            {
                key: "invoice",
                label: "Invoice",
                sub: data.invoice?.invoiceNumber,
                icon: FileText,
                onClick: () => navigate(`/invoices/${data.invoice.id}`),
            },
            data.product
                ? {
                    key: "product",
                    label: "Product",
                    sub: `${data.product.name} · ${data.product.sku}`,
                    icon: Package,
                    onClick: () => navigate(`/products/${data.product!.id}`),
                }
                : null,
        ].filter(Boolean) as Array<{
            key: string;
            label: string;
            sub?: string;
            icon: React.ComponentType<{ className?: string }>;
            onClick: () => void;
        }>;
    }, [data, navigate]);

    return (
        <div className="min-h-screen w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Premium Breadcrumbs */}
                <Breadcrumbs data={data || null} />

                {/* Premium Header */}
                <Card className="border border-border/70 bg-card/95 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                                <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 text-primary shrink-0">
                                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                                            Serial Number Trace
                                        </h1>
                                    </div>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground font-['Open_Sans']">
                                        Track serials through Customer → Quote → PO → Invoice
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    className="hidden sm:inline-flex h-9 text-xs xs:text-sm"
                                    onClick={() => setCmdOpen(true)}
                                >
                                    <Search className="h-3.5 xs:h-4 w-3.5 xs:w-4 mr-1.5" />
                                    Quick Search
                                    <span className="ml-1.5 text-[10px] xs:text-xs text-muted-foreground">
                                        ⌘K
                                    </span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="sm:hidden h-9 w-9 px-0"
                                    onClick={() => setCmdOpen(true)}
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Search row */}
                        <div className="flex flex-col xs:flex-row gap-1.5 xs:gap-2">
                            <div className="relative flex-1">
                                <div className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Search className="h-3.5 xs:h-4 w-3.5 xs:w-4 text-muted-foreground" />
                                </div>
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={onEnter}
                                    placeholder="Enter serial number..."
                                    className="pl-8 xs:pl-9 h-9 xs:h-10 text-xs xs:text-sm"
                                />
                            </div>
                            <div className="flex gap-1 xs:gap-1.5">
                                <Button
                                    onClick={onSearch}
                                    disabled={!query.trim() || isLoading}
                                    className="h-9 xs:h-10 px-3 xs:px-4 text-xs xs:text-sm"
                                >
                                    <Search className="h-3.5 xs:h-4 w-3.5 xs:w-4 mr-1" />
                                    <span className="hidden xs:inline">Search</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setQuery("");
                                        setTerm("");
                                    }}
                                    className="h-9 xs:h-10 px-2 xs:px-3 text-xs xs:text-sm"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>

                        {/* Subtle "searching…" chip */}
                        {term && (
                            <div className="flex items-center gap-2">
                                <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${isFetching ? "border-border" : "border-border"}`}>
                                    <span className={`h-2 w-2 rounded-full ${isFetching ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                                    <span className="text-muted-foreground">
                                        Current query: <span className="font-mono font-semibold text-foreground">{term}</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Command Palette */}
                <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
                    <CommandInput placeholder="Search serial…" />
                    <CommandList>
                        <CommandEmpty>No matches.</CommandEmpty>

                        <CommandGroup heading="Recent">
                            {recent.length === 0 && (
                                <CommandItem disabled>No recent searches</CommandItem>
                            )}
                            {recent.map((r) => (
                                <CommandItem
                                    key={r}
                                    value={r}
                                    onSelect={() => {
                                        setCmdOpen(false);
                                        setQuery(r);
                                        setTerm(r);
                                        pushRecent(r);
                                    }}
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span className="font-mono">{r}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        <CommandSeparator />

                        <CommandGroup heading="Examples">
                            {["SN12345", "BATCH-001", "INV-0001-S1"].map((ex) => (
                                <CommandItem
                                    key={ex}
                                    value={ex}
                                    onSelect={() => {
                                        setCmdOpen(false);
                                        setQuery(ex);
                                        setTerm(ex);
                                        pushRecent(ex);
                                    }}
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    <span className="font-mono">{ex}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </CommandDialog>

                {/* Error */}
                {error && (
                    <Alert className="border-destructive/50 bg-destructive/10">
                        <div className="flex items-start gap-2.5 xs:gap-3">
                            <div className="h-9 xs:h-10 w-9 xs:w-10 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                                <AlertCircle className="h-4.5 xs:h-5 w-4.5 xs:w-5 text-destructive" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-destructive text-sm xs:text-base mb-0.5 xs:mb-1">Not Found</h3>
                                <AlertDescription className="text-xs xs:text-sm text-destructive/80">
                                    {(error as Error)?.message || "We couldn't find records for this serial number."}
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>
                )}

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3 xs:gap-4">
                        <Card className="border bg-card shadow-sm">
                            <CardContent className="p-3 xs:p-4 space-y-3">
                                <div className="h-5 w-2/3 bg-muted rounded" />
                                <div className="h-9 w-full bg-muted rounded" />
                                <div className="h-9 w-full bg-muted rounded" />
                                <div className="h-9 w-full bg-muted rounded" />
                            </CardContent>
                        </Card>
                        <Card className="border bg-card shadow-sm">
                            <CardContent className="p-3 xs:p-4 space-y-3">
                                <div className="h-7 w-1/2 bg-muted rounded" />
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="h-16 xs:h-20 bg-muted rounded" />
                                    <div className="h-16 xs:h-20 bg-muted rounded" />
                                    <div className="h-16 xs:h-20 bg-muted rounded" />
                                    <div className="h-16 xs:h-20 bg-muted rounded" />
                                </div>
                                <div className="h-32 xs:h-40 bg-muted rounded" />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Empty */}
                {!term && !isLoading && !error && (
                    <Card className="border-2 border-dashed border-border">
                        <CardContent className="py-12 xs:py-16 text-center">
                            <div className="mx-auto max-w-2xl space-y-4">
                                <div className="mx-auto h-14 xs:h-16 w-14 xs:w-16 rounded-2xl bg-muted flex items-center justify-center">
                                    <Search className="h-7 xs:h-8 w-7 xs:w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h2 className="text-lg xs:text-xl font-bold text-foreground">
                                        Search a Serial Number
                                    </h2>
                                    <p className="text-xs xs:text-sm text-muted-foreground mt-1">
                                        Use the search box above or press <span className="font-semibold">⌘K / Ctrl+K</span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center gap-2 pt-2">
                                    {["SN12345", "BATCH-001", "INV-0001-S1"].map((chip) => (
                                        <button
                                            key={chip}
                                            onClick={() => {
                                                setQuery(chip);
                                                setTerm(chip);
                                                pushRecent(chip);
                                            }}
                                            className="rounded-full border border-border bg-card px-2.5 xs:px-3 py-1 xs:py-1.5 text-[10px] xs:text-xs font-mono text-foreground hover:border-border/80 hover:bg-accent transition-colors"
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {data && !isLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3 xs:gap-4">
                        {/* Left: Entity Rail */}
                        <div className="space-y-3 xs:space-y-4">
                            {/* Serial summary */}
                            <Card className="border bg-card shadow-sm overflow-hidden">
                                <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                    <div className="flex items-start justify-between gap-2 xs:gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] xs:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                Serial Number
                                            </p>
                                            <CardTitle className="mt-1 text-base xs:text-lg sm:text-xl font-mono break-all">
                                                {data.serialNumber}
                                            </CardTitle>
                                        </div>
                                        <Badge className={`${statusTone(data.status)} shrink-0 text-[10px] xs:text-xs`}>
                                            {safeUpper(data.status)}
                                        </Badge>
                                    </div>

                                    <div className="flex gap-1.5 xs:gap-2 pt-2 xs:pt-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-8 xs:h-9 text-xs xs:text-sm"
                                            onClick={() => copyToClipboard(data.serialNumber)}
                                        >
                                            <Copy className="h-3.5 xs:h-4 w-3.5 xs:w-4 mr-1" />
                                            Copy
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-8 xs:h-9 text-xs xs:text-sm"
                                            onClick={() => setCmdOpen(true)}
                                        >
                                            <Search className="h-3.5 xs:h-4 w-3.5 xs:w-4 mr-1" />
                                            Quick
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 space-y-2.5 xs:space-y-3">
                                    <div className={`rounded-lg border px-2.5 xs:px-3 py-2 xs:py-2.5 ${statusSoft(data.status)}`}>
                                        <div className="flex items-center gap-1.5 xs:gap-2">
                                            <ShieldCheck className="h-3.5 xs:h-4 w-3.5 xs:w-4 shrink-0" />
                                            <p className="text-[10px] xs:text-[11px] font-semibold uppercase tracking-wider">Status</p>
                                        </div>
                                        <p className="text-xs xs:text-sm font-semibold mt-1">{safeUpper(data.status)}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5 xs:gap-3">
                                        <div className="rounded-lg border border-border bg-card p-2.5 xs:p-3">
                                            <div className="flex items-center gap-1.5 xs:gap-2 text-muted-foreground">
                                                <Calendar className="h-3.5 xs:h-4 w-3.5 xs:w-4 shrink-0" />
                                                <p className="text-[10px] xs:text-[11px] font-semibold uppercase">Invoice</p>
                                            </div>
                                            <p className="text-xs xs:text-sm font-semibold mt-1">{fmtDate(data.invoice.invoiceDate)}</p>
                                        </div>

                                        <div className="rounded-lg border border-border bg-card p-2.5 xs:p-3">
                                            <div className="flex items-center gap-1.5 xs:gap-2 text-muted-foreground">
                                                <Package className="h-3.5 xs:h-4 w-3.5 xs:w-4 shrink-0" />
                                                <p className="text-[10px] xs:text-[11px] font-semibold uppercase">Qty</p>
                                            </div>
                                            <p className="text-xs xs:text-sm font-semibold mt-1">{data.invoiceItem.quantity}</p>
                                        </div>
                                    </div>

                                    {data.location && (
                                        <div className="rounded-lg border border-border bg-card p-2.5 xs:p-3">
                                            <div className="flex items-center gap-1.5 xs:gap-2 text-muted-foreground">
                                                <MapPin className="h-3.5 xs:h-4 w-3.5 xs:w-4 shrink-0" />
                                                <p className="text-[10px] xs:text-[11px] font-semibold uppercase">Location</p>
                                            </div>
                                            <p className="text-xs xs:text-sm mt-1">{data.location}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Entities */}
                            <Card className="border bg-card shadow-sm">
                                <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                    <CardTitle className="text-sm xs:text-base">Linked Entities</CardTitle>
                                </CardHeader>

                                <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                                    {/* Mobile: horizontal chips */}
                                    <div className="lg:hidden flex gap-1.5 xs:gap-2 overflow-x-auto pb-2">
                                        {entityItems.map((it) => {
                                            const Icon = it.icon;
                                            return (
                                                <button
                                                    key={it.key}
                                                    onClick={it.onClick}
                                                    className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 xs:px-3 py-1.5 xs:py-2 text-[10px] xs:text-xs hover:bg-accent transition-colors"
                                                >
                                                    <Icon className="h-3.5 xs:h-4 w-3.5 xs:w-4 shrink-0" />
                                                    <span className="font-semibold">{it.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Desktop: stacked rail */}
                                    <div className="hidden lg:flex flex-col gap-1.5 xs:gap-2">
                                        {entityItems.map((it) => {
                                            const Icon = it.icon;
                                            return (
                                                <button
                                                    key={it.key}
                                                    onClick={it.onClick}
                                                    className="group w-full text-left rounded-lg border border-border bg-card p-2.5 xs:p-3 hover:bg-accent transition-colors"
                                                >
                                                    <div className="flex items-start gap-2 xs:gap-2.5">
                                                        <div className="h-8 xs:h-9 w-8 xs:w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                            <Icon className="h-3.5 xs:h-4 w-3.5 xs:w-4 text-foreground" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs xs:text-sm font-semibold text-foreground">
                                                                {it.label}
                                                            </p>
                                                            <p className="text-[10px] xs:text-xs text-muted-foreground truncate">
                                                                {it.sub || "—"}
                                                            </p>
                                                        </div>
                                                        <ExternalLink className="h-3.5 xs:h-4 w-3.5 xs:w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right: Investigation Tabs */}
                        <div className="space-y-3">
                            {/* Trace path header */}
                            <Card className="border bg-card shadow-sm overflow-hidden">
                                <CardHeader className="border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-muted/50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <CardTitle className="text-lg sm:text-xl">
                                                Trace Path
                                            </CardTitle>
                                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                                Customer → Quote → {data.vendorPo ? "Vendor PO → " : ""}
                                                Invoice → Serial
                                            </p>
                                        </div>
                                        {data.invoice.isMaster && (
                                            <Badge variant="secondary">
                                                MASTER INVOICE
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                                    {/* "nodes" */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <Node label="Customer" value={data.customer.name} icon={User} />
                                        <ArrowBridge />
                                        <Node label="Quote" value={data.quote.quoteNumber} icon={FileText} />
                                        {data.vendorPo ? (
                                            <>
                                                <ArrowBridge />
                                                <Node label="Vendor PO" value={data.vendorPo.poNumber} icon={Layers} />
                                            </>
                                        ) : null}
                                        <ArrowBridge />
                                        <Node label="Invoice" value={data.invoice.invoiceNumber} icon={FileText} />
                                        <ArrowBridge />
                                        <Node label="Serial" value={data.serialNumber} icon={Package} mono />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border bg-card shadow-sm">
                                <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                                    <Tabs defaultValue="overview">
                                        <TabsList className="w-full flex flex-wrap justify-start">
                                            <TabsTrigger value="overview">Overview</TabsTrigger>
                                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                            <TabsTrigger value="warranty">Warranty</TabsTrigger>
                                            <TabsTrigger value="notes">Notes</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="overview" className="mt-5 space-y-5">
                                            {/* Key stats */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                                <Stat
                                                    icon={ShieldCheck}
                                                    label="Status"
                                                    value={safeUpper(data.status)}
                                                />
                                                <Stat
                                                    icon={Calendar}
                                                    label="Invoice Date"
                                                    value={fmtDate(data.invoice.invoiceDate)}
                                                />
                                                <Stat
                                                    icon={Package}
                                                    label="Quantity"
                                                    value={String(data.invoiceItem.quantity)}
                                                />
                                                <Stat
                                                    icon={MapPin}
                                                    label="Location"
                                                    value={data.location || "—"}
                                                />
                                            </div>

                                            <Separator />

                                            {/* Description / Product */}
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                <Card className="border bg-card shadow-sm">
                                                    <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                                        <CardTitle className="text-base">Line Item</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 pt-0">
                                                        <p className="text-sm text-foreground/80 leading-relaxed">
                                                            {data.invoiceItem.description || "—"}
                                                        </p>
                                                    </CardContent>
                                                </Card>

                                                <Card className="border bg-card shadow-sm">
                                                    <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                                        <CardTitle className="text-base">Product</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 pt-0 space-y-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-sm font-semibold text-foreground">
                                                                {data.product?.name || "Not linked"}
                                                            </p>
                                                            {data.product?.sku ? (
                                                                <Badge variant="secondary" className="font-mono">
                                                                    {data.product.sku}
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Tip: link products to enable deeper SKU-level tracking.
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="timeline" className="mt-5">
                                            <Timeline history={data.history} />
                                        </TabsContent>

                                        <TabsContent value="warranty" className="mt-5 space-y-4">
                                            {!data.warranty ? (
                                                <Alert className="border-border">
                                                    <AlertDescription className="text-sm">
                                                        No warranty information is attached to this serial.
                                                    </AlertDescription>
                                                </Alert>
                                            ) : (
                                                <Card
                                                    className={`border-2 ${
                                                        warrantyActive(data.warranty)
                                                            ? "border-success"
                                                            : "border-destructive"
                                                    }`}
                                                >
                                                    <CardHeader
                                                        className={`border-b ${
                                                            warrantyActive(data.warranty)
                                                                ? "bg-success/10 border-success"
                                                                : "bg-destructive/10 border-destructive"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-3 flex-wrap">
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2
                                                                    className={`h-5 w-5 ${
                                                                        warrantyActive(data.warranty)
                                                                            ? "text-success"
                                                                            : "text-destructive"
                                                                    }`}
                                                                />
                                                                <CardTitle className="text-base">Warranty</CardTitle>
                                                            </div>
                                                            <Badge
                                                                className={`${
                                                                    warrantyActive(data.warranty)
                                                                        ? "bg-success text-white"
                                                                        : "bg-destructive text-white"
                                                                }`}
                                                            >
                                                                {warrantyActive(data.warranty) ? "ACTIVE" : "EXPIRED"}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="p-4 sm:p-6">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <Stat icon={Calendar} label="Start" value={fmtDate(data.warranty.startDate)} />
                                                            <Stat icon={Calendar} label="End" value={fmtDate(data.warranty.endDate)} />
                                                        </div>
                                                        <div className="mt-4">
                                                            <Alert
                                                                className={`${
                                                                    warrantyActive(data.warranty)
                                                                        ? "bg-success/10 border-success"
                                                                        : "bg-destructive/10 border-destructive"
                                                                }`}
                                                            >
                                                                <AlertDescription className="text-sm font-medium">
                                                                    {warrantyActive(data.warranty)
                                                                        ? "Covered: service claims can be processed."
                                                                        : "Out of coverage: verify AMC / extended warranty if applicable."}
                                                                </AlertDescription>
                                                            </Alert>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="notes" className="mt-5 space-y-4">
                                            <Card className="border bg-card shadow-sm">
                                                <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                                    <div className="flex items-center gap-2">
                                                        <StickyNote className="h-5 w-5 text-muted-foreground" />
                                                        <CardTitle className="text-base">Notes</CardTitle>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 pt-0">
                                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                                        {data.notes || "No notes recorded for this serial."}
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="border bg-card shadow-sm">
                                                <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                                    <CardTitle className="text-base">Quick Actions</CardTitle>
                                                </CardHeader>
                                                <CardContent className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 pt-0 flex flex-col sm:flex-row gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => navigate(`/invoices/${data.invoice.id}`)}
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Open Invoice
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => navigate(`/clients/${data.customer.id}`)}
                                                    >
                                                        <User className="h-4 w-4 mr-2" />
                                                        Open Customer
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/** Small reusable UI blocks */

function Node({
                  label,
                  value,
                  icon: Icon,
                  mono,
              }: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    mono?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-3 min-w-0">
            <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                    </p>
                    <p className={`text-sm font-semibold text-foreground truncate ${mono ? "font-mono" : ""}`}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

function ArrowBridge() {
    return (
        <div className="hidden sm:flex items-center justify-center px-1">
            <div className="h-0.5 w-6 bg-border" />
        </div>
    );
}

function Stat({
                  icon: Icon,
                  label,
                  value,
              }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground mt-2 break-words">
                {value}
            </p>
        </div>
    );
}

function Timeline({
                      history,
                  }: {
    history: { action: string; user: string; timestamp: string }[];
}) {
    if (!history || history.length === 0) {
        return (
            <Alert className="border-border">
                <AlertDescription className="text-sm">
                    No activity history recorded for this serial.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-3">
            {history.map((h, idx) => {
                const last = idx === history.length - 1;
                return (
                    <div key={`${h.timestamp}-${idx}`} className="relative pl-8">
                        {!last && (
                            <div className="absolute left-[14px] top-7 bottom-0 w-0.5 bg-border" />
                        )}
                        <div className="absolute left-0 top-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <p className="text-sm font-bold text-foreground">
                                    {h.action.replace(/_/g, " ").toUpperCase()}
                                </p>
                                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">{fmtTimelineDate(h.timestamp)}</span>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-xs text-foreground/80">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{h.user}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function fmtTimelineDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
}

function Breadcrumbs({ data }: { data: SerialTraceabilityInfo | null }) {
    const [, navigate] = useLocation();

    const items = [
        { label: "Home", icon: Home, onClick: () => navigate("/") },
        { label: "Trace Console", icon: Search, onClick: () => navigate("/serial-search") },
        data && { label: data.serialNumber, mono: true, current: true },
    ].filter(Boolean) as Array<{
        label: string;
        icon?: React.ComponentType<{ className?: string }>;
        onClick?: () => void;
        mono?: boolean;
        current?: boolean;
    }>;

    return (
        <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
            {items.map((item, idx) => {
                const Icon = item.icon;

                return (
                    <React.Fragment key={idx}>
                        {idx > 0 && (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        {item.current ? (
                            <span className={`flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white ${item.mono ? "font-mono" : ""}`}>
                                {Icon && <Icon className="h-3.5 w-3.5" />}
                                {item.label}
                            </span>
                        ) : (
                            <button
                                onClick={item.onClick}
                                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                            >
                                {Icon && <Icon className="h-3.5 w-3.5" />}
                                <span>{item.label}</span>
                            </button>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}

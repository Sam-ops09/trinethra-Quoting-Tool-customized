import { useState, useMemo } from "react";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
    Plus,
    Search,
    Mail,
    Phone,
    Loader2,
    Edit,
    Trash2,
    Users,
    Eye,
    Filter,
    Grid3x3,
    List,
    ChevronRight,
    Home,
    Building2,
    Sparkles,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema, type Client } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";
import { PermissionGuard } from "@/components/permission-guard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ClientFormDialog, SEGMENT_OPTIONS, clientFormSchema } from "@/components/client-form-dialog";

type ClientFormValues = z.infer<typeof clientFormSchema>;

function useClientFilters(
    clients: Client[] | undefined,
    search: string,
    segment: string
) {
    return useMemo(() => {
        if (!clients) return [];
        const q = search.trim().toLowerCase();

        return clients.filter((client) => {
            const matchesSearch =
                !q ||
                client.name.toLowerCase().includes(q) ||
                client.email.toLowerCase().includes(q);

            const clientSegment = (client as any).segment || "unclassified";
            const matchesSegment = segment === "all" || segment === clientSegment;

            return matchesSearch && matchesSegment;
        });
    }, [clients, search, segment]);
}

// Premium List Card Component
function ClientListCard({
    client,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
}: {
    client: Client;
    onEdit: (client: Client) => void;
    onDelete: (id: string) => void;
    canEdit: boolean;
    canDelete: boolean;
}) {
    const segment = (client as any).segment || "corporate";
    const segmentData = SEGMENT_OPTIONS.find((s) => s.value === segment);
    const segmentLabel = segmentData?.label.split("–")[0].trim();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
            <Card className={`
                relative overflow-hidden border ${segmentData?.borderColor || "border-slate-200 dark:border-slate-800"}
                bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl
                shadow-sm hover:shadow-xl transition-all duration-300
                group
            `}>
                <div className={`absolute inset-0 bg-gradient-to-r ${segmentData?.color} opacity-30`} />
                <CardContent className="p-3 xs:p-4 relative z-10">
                    <div className="flex items-start justify-between gap-3 xs:gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`
                                h-10 w-10 xs:h-12 xs:w-12 rounded-xl ${segmentData?.bgColor}
                                flex items-center justify-center shrink-0
                                shadow-sm group-hover:scale-110 transition-transform duration-300
                            `}>
                                <Building2 className={`h-5 w-5 xs:h-6 xs:w-6 ${segmentData?.textColor}`} />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <h3 className="text-sm xs:text-base font-bold text-foreground truncate">
                                        {client.name}
                                    </h3>
                                    <Badge 
                                        variant="secondary" 
                                        className={`text-[9px] xs:text-[10px] px-2 py-0.5 ${segmentData?.bgColor} ${segmentData?.textColor} border-0`}
                                    >
                                        {segmentLabel}
                                    </Badge>
                                </div>
                                <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-3 text-[11px] xs:text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                    {client.phone && (
                                        <div className="items-center gap-1.5 hidden xs:flex">
                                            <Phone className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                            <span>{client.phone}</span>
                                        </div>
                                    )}
                                </div>
                                {client.contactPerson && (
                                    <p className="text-[10px] xs:text-[11px] text-muted-foreground/70 mt-1.5 font-medium">
                                        Contact: {client.contactPerson}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <Link href={`/clients/${client.id}`}>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                            {canEdit && (
                                <PermissionGuard resource="clients" action="edit">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(client)}
                                        className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </PermissionGuard>
                            )}
                            {canDelete && (
                                <PermissionGuard resource="clients" action="delete">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (confirm("Delete this client?")) onDelete(client.id);
                                        }}
                                        className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </PermissionGuard>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Premium Grid Card Component
function ClientGridCard({
    client,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
}: {
    client: Client;
    onEdit: (client: Client) => void;
    onDelete: (id: string) => void;
    canEdit: boolean;
    canDelete: boolean;
}) {
    const segment = (client as any).segment || "corporate";
    const segmentData = SEGMENT_OPTIONS.find((s) => s.value === segment);
    const segmentLabel = segmentData?.label.split("–")[0].trim();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
        >
            <Card className={`
                relative overflow-hidden border ${segmentData?.borderColor || "border-slate-200 dark:border-slate-800"}
                bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl
                shadow-sm hover:shadow-2xl transition-all duration-300
                group h-full
            `}>
                <div className={`absolute inset-0 bg-gradient-to-br ${segmentData?.color} opacity-40`} />
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${segmentData?.color}`} />
                
                <CardHeader className="p-4 xs:p-5 pb-3 relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className={`
                            h-12 w-12 rounded-xl ${segmentData?.bgColor}
                            flex items-center justify-center
                            shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300
                        `}>
                            <Building2 className={`h-6 w-6 ${segmentData?.textColor}`} />
                        </div>
                        <Badge 
                            variant="secondary" 
                            className={`text-[9px] xs:text-[10px] px-2 py-1 ${segmentData?.bgColor} ${segmentData?.textColor} border-0 shadow-sm`}
                        >
                            {segmentLabel}
                        </Badge>
                    </div>
                    <h3 className="text-sm xs:text-base font-bold text-foreground truncate mb-1">
                        {client.name}
                    </h3>
                </CardHeader>
                
                <CardContent className="p-4 xs:p-5 pt-0 space-y-3 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] xs:text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0 opacity-70" />
                            <span className="truncate">{client.email}</span>
                        </div>
                        {client.phone && (
                            <div className="flex items-center gap-2 text-[11px] xs:text-xs text-muted-foreground">
                                <Phone className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                <span>{client.phone}</span>
                            </div>
                        )}
                        {client.contactPerson && (
                            <p className="text-[10px] xs:text-[11px] text-muted-foreground/70 font-medium">
                                Contact: {client.contactPerson}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex gap-1.5 pt-3 border-t border-border/50">
                         <Link href={`/clients/${client.id}`} className="flex-1">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full h-9 text-[11px] xs:text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                            >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                View
                            </Button>
                        </Link>
                        {canEdit && (
                            <PermissionGuard resource="clients" action="edit">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(client)}
                                    className="h-9 px-2.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </Button>
                            </PermissionGuard>
                        )}
                        {canDelete && (
                            <PermissionGuard resource="clients" action="delete">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm("Delete this client?")) onDelete(client.id);
                                    }}
                                    className="h-9 px-2.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </PermissionGuard>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}


export default function Clients() {
    const [searchQuery, setSearchQuery] = useState("");
    const [segmentFilter, setSegmentFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    // Feature flags
    const canCreateClient = useFeatureFlag('clients_create');
    const canEditClient = useFeatureFlag('clients_edit');
    const canDeleteClient = useFeatureFlag('clients_delete');
    const canManageSegments = useFeatureFlag('clients_segmentation');
    const canViewGSTIN = useFeatureFlag('clients_gstin');
    const canViewBilling = useFeatureFlag('clients_billingAddress');
    const canViewShipping = useFeatureFlag('clients_shippingAddress');
    const canUseAdvancedSearch = useFeatureFlag('clients_advancedSearch');
    const canViewTheme = useFeatureFlag('clients_preferredTheme');

    const { data: clients, isLoading } = useQuery<Client[]>({
        queryKey: ["/api/clients"],
    });

    const filteredClients = useClientFilters(clients, searchQuery, segmentFilter);

    const stats = useMemo(() => {
        if (!clients) return { total: 0, bySegment: {} as Record<string, number> };
        const bySegment: Record<string, number> = {};
        clients.forEach((client) => {
            const seg = (client as any).segment || "unclassified";
            bySegment[seg] = (bySegment[seg] || 0) + 1;
        });
        return { total: clients.length, bySegment };
    }, [clients]);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            billingAddress: "",
            shippingAddress: "",
            gstin: "",
            contactPerson: "",
            segment: "corporate",
            preferredTheme: "modern",
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: ClientFormValues) => apiRequest("POST", "/api/clients", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            toast({ title: "Success", description: "Client created successfully" });
            setIsAddDialogOpen(false);
            form.reset();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create client", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ClientFormValues }) =>
            apiRequest("PUT", `/api/clients/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            toast({ title: "Success", description: "Client updated successfully" });
            setEditingClient(null);
            form.reset();
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update client", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/clients/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
            toast({ title: "Success", description: "Client deleted successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete client", variant: "destructive" });
        },
    });

    const handleSubmit = (data: ClientFormValues) => {
        if (editingClient) {
            updateMutation.mutate({ id: editingClient.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const openEditDialog = (client: Client) => {
        setEditingClient(client);
        form.reset({
            name: client.name,
            email: client.email,
            phone: client.phone || "",
            billingAddress: client.billingAddress || "",
            shippingAddress: client.shippingAddress || "",
            gstin: client.gstin || "",
            contactPerson: client.contactPerson || "",
            segment: (client as any).segment || "corporate",
            preferredTheme: (client as any).preferredTheme || "modern",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
            {/* Premium Header */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="sticky top-0 z-20 backdrop-blur-xl border-b border-border/50 bg-white/70 dark:bg-slate-950/70"
            >
                <div className="w-full max-w-[1800px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-3 xs:py-4 gap-3 xs:gap-4">
                        <div className="flex items-center gap-3 xs:gap-4 min-w-0 flex-1">
                            <motion.div 
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="p-2.5 xs:p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shrink-0"
                            >
                                <Users className="h-5 xs:h-6 w-5 xs:w-6 text-primary" />
                            </motion.div>
                            <div className="min-w-0 flex-1">
                                <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit mb-1.5">
                                    <button
                                        onClick={() => setLocation("/")}
                                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                                    >
                                        <Home className="h-3.5 w-3.5" />
                                        <span>Home</span>
                                    </button>
                                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                                        <Users className="h-3.5 w-3.5" />
                                        Clients
                                    </span>
                                </nav>
                                <h1 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate flex items-center gap-2">
                                    Client Management
                                    <Sparkles className="h-4 w-4 xs:h-5 xs:w-5 text-primary/60" />
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 xs:gap-3 shrink-0">
                            <Badge 
                                variant="outline" 
                                className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 text-primary font-semibold h-auto py-1.5 xs:py-2 text-[10px] xs:text-xs px-2.5 xs:px-3 shadow-sm"
                            >
                                 {stats.total} Total
                            </Badge>
                            {canCreateClient && (
                                <PermissionGuard resource="clients" action="create">
                                    <Button
                                        onClick={() => {
                                            setEditingClient(null);
                                            form.reset();
                                            setIsAddDialogOpen(true);
                                        }}
                                        size="sm"
                                        className="h-9 xs:h-10 text-xs xs:text-sm px-3 xs:px-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90"
                                    >
                                        <Plus className="h-4 w-4 mr-1.5" />
                                        <span className="hidden xs:inline">Add Client</span>
                                        <span className="xs:hidden">Add</span>
                                    </Button>
                                </PermissionGuard>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="flex-1 w-full max-w-[1800px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-5 sm:py-6 space-y-4 xs:space-y-5 sm:space-y-6 pb-8">
                 {/* Premium Stats Grid */}
                {canManageSegments && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 xs:gap-3">
                        {SEGMENT_OPTIONS.map((seg, index) => {
                            const count = stats.bySegment[seg.value] || 0;
                            return (
                                <motion.div
                                    key={seg.value}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                >
                                    <Card
                                        className={`
                                            relative overflow-hidden cursor-pointer transition-all duration-300
                                            border ${seg.borderColor}
                                            bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl
                                            ${segmentFilter === seg.value 
                                                ? `ring-2 ring-offset-2 ${seg.borderColor} shadow-lg scale-105` 
                                                : "hover:shadow-md"
                                            }
                                        `}
                                        onClick={() => setSegmentFilter(seg.value)}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${seg.color} opacity-20`} />
                                        <CardContent className="p-3 xs:p-4 relative z-10">
                                            <div className="text-center space-y-1">
                                                <p className={`text-2xl xs:text-3xl font-bold ${seg.textColor}`}>
                                                    {count}
                                                </p>
                                                <p className="text-[9px] xs:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                                    {seg.label.split("–")[0].trim()}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Compact Search & Filters */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-2.5 xs:p-3 space-y-2 xs:space-y-2.5">
                        <div className="flex flex-col xs:flex-row gap-1.5 xs:gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 h-3 xs:h-3.5 w-3 xs:w-3.5 text-slate-400 shrink-0" />
                                <Input
                                    type="text"
                                    placeholder="Search clients…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 xs:pl-9 pr-2 xs:pr-3 text-xs xs:text-sm h-9 xs:h-10"
                                />
                            </div>
                             <div className="flex gap-1.5 xs:gap-2">
                                {canManageSegments && canUseAdvancedSearch && (
                                    <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                                        <SelectTrigger className="h-9 xs:h-10 text-xs xs:text-sm w-auto min-w-[120px]">
                                            <Filter className="h-3 xs:h-3.5 w-3 xs:w-3.5 mr-1" />
                                            <SelectValue placeholder="Filter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Segments</SelectItem>
                                            {SEGMENT_OPTIONS.map((seg) => (
                                                <SelectItem key={seg.value} value={seg.value} className="text-xs xs:text-sm">
                                                    {seg.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                                    <TabsList className="h-9 xs:h-10">
                                        <TabsTrigger value="list" className="px-2 text-xs xs:text-sm">
                                            <List className="h-3.5 xs:h-4 w-3.5 xs:w-4" />
                                        </TabsTrigger>
                                        <TabsTrigger value="grid" className="px-2 text-xs xs:text-sm">
                                            <Grid3x3 className="h-3.5 xs:h-4 w-3.5 xs:w-4" />
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Clients Display */}
                {isLoading ? (
                    <div className="grid gap-2 xs:gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="border-slate-200 dark:border-slate-800">
                                <CardContent className="p-2.5 xs:p-3 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-3 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredClients.length === 0 ? (
                    <Card className="border-dashed border-2 py-10 xs:py-16">
                        <CardContent className="flex flex-col items-center text-center">
                            <Users className="h-10 xs:h-16 w-10 xs:w-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-base xs:text-lg font-semibold">No clients found</h3>
                            <p className="text-xs xs:text-sm text-muted-foreground mb-6">Try adjusting your search or filters</p>
                            {canCreateClient && (
                                <PermissionGuard resource="clients" action="create">
                                    <Button onClick={() => setIsAddDialogOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Your First Client
                                    </Button>
                                </PermissionGuard>
                            )}
                        </CardContent>
                    </Card>
                ) : viewMode === "grid" ? (
                    <div className="grid gap-3 xs:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredClients.map((client) => (
                            <ClientGridCard
                                key={client.id}
                                client={client}
                                onEdit={openEditDialog}
                                onDelete={(id) => deleteMutation.mutate(id)}
                                canEdit={canEditClient}
                                canDelete={canDeleteClient}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 xs:gap-3">
                        {filteredClients.map((client) => (
                            <ClientListCard
                                key={client.id}
                                client={client}
                                onEdit={openEditDialog}
                                onDelete={(id) => deleteMutation.mutate(id)}
                                canEdit={canEditClient}
                                canDelete={canDeleteClient}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Client Form Dialog */}
            <ClientFormDialog
                open={isAddDialogOpen || !!editingClient}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsAddDialogOpen(false);
                        setEditingClient(null);
                        form.reset();
                    }
                }}
                form={form}
                onSubmit={handleSubmit}
                isEditing={!!editingClient}
                isPending={createMutation.isPending || updateMutation.isPending}
                canViewGSTIN={canViewGSTIN}
                canManageSegments={canManageSegments}
                canViewBilling={canViewBilling}
                canViewShipping={canViewShipping}
                canViewTheme={canViewTheme}
            />
        </div>
    );
}


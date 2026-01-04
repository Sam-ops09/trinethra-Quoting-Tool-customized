import * as React from "react";
import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Building2,
    FileText,
    DollarSign,
    Plus,
    Trash2,
    Tag,
    MessageSquare,
    Calendar,
    User,
    Users,
    X,
    Palette,
    Loader2,
    Home,
    ChevronRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from "@/components/permission-guard";
import type {
    Client,
    ClientTag,
    ClientCommunication,
    Quote,
} from "@shared/schema";
import { format } from "date-fns";

interface Theme {
    name: string;
    displayName: string;
    description: string;
    colors: {
        primary: string;
        accent: string;
    };
}

const communicationSchema = z.object({
    type: z.enum(["email", "call", "meeting", "note"]),
    subject: z.string().optional(),
    message: z.string().min(1, "Message is required"),
});

type CommunicationFormData = z.infer<typeof communicationSchema>;

interface ExtendedQuote extends Quote {
    clientName?: string;
}

interface ExtendedInvoice {
    id: string;
    invoiceNumber: string;
    quoteNumber: string;
    paymentStatus: string;
    dueDate: Date | string;
    total: string;
}

export default function ClientDetail() {
    const [, params] = useRoute("/clients/:id");
    const clientId = params?.id;
    const { toast } = useToast();

    const [newTag, setNewTag] = useState("");
    const [isCommunicationDialogOpen, setIsCommunicationDialogOpen] =
        useState(false);
    const [selectedSegment, setSelectedSegment] = useState("");
    const [selectedTheme, setSelectedTheme] = useState("");

    // Fetch client data
    const { data: client, isLoading: clientLoading } = useQuery<Client>({
        queryKey: [`/api/clients/${clientId}`],
        enabled: !!clientId,
    });

    // Fetch themes
    const { data: themes = [] } = useQuery<Theme[]>({
        queryKey: ["/api/themes"],
    });

    // Fetch suggested theme for segment
    const { data: suggestedTheme } = useQuery<Theme>({
        queryKey: [
            `/api/themes/segment/${selectedSegment || (client as any)?.segment}`,
        ],
        enabled: !!(selectedSegment || (client as any)?.segment),
    });

    // Fetch client tags
    const { data: tags = [] } = useQuery<ClientTag[]>({
        queryKey: [`/api/clients/${clientId}/tags`],
        enabled: !!clientId,
    });

    // Fetch client communications
    const { data: communications = [] } = useQuery<ClientCommunication[]>({
        queryKey: [`/api/clients/${clientId}/communications`],
        enabled: !!clientId,
    });

    // Fetch all quotes and filter for this client
    const { data: allQuotes = [] } = useQuery<ExtendedQuote[]>({
        queryKey: ["/api/quotes"],
    });

    const clientQuotes = allQuotes.filter((q) => q.clientId === clientId);

    // Fetch all invoices and filter for this client's quotes
    const { data: allInvoices = [] } = useQuery<ExtendedInvoice[]>({
        queryKey: ["/api/invoices"],
    });

    const clientInvoices = allInvoices.filter((inv) =>
        clientQuotes.some(
            (q) => q.id === inv.quoteNumber || q.quoteNumber === inv.quoteNumber
        )
    );

    // Mutations
    const addTagMutation = useMutation({
        mutationFn: async (tag: string) => {
            return await apiRequest("POST", `/api/clients/${clientId}/tags`, { tag });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/api/clients/${clientId}/tags`],
            });
            setNewTag("");
            toast({
                title: "Tag added",
                description: "Tag has been added successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Failed to add tag",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const removeTagMutation = useMutation({
        mutationFn: async (tagId: string) => {
            return await apiRequest("DELETE", `/api/clients/tags/${tagId}`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/api/clients/${clientId}/tags`],
            });
            toast({
                title: "Tag removed",
                description: "Tag has been removed successfully.",
            });
        },
    });

    const communicationForm = useForm<CommunicationFormData>({
        resolver: zodResolver(communicationSchema),
        defaultValues: {
            type: "note",
            subject: "",
            message: "",
        },
    });

    const createCommunicationMutation = useMutation({
        mutationFn: async (data: CommunicationFormData) => {
            return await apiRequest(
                "POST",
                `/api/clients/${clientId}/communications`,
                data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/api/clients/${clientId}/communications`],
            });
            setIsCommunicationDialogOpen(false);
            communicationForm.reset();
            toast({
                title: "Communication logged",
                description: "Communication has been recorded successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Failed to log communication",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const deleteCommunicationMutation = useMutation({
        mutationFn: async (commId: string) => {
            return await apiRequest(
                "DELETE",
                `/api/clients/communications/${commId}`,
                {}
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/api/clients/${clientId}/communications`],
            });
            toast({
                title: "Communication deleted",
                description: "Communication has been removed successfully.",
            });
        },
    });

    // Theme update mutation
    const updateThemeMutation = useMutation({
        mutationFn: async (data: { segment?: string; preferredTheme?: string }) => {
            return await apiRequest("PATCH", `/api/clients/${clientId}/theme`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
            toast({
                title: "Theme updated",
                description: "Client theme preferences have been saved.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Failed to update theme",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleThemeUpdate = async () => {
        await updateThemeMutation.mutateAsync({
            segment: selectedSegment || undefined,
            preferredTheme: selectedTheme || undefined,
        });
    };

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTag.trim()) {
            addTagMutation.mutate(newTag.trim());
        }
    };

    const onCommunicationSubmit = (values: CommunicationFormData) => {
        createCommunicationMutation.mutate(values);
    };

    const getCommunicationIcon = (type: string) => {
        switch (type) {
            case "email":
                return <Mail className="h-4 w-4" />;
            case "call":
                return <Phone className="h-4 w-4" />;
            case "meeting":
                return <Calendar className="h-4 w-4" />;
            case "note":
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "draft":
                return "bg-muted text-muted-foreground";
            case "sent":
                return "bg-primary/10 text-primary";
            case "approved":
                return "bg-success/10 text-success";
            case "rejected":
                return "bg-destructive/10 text-destructive";
            case "invoiced":
                return "bg-accent/10 text-accent";
            case "paid":
                return "bg-success/10 text-success";
            case "partial":
                return "bg-warning/10 text-warning";
            case "pending":
                return "bg-primary/10 text-primary";
            case "overdue":
                return "bg-destructive/10 text-destructive";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    if (clientLoading) {
        return (
            <div className="min-h-screen">
                <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-lg" />
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="min-h-screen">
                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                            <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 opacity-60" />
                            <h3 className="text-base sm:text-lg font-semibold mb-2">
                                Client not found
                            </h3>
                            <Link href="/clients">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Clients
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const clientSegment = (client as any)?.segment;
    const clientPreferredTheme = (client as any)?.preferredTheme;

    return (
        <div className="min-h-screen">
            <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
                    <Link href="/">
                        <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105">
                            <Home className="h-3.5 w-3.5" />
                            <span>Home</span>
                        </button>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <Link href="/clients">
                        <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105">
                            <Users className="h-3.5 w-3.5" />
                            <span>Clients</span>
                        </button>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white truncate">
                        <Users className="h-3.5 w-3.5" />
                        {client.name}
                    </span>
                </nav>

                {/* Header */}
                <div className="flex items-center gap-2">
                    <Link href="/clients">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                            {client.name}
                        </h1>
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Client overview and activity
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                    {/* Quotes */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        Quotes
                                    </p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {clientQuotes.length}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoices */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        Invoices
                                    </p>
                                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {clientInvoices.length}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Communications */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        Chats
                                    </p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {communications.length}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                                    <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        Tags
                                    </p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {tags.length}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                                    <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            {/* COMPANY INFO */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <CardTitle className="text-sm font-bold">Company Information</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-3">
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        {/* Email */}
                        <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Mail className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Email</p>
                            </div>
                            <p className="text-xs text-slate-900 dark:text-white break-all">{client.email}</p>
                        </div>

                        {/* Phone */}
                        {client.phone && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Phone className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Phone</p>
                                </div>
                                <p className="text-xs text-slate-900 dark:text-white">{client.phone}</p>
                            </div>
                        )}

                        {/* Contact Person */}
                        {client.contactPerson && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <User className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Contact Person</p>
                                </div>
                                <p className="text-xs text-slate-900 dark:text-white break-words">{client.contactPerson}</p>
                            </div>
                        )}

                        {/* GSTIN */}
                        {client.gstin && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <FileText className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">GSTIN</p>
                                </div>
                                <p className="font-mono text-xs text-slate-900 dark:text-white break-all">{client.gstin}</p>
                            </div>
                        )}

                        {/* Segment */}
                        {clientSegment && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Tag className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Segment</p>
                                </div>
                                <Badge variant="secondary" className="capitalize text-[10px] px-1.5 py-0">
                                    {clientSegment}
                                </Badge>
                            </div>
                        )}

                        {/* Billing Address */}
                        {client.billingAddress && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sm:col-span-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <MapPin className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Billing Address</p>
                                </div>
                                <p className="text-xs text-slate-900 dark:text-white whitespace-pre-line break-words leading-relaxed">
                                    {client.billingAddress}
                                </p>
                            </div>
                        )}

                        {/* Shipping Address */}
                        {client.shippingAddress && (
                            <div className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sm:col-span-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <MapPin className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Shipping Address</p>
                                </div>
                                <p className="text-xs text-slate-900 dark:text-white whitespace-pre-line break-words leading-relaxed">
                                    {client.shippingAddress}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* TABS + CONTENT */}
            <Tabs defaultValue="quotes" className="space-y-3">
                {/* tab bar – horizontal scroll on mobile */}
                <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <TabsList className="inline-flex sm:grid w-full sm:max-w-3xl grid-cols-5 h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1">
                        <TabsTrigger
                            value="quotes"
                            className="text-[10px] sm:text-xs py-2 px-2 sm:px-3 gap-1 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm rounded"
                        >
                            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="hidden sm:inline">Quotes</span>
                            <span className="sm:hidden">Q</span>
                            <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                                {clientQuotes.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="invoices"
                            className="text-[11px] sm:text-xs py-2.5 px-3 sm:px-4 gap-1.5 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="hidden sm:inline">Invoices</span>
                            <span className="sm:hidden">I</span>
                            <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                                {clientInvoices.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="theme"
                            className="text-[11px] sm:text-xs py-2.5 px-3 sm:px-4 gap-1.5 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="hidden sm:inline">Theme</span>
                            <span className="sm:hidden">Th</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="tags"
                            className="text-[11px] sm:text-xs py-2.5 px-3 sm:px-4 gap-1.5 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="hidden sm:inline">Tags</span>
                            <span className="sm:hidden">Tg</span>
                            <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                                {tags.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="communications"
                            className="text-[11px] sm:text-xs py-2.5 px-3 sm:px-4 gap-1.5 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="hidden sm:inline">History</span>
                            <span className="sm:hidden">H</span>
                            <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                                {communications.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* QUOTES */}
                <TabsContent value="quotes" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h3 className="text-base sm:text-lg font-semibold">Quotes</h3>
                        <PermissionGuard resource="quotes" action="create" tooltipText="Only Sales Managers and Sales Executives can create quotes">
                          <Link href={`/quotes/create?clientId=${clientId}`}>
                            <Button size="sm" className="w-full sm:w-auto btn-classy shadow-elegant-lg">
                              <Plus className="h-4 w-4 mr-2" />
                              <span>New quote</span>
                            </Button>
                          </Link>
                        </PermissionGuard>
                    </div>

                    {clientQuotes.length > 0 ? (
                        <div className="grid gap-3 sm:gap-4 grid-cols-1">
                            {clientQuotes.map((quote) => (
                                <Card
                                    key={quote.id}
                                    className="card-elegant hover-glow border-l-4 transition-all duration-300 hover:-translate-y-1"
                                    style={{
                                        borderLeftColor:
                                            quote.status === 'approved' ? 'rgb(34, 197, 94)' :
                                            quote.status === 'sent' ? 'rgb(59, 130, 246)' :
                                            quote.status === 'rejected' ? 'rgb(239, 68, 68)' :
                                            quote.status === 'invoiced' ? 'rgb(168, 85, 247)' :
                                            'rgb(156, 163, 175)'
                                    }}
                                >
                                    <CardContent className="p-3 sm:p-4 lg:p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Link href={`/quotes/${quote.id}`}>
                                                        <h4 className="font-bold text-sm sm:text-base lg:text-lg hover:text-primary cursor-pointer transition-colors">
                                                            {quote.quoteNumber}
                                                        </h4>
                                                    </Link>
                                                    <Badge
                                                        className={`${getStatusColor(
                                                            quote.status
                                                        )} text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 capitalize font-semibold`}
                                                    >
                                                        {quote.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm font-['Open_Sans']">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                        <span>
                                                            {format(
                                                                new Date(quote.createdAt),
                                                                "MMM dd, yyyy"
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                                                        <span className="font-bold text-primary text-sm sm:text-base">
                                                            ₹{Number(quote.total).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/quotes/${quote.id}`}>
                                                <Button variant="outline" size="sm" className="w-full sm:w-auto hover:bg-primary/10 hover:text-primary hover:border-primary">
                                                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                                    <span className="text-xs sm:text-sm">View details</span>
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed border-2">
                            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                                <div className="rounded-full bg-muted p-6 mb-4">
                                    <FileText className="h-12 w-12 sm:h-14 sm:w-14 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                                    No quotes yet
                                </h3>
                                <p className="text-sm text-muted-foreground font-['Open_Sans'] mb-6 max-w-md px-4">
                                    Create your first quote for this client and it will appear here.
                                </p>
                                <PermissionGuard resource="quotes" action="create" tooltipText="Only Sales Managers and Sales Executives can create quotes">
                                  <Link href={`/quotes/create?clientId=${clientId}`}>
                                    <Button size="lg" className="btn-classy shadow-elegant-lg">
                                      <Plus className="h-5 w-5 mr-2" />
                                      Create quote
                                    </Button>
                                  </Link>
                                </PermissionGuard>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* INVOICES */}
                <TabsContent value="invoices" className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Invoices</h3>
                    {clientInvoices.length > 0 ? (
                        <div className="grid gap-3 sm:gap-4 grid-cols-1">
                            {clientInvoices.map((invoice) => (
                                <Card
                                    key={invoice.id}
                                    className="card-elegant hover-glow border-l-4 transition-all duration-300 hover:-translate-y-1"
                                    style={{
                                        borderLeftColor:
                                            invoice.paymentStatus === 'paid' ? 'rgb(34, 197, 94)' :
                                            invoice.paymentStatus === 'partial' ? 'rgb(234, 179, 8)' :
                                            invoice.paymentStatus === 'overdue' ? 'rgb(239, 68, 68)' :
                                            'rgb(59, 130, 246)'
                                    }}
                                >
                                    <CardContent className="p-3 sm:p-4 lg:p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Link href={`/invoices/${invoice.id}`}>
                                                        <h4 className="font-bold text-sm sm:text-base lg:text-lg hover:text-primary cursor-pointer transition-colors">
                                                            {invoice.invoiceNumber}
                                                        </h4>
                                                    </Link>
                                                    <Badge
                                                        className={`${getStatusColor(
                                                            invoice.paymentStatus
                                                        )} text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 capitalize font-semibold`}
                                                    >
                                                        {invoice.paymentStatus}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm font-['Open_Sans']">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                        <span>
                                                            Due: {format(
                                                                new Date(invoice.dueDate),
                                                                "MMM dd, yyyy"
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                                                        <span className="font-bold text-primary text-sm sm:text-base">
                                                            ₹{Number(invoice.total).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/invoices/${invoice.id}`}>
                                                <Button variant="outline" size="sm" className="w-full sm:w-auto hover:bg-primary/10 hover:text-primary hover:border-primary">
                                                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                                    <span className="text-xs sm:text-sm">View details</span>
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed border-2">
                            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                                <div className="rounded-full bg-muted p-6 mb-4">
                                    <DollarSign className="h-12 w-12 sm:h-14 sm:w-14 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                                    No invoices yet
                                </h3>
                                <p className="text-sm text-muted-foreground font-['Open_Sans'] max-w-md px-4">
                                    When quotes are converted to invoices, they will show up here.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* THEME */}
                <TabsContent value="theme" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm sm:text-base">PDF theme settings</span>
                                    <span className="text-[10px] sm:text-[11px] lg:text-xs text-muted-foreground font-normal">
                    Control how quotes & invoices look for this client.
                  </span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                            {/* Segment Selector */}
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-semibold block">
                                    Client segment
                                </label>
                                <Select
                                    value={selectedSegment || clientSegment || ""}
                                    onValueChange={setSelectedSegment}
                                >
                                    <SelectTrigger className="h-10 text-sm">
                                        <SelectValue placeholder="Select segment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="enterprise">
                                            Enterprise - Large corporations
                                        </SelectItem>
                                        <SelectItem value="corporate">
                                            Corporate - Standard business
                                        </SelectItem>
                                        <SelectItem value="startup">
                                            Startup - Tech companies
                                        </SelectItem>
                                        <SelectItem value="government">
                                            Government - Public sector
                                        </SelectItem>
                                        <SelectItem value="education">
                                            Education - Schools & universities
                                        </SelectItem>
                                        <SelectItem value="creative">
                                            Creative - Design agencies
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {suggestedTheme && (
                                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5">
                                        Suggested theme for this segment:{" "}
                                        <strong>{suggestedTheme.displayName}</strong>
                                    </p>
                                )}
                            </div>

                            {/* Theme Selector */}
                            <div className="space-y-3">
                                <label className="text-xs sm:text-sm font-semibold block">
                                    Preferred theme
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
                                    {themes.map((theme) => {
                                        const selectedValue =
                                            selectedTheme || clientPreferredTheme || "";
                                        const isSelected = selectedValue === theme.name;
                                        const isSuggested = suggestedTheme?.name === theme.name;

                                        return (
                                            <Card
                                                key={theme.name}
                                                className={`cursor-pointer transition-all hover:shadow-md ${
                                                    isSelected ? "ring-2 ring-primary" : ""
                                                }`}
                                                onClick={() => setSelectedTheme(theme.name)}
                                            >
                                                <CardContent className="p-3 sm:p-3.5 lg:p-4 space-y-2 sm:space-y-2.5">
                                                    {/* Color Preview */}
                                                    <div
                                                        className="h-12 sm:h-14 lg:h-16 rounded-md mb-1.5 relative overflow-hidden"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                                                        }}
                                                    >
                                                        {isSuggested && (
                                                            <Badge
                                                                className="absolute top-1.5 right-1.5 text-[9px] sm:text-[10px] lg:text-xs"
                                                                variant="secondary"
                                                            >
                                                                Suggested
                                                            </Badge>
                                                        )}
                                                        {isSelected && (
                                                            <Badge
                                                                className="absolute bottom-1.5 left-1.5 text-[9px] sm:text-[10px] lg:text-xs"
                                                                variant="outline"
                                                            >
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <h4 className="font-semibold text-xs sm:text-sm mb-0.5">
                                                        {theme.displayName}
                                                    </h4>
                                                    <p className="text-[10px] sm:text-[11px] lg:text-xs text-muted-foreground line-clamp-2">
                                                        {theme.description}
                                                    </p>

                                                    <div className="flex gap-2 sm:gap-3 mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <div
                                                                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                                                                style={{ backgroundColor: theme.colors.primary }}
                                                            />
                                                            <span className="text-[11px] text-muted-foreground">
                                Primary
                              </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: theme.colors.accent }}
                                                            />
                                                            <span className="text-[11px] text-muted-foreground">
                                Accent
                              </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedSegment(clientSegment || "");
                                        setSelectedTheme(clientPreferredTheme || "");
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleThemeUpdate}
                                    disabled={updateThemeMutation.isPending}
                                >
                                    {updateThemeMutation.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Save theme settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAGS */}
                <TabsContent value="tags" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold">Client tags</h3>
                    </div>
                    <Card>
                        <CardContent className="pt-5 sm:pt-6">
                            <form
                                onSubmit={handleAddTag}
                                className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4"
                            >
                                <Input
                                    placeholder="Add a tag (e.g., VIP, Wholesale, etc.)"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    data-testid="input-new-tag"
                                    className="text-sm h-10"
                                />
                                <Button
                                    type="submit"
                                    disabled={!newTag.trim() || addTagMutation.isPending}
                                    size="sm"
                                    className="whitespace-nowrap w-full sm:w-auto"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add
                                </Button>
                            </form>
                            <div className="flex flex-wrap gap-2">
                                {tags.length > 0 ? (
                                    tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="secondary"
                                            className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm flex items-center gap-1.5"
                                        >
                                            <Tag className="h-3 w-3" />
                                            <span className="max-w-[100px] sm:max-w-[120px] lg:max-w-none truncate">
                        {tag.tag}
                      </span>
                                            <button
                                                type="button"
                                                onClick={() => removeTagMutation.mutate(tag.id)}
                                                className="ml-0.5 hover:text-destructive"
                                                data-testid={`button-remove-tag-${tag.id}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-xs sm:text-sm text-muted-foreground font-['Open_Sans']">
                                        No tags yet. Add tags to organise and categorise this client.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* COMMUNICATIONS */}
                <TabsContent value="communications" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold">
                            Communication history
                        </h3>
                        <Dialog
                            open={isCommunicationDialogOpen}
                            onOpenChange={setIsCommunicationDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button size="sm" className="self-start w-full sm:w-auto">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Log communication
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] max-w-[600px] p-4 sm:p-6">
                                <DialogHeader className="space-y-2 sm:space-y-3">
                                    <DialogTitle className="text-lg sm:text-xl">Log communication</DialogTitle>
                                    <DialogDescription className="text-xs sm:text-sm">
                                        Record a communication with this client.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...communicationForm}>
                                    <form
                                        onSubmit={communicationForm.handleSubmit(
                                            onCommunicationSubmit
                                        )}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={communicationForm.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">Type *</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 text-sm">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="email">Email</SelectItem>
                                                            <SelectItem value="call">Phone call</SelectItem>
                                                            <SelectItem value="meeting">Meeting</SelectItem>
                                                            <SelectItem value="note">Note</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={communicationForm.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">Subject</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Brief subject or title"
                                                            className="text-sm h-10"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={communicationForm.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">Message *</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Communication details..."
                                                            rows={4}
                                                            className="text-sm min-h-[96px]"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full text-sm"
                                            disabled={createCommunicationMutation.isPending}
                                        >
                                            {createCommunicationMutation.isPending && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Log communication
                                        </Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {communications.length > 0 ? (
                        <div className="space-y-3">
                            {communications.map((comm) => (
                                <Card
                                    key={comm.id}
                                    className="border bg-background/95 hover:bg-muted/70 transition-colors"
                                >
                                    <CardContent className="p-4 sm:p-4.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0">
                                                    {getCommunicationIcon(comm.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <Badge
                                                            variant="outline"
                                                            className="capitalize text-[10px] sm:text-xs"
                                                        >
                                                            {comm.type}
                                                        </Badge>
                                                        <span className="text-[11px] sm:text-xs text-muted-foreground">
                              {format(
                                  new Date(comm.date),
                                  "MMM dd, yyyy 'at' h:mm a"
                              )}
                            </span>
                                                    </div>
                                                    {comm.subject && (
                                                        <h4 className="font-semibold text-sm mb-1 truncate">
                                                            {comm.subject}
                                                        </h4>
                                                    )}
                                                    <p className="text-xs sm:text-sm text-muted-foreground font-['Open_Sans'] whitespace-pre-line">
                                                        {comm.message}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    deleteCommunicationMutation.mutate(comm.id)
                                                }
                                                data-testid={`button-delete-comm-${comm.id}`}
                                                className="shrink-0"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                                <MessageSquare className="h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground mb-4 opacity-60" />
                                <h3 className="text-base sm:text-lg font-semibold mb-2">
                                    No communications logged
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground font-['Open_Sans'] mb-4 max-w-sm">
                                    Start tracking your interactions with this client.
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => setIsCommunicationDialogOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Log first communication
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
        </div>
    );
}
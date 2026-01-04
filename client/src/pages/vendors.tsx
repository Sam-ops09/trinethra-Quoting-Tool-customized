import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Building2, Mail, Phone, MapPin, Edit, Trash2, Loader2, Home, ChevronRight, Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { PermissionGuard } from "@/components/permission-guard";
import { Separator } from "@/components/ui/separator";

// Types (Unchanged)
interface Vendor {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    gstin?: string;
    contactPerson?: string;
    paymentTerms?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
}

type FormData = {
    name: string;
    email: string;
    phone: string;
    address: string;
    gstin: string;
    contactPerson: string;
    paymentTerms: string;
    notes: string;
};

// --- Component Start ---

export default function Vendors() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [dialog, setDialog] = useState(false);
    const [editing, setEditing] = useState<Vendor | null>(null);
    const [form, setForm] = useState<FormData>({
        name: "", email: "", phone: "", address: "", gstin: "", contactPerson: "", paymentTerms: "", notes: ""
    });

    // Data Fetching
    const { data: vendors, isLoading } = useQuery<Vendor[]>({ queryKey: ["/api/vendors"] });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: FormData) => apiRequest("POST", "/api/vendors", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
            setDialog(false);
            reset();
            toast({ title: "Success", description: "Vendor created." });
        },
        onError: () => toast({ title: "Error", description: "Failed to create.", variant: "destructive" })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) => apiRequest("PATCH", `/api/vendors/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
            setDialog(false);
            setEditing(null);
            reset();
            toast({ title: "Success", description: "Vendor updated." });
        },
        onError: () => toast({ title: "Error", description: "Failed to update.", variant: "destructive" })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/vendors/${id}`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
            toast({ title: "Success", description: "Vendor deleted." });
        },
        onError: () => toast({ title: "Error", description: "Failed to delete.", variant: "destructive" })
    });

    // Helpers
    const reset = () => setForm({ name: "", email: "", phone: "", address: "", gstin: "", contactPerson: "", paymentTerms: "", notes: "" });

    const edit = (v: Vendor) => {
        setEditing(v);
        setForm({ name: v.name, email: v.email, phone: v.phone || "", address: v.address || "", gstin: v.gstin || "", contactPerson: v.contactPerson || "", paymentTerms: v.paymentTerms || "", notes: v.notes || "" });
        setDialog(true);
    };

    const submit = () => {
        if (!form.name || !form.email) {
            toast({ title: "Error", description: "Name and email required.", variant: "destructive" });
            return;
        }
        editing ? updateMutation.mutate({ id: editing.id, data: form }) : createMutation.mutate(form);
    };

    // Filtering
    const q = search.toLowerCase().trim();
    const filtered = vendors?.filter((v) => !q || v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || (v.contactPerson || "").toLowerCase().includes(q));

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="min-h-screen">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
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
                        <Building2 className="h-3.5 w-3.5" />
                        Vendors
                    </span>
                </nav>


                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                            Vendor Directory
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                            Manage procurement partners
                        </p>
                    </div>
                    <PermissionGuard resource="vendors" action="create">
                        <Button
                            onClick={() => { setEditing(null); reset(); setDialog(true); }}
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Add Vendor</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </PermissionGuard>
                </div>

                {/* Search & Stats */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="relative w-full sm:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search vendors..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-10"
                                />
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-400">Total:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{vendors?.length || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-emerald-600 dark:text-emerald-400">Active:</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{vendors?.filter(v => v.isActive).length || 0}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Vendor List */}
                {filtered && filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((v) => (
                            <Card key={v.id} className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white truncate">
                                                {v.name}
                                            </CardTitle>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">
                                                {v.contactPerson || "No contact person"}
                                            </p>
                                        </div>
                                        <Badge className={`shrink-0 text-xs px-2 py-0.5 ${
                                            v.isActive
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                        }`}>
                                            {v.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                                            <a href={`mailto:${v.email}`} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white truncate">
                                                {v.email}
                                            </a>
                                        </div>
                                        {v.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                                                <a href={`tel:${v.phone}`} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                                                    {v.phone}
                                                </a>
                                            </div>
                                        )}
                                        {v.gstin && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Hash className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                                                <span className="text-slate-700 dark:text-slate-300 truncate">
                                                    {v.gstin}
                                                </span>
                                            </div>
                                        )}
                                        {v.address && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
                                                <span className="text-slate-700 dark:text-slate-300 line-clamp-2">
                                                    {v.address}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <Separator />
                                    <div className="flex gap-2">
                                        <PermissionGuard resource="vendors" action="edit" tooltipText="Only Purchase/Operations can edit vendors">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 h-8"
                                            onClick={() => edit(v)}
                                          >
                                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                                            Edit
                                          </Button>
                                        </PermissionGuard>
                                        <PermissionGuard resource="vendors" action="delete" tooltipText="Only Purchase/Operations can delete vendors">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 border-red-200"
                                            onClick={() => confirm(`Delete ${v.name}?`) && deleteMutation.mutate(v.id)}
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </PermissionGuard>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
                        <CardContent className="py-16 text-center">
                            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                                <div className="rounded-full bg-slate-100 dark:bg-slate-900 p-6">
                                    <Building2 className="h-12 w-12 text-slate-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        No Vendors Found
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {q ? "Try adjusting your search criteria." : "Get started by adding your first vendor."}
                                    </p>
                                </div>
                                {!q && (
                                    <PermissionGuard resource="vendors" action="create">
                                        <Button
                                            onClick={() => { setEditing(null); reset(); setDialog(true); }}
                                            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add New Vendor
                                        </Button>
                                    </PermissionGuard>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Dialog (Modal) */}
                <Dialog open={dialog} onOpenChange={(open) => { if (!open) { setDialog(false); setEditing(null); reset(); } }}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">
                                {editing ? "Edit Vendor Details" : "Add New Vendor"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    label="Vendor Name"
                                    name="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Acme Supplies"
                                    required={true}
                                />
                                <FormInput
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="finance@acme.com"
                                    required={true}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    label="Phone"
                                    name="phone"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                />
                                <FormInput
                                    label="Contact Person"
                                    name="contactPerson"
                                    value={form.contactPerson}
                                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>

                            <FormInput
                                label="GSTIN"
                                name="gstin"
                                value={form.gstin}
                                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                                placeholder="22AAAAA0000A1Z5"
                                helpText="Used for tax and invoicing."
                            />

                            <FormTextarea
                                label="Address"
                                name="address"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Complete mailing address"
                                rows={2}
                            />

                            <FormInput
                                label="Payment Terms"
                                name="paymentTerms"
                                value={form.paymentTerms}
                                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                                placeholder="Net 30 days"
                                helpText="e.g., Net 30, COD, 50% Advance."
                            />

                            <FormTextarea
                                label="Internal Notes"
                                name="notes"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="Any special instructions or history..."
                                rows={2}
                            />

                            <DialogFooter className="pt-4 gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="h-9 text-sm"
                                    onClick={() => { setDialog(false); setEditing(null); reset(); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-9 text-sm bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    {editing ? "Save Changes" : "Create Vendor"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

// --- Helper Components ---

function FormInput({ label, name, value, onChange, placeholder, type = "text", required = false, helpText }: {
    label: string,
    name: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder?: string,
    type?: string,
    required?: boolean,
    helpText?: string
}) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={name} className="text-sm font-medium text-slate-900 dark:text-white">
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            <Input
                id={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="h-10"
            />
            {helpText && <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
        </div>
    );
}

function FormTextarea({ label, name, value, onChange, placeholder, rows = 2, required = false }: {
    label: string,
    name: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
    placeholder?: string,
    rows?: number,
    required?: boolean
}) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={name} className="text-sm font-medium text-slate-900 dark:text-white">
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            <Textarea
                id={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                required={required}
                className="resize-none"
            />
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
                <Skeleton className="h-5 w-48 mb-4" />
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <Skeleton className="h-12 w-full mb-6 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { insertClientSchema } from "@shared/schema";
import { z } from "zod";

export const clientFormSchema = insertClientSchema.omit({
    createdBy: true,
    createdAt: true,
    isActive: true,
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const SEGMENT_OPTIONS = [
    { 
        value: "enterprise", 
        label: "Enterprise – Large corporations",
        color: "from-indigo-500/10 to-purple-500/10",
        borderColor: "border-indigo-200 dark:border-indigo-800",
        textColor: "text-indigo-700 dark:text-indigo-300",
        bgColor: "bg-indigo-500/10"
    },
    { 
        value: "corporate", 
        label: "Corporate – Standard business",
        color: "from-blue-500/10 to-cyan-500/10",
        borderColor: "border-blue-200 dark:border-blue-800",
        textColor: "text-blue-700 dark:text-blue-300",
        bgColor: "bg-blue-500/10"
    },
    { 
        value: "startup", 
        label: "Startup – Tech companies",
        color: "from-emerald-500/10 to-teal-500/10",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        textColor: "text-emerald-700 dark:text-emerald-300",
        bgColor: "bg-emerald-500/10"
    },
    { 
        value: "government", 
        label: "Government – Public sector",
        color: "from-slate-500/10 to-gray-500/10",
        borderColor: "border-slate-200 dark:border-slate-700",
        textColor: "text-slate-700 dark:text-slate-300",
        bgColor: "bg-slate-500/10"
    },
    { 
        value: "education", 
        label: "Education – Schools & universities",
        color: "from-amber-500/10 to-orange-500/10",
        borderColor: "border-amber-200 dark:border-amber-800",
        textColor: "text-amber-700 dark:text-amber-300",
        bgColor: "bg-amber-500/10"
    },
    { 
        value: "creative", 
        label: "Creative – Design agencies",
        color: "from-pink-500/10 to-rose-500/10",
        borderColor: "border-pink-200 dark:border-pink-800",
        textColor: "text-pink-700 dark:text-pink-300",
        bgColor: "bg-pink-500/10"
    },
];

interface ClientFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<any>;
    onSubmit: (data: any) => void;
    isEditing: boolean;
    isPending: boolean;
    canViewGSTIN: boolean;
    canManageSegments: boolean;
    canViewBilling: boolean;
    canViewShipping: boolean;
}

export function ClientFormDialog({
    open,
    onOpenChange,
    form,
    onSubmit,
    isEditing,
    isPending,
    canViewGSTIN,
    canManageSegments,
    canViewBilling,
    canViewShipping,
}: ClientFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[min(100%-1rem,48rem)] max-h-[92vh] overflow-y-auto p-0 border-none shadow-2xl">
                <DialogHeader className="px-4 xs:px-5 sm:px-6 pt-4 xs:pt-5 pb-3 xs:pb-4 border-b bg-muted/30 backdrop-blur-sm">
                    <DialogTitle className="text-lg xs:text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {isEditing ? "Edit Client Details" : "Add New Client"}
                    </DialogTitle>
                    <DialogDescription className="text-[11px] xs:text-xs sm:text-sm">
                        {isEditing ? "Update information for existing client record" : "Create a new client record in the system"}
                    </DialogDescription>
                </DialogHeader>
                <div className="px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6 bg-background/50">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 xs:space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs xs:text-sm font-semibold">Client Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="ABC Corporation" className="h-10 xs:h-11 text-xs xs:text-sm mt-1.5 focus-visible:ring-primary/30 transition-shadow" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] xs:text-xs mt-1" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs xs:text-sm font-semibold">Email Representative *</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="contact@example.com" className="h-10 xs:h-11 text-xs xs:text-sm mt-1.5 focus-visible:ring-primary/30 transition-shadow" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] xs:text-xs mt-1" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs xs:text-sm font-semibold">Phone Contact</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ""} placeholder="+91 98765 43210" className="h-10 xs:h-11 text-xs xs:text-sm mt-1.5 focus-visible:ring-primary/30 transition-shadow" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] xs:text-xs mt-1" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contactPerson"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs xs:text-sm font-semibold">Contact Person Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ""} placeholder="John Doe" className="h-10 xs:h-11 text-xs xs:text-sm mt-1.5 focus-visible:ring-primary/30 transition-shadow" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] xs:text-xs mt-1" />
                                        </FormItem>
                                    )}
                                />
                                 {canViewGSTIN && (
                                    <FormField
                                        control={form.control}
                                        name="gstin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs xs:text-sm font-semibold">GST Identification Number</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ""} placeholder="22AAAAA0000A1Z5" className="h-10 xs:h-11 text-xs xs:text-sm mt-1.5 focus-visible:ring-primary/30 transition-shadow uppercase" />
                                                </FormControl>
                                                <FormMessage className="text-[10px] xs:text-xs mt-1" />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {canManageSegments && (
                                    <FormField
                                        control={form.control}
                                        name="segment"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs xs:text-sm font-semibold">Business Segment</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 xs:h-11 text-xs xs:text-sm mt-1.5 focus:ring-primary/30 transition-shadow">
                                                            <SelectValue placeholder="Select segment" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {SEGMENT_OPTIONS.map((seg) => (
                                                            <SelectItem key={seg.value} value={seg.value} className="text-xs xs:text-sm focus:bg-primary/10">
                                                                {seg.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px] xs:text-xs mt-1" />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                                {canViewBilling && (
                                    <FormField
                                        control={form.control}
                                        name="billingAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs xs:text-sm font-semibold">Billing Address</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        value={field.value || ""}
                                                        placeholder="123 Main St, City"
                                                        className="min-h-[80px] xs:min-h-[90px] text-xs xs:text-sm resize-none mt-1.5 focus-visible:ring-primary/30 transition-shadow"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px] xs:text-xs mt-1" />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {canViewShipping && (
                                    <FormField
                                        control={form.control}
                                        name="shippingAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs xs:text-sm font-semibold">Shipping Address</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        value={field.value || ""}
                                                        placeholder="Leave blank if same as billing"
                                                        className="min-h-[80px] xs:min-h-[90px] text-xs xs:text-sm resize-none mt-1.5 focus-visible:ring-primary/30 transition-shadow"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px] xs:text-xs mt-1" />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                            <div className="flex gap-2 xs:gap-3 pt-4 xs:pt-6 border-t border-slate-200 dark:border-slate-800/50">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onOpenChange(false)}
                                    className="flex-1 h-10 xs:h-11 text-xs xs:text-sm hover:bg-muted"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isPending} 
                                    className="flex-1 h-10 xs:h-11 text-xs xs:text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
                                >
                                    {isPending && <Loader2 className="mr-2 h-3.5 xs:h-4 w-3.5 xs:w-4 animate-spin" />}
                                    {isEditing ? "Update Client Records" : "Confirm & Create Client"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

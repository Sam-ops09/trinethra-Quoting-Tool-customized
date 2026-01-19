import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Trash2, Edit, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    triggerType: z.enum(["discount_percentage", "total_amount"]),
    thresholdValue: z.string().min(1, "Threshold is required"),
    requiredRole: z.enum(["sales_manager", "admin"]), // Add more roles if needed
    isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function ApprovalSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingRule, setEditingRule] = useState<any>(null);

    const { data: rules, isLoading } = useQuery({
        queryKey: ["approval-rules"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/approval-rules");
            return res.json();
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            triggerType: "discount_percentage",
            thresholdValue: "",
            requiredRole: "sales_manager",
            isActive: true,
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: FormValues) => {
            const res = await apiRequest("POST", "/api/approval-rules", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["approval-rules"] });
            toast({
                title: "Success",
                description: "Approval rule created successfully",
            });
            form.reset();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create rule",
                variant: "destructive",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: FormValues }) => {
            const res = await apiRequest("PATCH", `/api/approval-rules/${id}`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["approval-rules"] });
            toast({
                title: "Success",
                description: "Approval rule updated successfully",
            });
            setEditingRule(null);
            form.reset({
                name: "",
                triggerType: "discount_percentage",
                thresholdValue: "",
                requiredRole: "sales_manager",
                isActive: true,
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update rule",
                variant: "destructive",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/approval-rules/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["approval-rules"] });
            toast({
                title: "Success",
                description: "Approval rule deleted successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete rule",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: FormValues) => {
        if (editingRule) {
            updateMutation.mutate({ id: editingRule.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (rule: any) => {
        setEditingRule(rule);
        form.reset({
            name: rule.name,
            triggerType: rule.triggerType,
            thresholdValue: String(rule.thresholdValue),
            requiredRole: rule.requiredRole,
            isActive: rule.isActive,
        });
    };

    const handleCancelEdit = () => {
        setEditingRule(null);
        form.reset({
            name: "",
            triggerType: "discount_percentage",
            thresholdValue: "",
            requiredRole: "sales_manager",
            isActive: true,
        });
    };

    if (isLoading) {
        return <Loader2 className="h-8 w-8 animate-spin" />;
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>{editingRule ? "Edit Rule" : "Create New Rule"}</CardTitle>
                    <CardDescription>
                        Define conditions that trigger approval checks.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rule Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. High Discount" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="triggerType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Condition Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="discount_percentage">Discount %</SelectItem>
                                                    <SelectItem value="total_amount">Total Amount</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="thresholdValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Threshold Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="requiredRole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Required Role</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="sales_manager">Sales Manager</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active Strategy</FormLabel>
                                            <CardDescription>
                                                Enable or disable this rule
                                            </CardDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-2">
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editingRule ? "Update Rule" : "Create Rule"}
                                </Button>
                                {editingRule && (
                                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Rules</CardTitle>
                    <CardDescription>List of active approval rules.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No rules defined.
                                    </TableCell>
                                </TableRow>
                            )}
                            {rules?.map((rule: any) => (
                                <TableRow key={rule.id}>
                                    <TableCell>
                                        <div className="font-medium">{rule.name}</div>
                                        {rule.isActive ? (
                                            <div className="flex items-center text-xs text-green-600 mt-1">
                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                <XCircle className="h-3 w-3 mr-1" /> Inactive
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {rule.triggerType === "discount_percentage" ? "Discount > " : "Total > "}
                                            {Number(rule.thresholdValue).toLocaleString()}
                                            {rule.triggerType === "discount_percentage" ? "%" : ""}
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {rule.requiredRole.replace("_", " ")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(rule)}
                                            >
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteMutation.mutate(rule.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

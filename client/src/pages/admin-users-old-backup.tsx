import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    Users,
    Shield,
    UserCheck,
    UserCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";

const userFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    backupEmail: z
        .string()
        .email("Invalid backup email address")
        .optional()
        .or(z.literal("")),
    role: z.enum(["admin", "sales_executive", "sales_manager", "purchase_operations", "finance_accounts", "viewer"]),
    status: z.enum(["active", "inactive"]),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .optional()
        .or(z.literal("")),
});

type RoleFilter = "all" | "admin" | "sales_executive" | "sales_manager" | "purchase_operations" | "finance_accounts" | "viewer";
type StatusFilter = "all" | "active" | "inactive";

export default function AdminUsers() {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { toast } = useToast();

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["/api/users"],
    });

    const createForm = useForm<z.infer<typeof userFormSchema>>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: "",
            email: "",
            backupEmail: "",
            role: "sales_executive",
            status: "active",
            password: "",
        },
    });

    const editForm = useForm<z.infer<typeof userFormSchema>>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: "",
            email: "",
            backupEmail: "",
            role: "sales_executive",
            status: "active",
            password: "",
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: z.infer<typeof userFormSchema>) => {
            return await apiRequest("POST", "/api/users", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            setIsCreateDialogOpen(false);
            createForm.reset();
            toast({
                title: "User created",
                description: "New user has been added successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Failed to create user",
                description: error?.message || "Something went wrong.",
                variant: "destructive",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({
                               id,
                               data,
                           }: {
            id: string;
            data: z.infer<typeof userFormSchema>;
        }) => {
            return await apiRequest("PUT", `/api/users/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            setIsEditDialogOpen(false);
            setEditingUser(null);
            editForm.reset();
            toast({
                title: "User updated",
                description: "User information has been updated successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Failed to update user",
                description: error?.message || "Something went wrong.",
                variant: "destructive",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return await apiRequest("DELETE", `/api/users/${id}`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            toast({
                title: "User deleted",
                description: "User has been removed successfully.",
            });
        },
    });

    const handleCreateSubmit = async (values: z.infer<typeof userFormSchema>) => {
        await createMutation.mutateAsync(values);
    };

    const handleEditSubmit = async (values: z.infer<typeof userFormSchema>) => {
        if (!editingUser) return;
        await updateMutation.mutateAsync({ id: editingUser.id, data: values });
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        editForm.reset({
            name: user.name,
            email: user.email,
            backupEmail: user.backupEmail || "",
            role: user.role as "admin" | "sales_executive" | "sales_manager" | "purchase_operations" | "finance_accounts" | "viewer",
            status: user.status as "active" | "inactive",
            password: "",
        });
        setIsEditDialogOpen(true);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "sales_executive":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "sales_manager":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            case "purchase_operations":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "finance_accounts":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "viewer":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case "admin":
                return "Admin";
            case "sales_executive":
                return "Sales Executive";
            case "sales_manager":
                return "Sales Manager";
            case "purchase_operations":
                return "Purchase / Ops";
            case "finance_accounts":
                return "Finance";
            case "viewer":
                return "Viewer";
            default:
                return role;
        }
    };

    const totalUsers = users?.length ?? 0;
    const activeUsers = users?.filter((u) => u.status === "active").length ?? 0;
    const adminUsers = users?.filter((u) => u.role === "admin").length ?? 0;

    const filteredUsers = users?.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole =
            roleFilter === "all" ? true : user.role === roleFilter;

        const matchesStatus =
            statusFilter === "all" ? true : user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-950 dark:via-blue-950/10 dark:to-gray-950">
                <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                    <Skeleton className="h-8 sm:h-10 w-48 sm:w-64" />
                    <Skeleton className="h-24 w-full" />
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 sm:h-20" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-4 sm:space-y-6">
                {/* Page Header with Breadcrumbs */}
                <PageHeader
                    title="User Management"
                    description="Control who can access Company name-QuoteFlow and what they can do"
                    breadcrumbs={[
                        { label: "Admin", href: "/admin/users" },
                        { label: "User Management", icon: Users }
                    ]}
                    refreshQueryKeys={[["/api/users"]]}
                    actions={
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    data-testid="button-create-user"
                                    className="w-full sm:w-auto btn-classy shadow-elegant-lg"
                                    size="lg"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add User
                                </Button>
                            </DialogTrigger>

                                {/* CREATE USER DIALOG */}
                                <DialogContent
                                    className="
                    w-[min(100%-2rem,36rem)]
                    max-h-[80vh]
                    p-0
                    rounded-2xl
                    overflow-hidden
                    flex
                    flex-col
                  "
                                >
                                    <DialogHeader className="px-4 sm:px-6 pt-4 pb-2 border-b text-center space-y-1 bg-muted/40">
                                        <DialogTitle className="text-lg sm:text-xl font-semibold">
                                            Create New User
                                        </DialogTitle>
                                        <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                                            Invite a teammate and assign their role and status.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto bg-background">
                                        <Form {...createForm}>
                                            <form
                                                onSubmit={createForm.handleSubmit(handleCreateSubmit)}
                                                className="space-y-3 sm:space-y-4"
                                            >
                                                <FormField
                                                    control={createForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs sm:text-sm">
                                                                Full Name <span className="text-destructive">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    data-testid="input-user-name"
                                                                    className="text-sm"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-[11px] sm:text-xs" />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={createForm.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs sm:text-sm">
                                                                Email <span className="text-destructive">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    type="email"
                                                                    data-testid="input-user-email"
                                                                    className="text-sm"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-[11px] sm:text-xs" />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <FormField
                                                        control={createForm.control}
                                                        name="backupEmail"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs sm:text-sm">
                                                                    Backup Email{" "}
                                                                    <span className="text-muted-foreground">
                                    (optional)
                                  </span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        type="email"
                                                                        data-testid="input-user-backup-email"
                                                                        className="text-sm"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[11px] sm:text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={createForm.control}
                                                        name="password"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs sm:text-sm">
                                                                    Password <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        type="password"
                                                                        data-testid="input-user-password"
                                                                        className="text-sm"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[11px] sm:text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <FormField
                                                        control={createForm.control}
                                                        name="role"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs sm:text-sm">
                                                                    Role <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger
                                                                            data-testid="select-user-role"
                                                                            className="text-sm"
                                                                        >
                                                                            <SelectValue placeholder="Select role" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="admin">Administrator</SelectItem>
                                                                        <SelectItem value="sales_executive">Sales Executive</SelectItem>
                                                                        <SelectItem value="sales_manager">Sales Manager</SelectItem>
                                                                        <SelectItem value="purchase_operations">Purchase / Operations</SelectItem>
                                                                        <SelectItem value="finance_accounts">Finance / Accounts</SelectItem>
                                                                        <SelectItem value="viewer">Viewer</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-[11px] sm:text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={createForm.control}
                                                        name="status"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs sm:text-sm">
                                                                    Status <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger
                                                                            data-testid="select-user-status"
                                                                            className="text-sm"
                                                                        >
                                                                            <SelectValue placeholder="Select status" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="active">Active</SelectItem>
                                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-[11px] sm:text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="w-full text-sm mt-1"
                                                    disabled={createMutation.isPending}
                                                    data-testid="button-submit-user"
                                                >
                                                    {createMutation.isPending && (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    )}
                                                    Create User
                                                </Button>
                                            </form>
                                        </Form>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        }
                    />

                    {/* Stats Cards */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                        <Card className="card-elegant hover-glow relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                            <CardContent className="p-4 sm:p-6 relative">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground font-['Open_Sans']">
                                    Total Users
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold mt-1">
                                    {totalUsers}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="card-elegant hover-glow relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
                            <CardContent className="p-4 sm:p-6 relative">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                                        <UserCheck className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground font-['Open_Sans']">
                                    Active Users
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold mt-1 text-green-600">
                                    {activeUsers}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="card-elegant hover-glow relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                            <CardContent className="p-4 sm:p-6 relative">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <Shield className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground font-['Open_Sans']">
                                    Administrators
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold mt-1 text-red-600">
                                    {adminUsers}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* SEARCH + FILTERS */}
                    <Card className="card-elegant">
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center md:justify-between">
                            <div className="relative w-full md:max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users by name or email..."
                                    className="pl-10 w-full text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    data-testid="input-search-users"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                                {/* Role pills */}
                                <div className="flex flex-wrap gap-1.5 bg-muted/40 rounded-full px-1.5 py-1">
                                    {(["all", "admin", "sales_executive", "sales_manager", "purchase_operations", "finance_accounts", "viewer"] as RoleFilter[]).map(
                                        (role) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setRoleFilter(role)}
                                                className={[
                                                    "px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap",
                                                    roleFilter === role
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-muted-foreground hover:bg-muted",
                                                ].join(" ")}
                                            >
                                                {role === "all"
                                                    ? "All roles"
                                                    : role === "sales_executive"
                                                    ? "Sales Exec"
                                                    : role === "sales_manager"
                                                    ? "Sales Mgr"
                                                    : role === "purchase_operations"
                                                    ? "Purchase"
                                                    : role === "finance_accounts"
                                                    ? "Finance"
                                                    : role.charAt(0).toUpperCase() + role.slice(1)}
                                            </button>
                                        ),
                                    )}
                                </div>

                                {/* Status pills */}
                                <div className="flex flex-wrap gap-1.5 bg-muted/40 rounded-full px-1.5 py-1">
                                    {(["all", "active", "inactive"] as StatusFilter[]).map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setStatusFilter(status)}
                                            className={[
                                                "px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-colors",
                                                statusFilter === status
                                                    ? status === "active"
                                                        ? "bg-success text-success-foreground"
                                                        : status === "inactive"
                                                            ? "bg-secondary text-secondary-foreground"
                                                            : "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:bg-muted",
                                            ].join(" ")}
                                        >
                                            {status === "all"
                                                ? "All statuses"
                                                : status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* MAIN GRID: LIST + STATS */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Role Legend Card */}
                    <Card className="card-elegant">
                        <CardHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle className="text-base sm:text-lg">Role Legend</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-red-500/5 to-transparent border hover:border-red-500/30 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                        <Shield className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Admin</p>
                                        <p className="text-xs text-muted-foreground">Full access</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border hover:border-blue-500/30 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <UserCircle2 className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Sales Executive</p>
                                        <p className="text-xs text-muted-foreground">Create quotes</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent border hover:border-purple-500/30 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                        <UserCheck className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Sales Manager</p>
                                        <p className="text-xs text-muted-foreground">Approve quotes</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-green-500/5 to-transparent border hover:border-green-500/30 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                        <Users className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Purchase/Ops</p>
                                        <p className="text-xs text-muted-foreground">Manage POs</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-yellow-500/5 to-transparent border hover:border-yellow-500/30 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                                        <UserCircle2 className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Finance</p>
                                        <p className="text-xs text-muted-foreground">Manage payments</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-500/5 to-transparent border hover:border-gray-500/30 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-gray-500/10 flex items-center justify-center shrink-0">
                                        <UserCircle2 className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Viewer</p>
                                        <p className="text-xs text-muted-foreground">Read-only</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* USERS LIST */}
                    <Card className="card-elegant hover-glow">
                        <CardHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-500/5 to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <UserCircle2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-base sm:text-lg">All Users</CardTitle>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {filteredUsers?.length || 0} users
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            {filteredUsers && filteredUsers.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="group p-4 sm:p-5 rounded-xl border-2 bg-gradient-to-br from-background to-muted/30 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                                            data-testid={`user-row-${user.id}`}
                                        >
                                            <div className="flex items-start gap-3 sm:gap-4 mb-3">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                                    <span className="text-lg font-bold">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-base sm:text-lg break-words mb-2 group-hover:text-primary transition-colors">
                                                        {user.name}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        <Badge className={getRoleBadgeColor(user.role)}>
                                                            {getRoleDisplayName(user.role)}
                                                        </Badge>
                                                        <Badge
                                                            variant={user.status === "active" ? "default" : "secondary"}
                                                            className={user.status === "active" ? "bg-green-500/20 text-green-700 border-green-500/30" : ""}
                                                        >
                                                            {user.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <p className="text-sm text-muted-foreground font-['Open_Sans'] break-all flex items-center gap-2">
                                                    <span className="text-xs font-semibold">Email:</span>
                                                    {user.email}
                                                </p>
                                                {user.backupEmail && (
                                                    <p className="text-xs text-muted-foreground font-['Open_Sans'] break-all flex items-center gap-2">
                                                        <span className="font-semibold">Backup:</span>
                                                        {user.backupEmail}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-3 border-t">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditUser(user)}
                                                    data-testid={`button-edit-user-${user.id}`}
                                                    className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => deleteMutation.mutate(user.id)}
                                                    data-testid={`button-delete-user-${user.id}`}
                                                    className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="rounded-full bg-muted p-6 inline-block mb-4">
                                        <Users className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">No users found</h3>
                                    <p className="text-sm text-muted-foreground font-['Open_Sans']">
                                        Try adjusting your search or filters.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* EDIT USER DIALOG (outside grid so it overlays entire page) */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent
                        className="
              w-[min(100%-2rem,36rem)]
              max-h-[80vh]
              p-0
              rounded-2xl
              overflow-hidden
              flex
              flex-col
            "
                    >
                        <DialogHeader className="px-4 sm:px-6 pt-4 pb-2 border-b text-center space-y-1 bg-muted/40">
                            <DialogTitle className="text-lg sm:text-xl font-semibold">
                                Edit User
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                                Update user information and permissions.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto bg-background">
                            <Form {...editForm}>
                                <form
                                    onSubmit={editForm.handleSubmit(handleEditSubmit)}
                                    className="space-y-3 sm:space-y-4"
                                >
                                    <FormField
                                        control={editForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs sm:text-sm">
                                                    Full Name <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        data-testid="input-edit-user-name"
                                                        className="text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[11px] sm:text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs sm:text-sm">
                                                    Email <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        data-testid="input-edit-user-email"
                                                        className="text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[11px] sm:text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <FormField
                                            control={editForm.control}
                                            name="backupEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">
                                                        Backup Email{" "}
                                                        <span className="text-muted-foreground">
                              (optional)
                            </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            data-testid="input-edit-user-backup-email"
                                                            className="text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[11px] sm:text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">
                                                        Password (leave empty to keep current)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="password"
                                                            placeholder="Enter new password"
                                                            data-testid="input-edit-user-password"
                                                            className="text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[11px] sm:text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <FormField
                                            control={editForm.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">
                                                        Role <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger
                                                                data-testid="select-edit-user-role"
                                                                className="text-sm"
                                                            >
                                                                <SelectValue placeholder="Select role" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="admin">Administrator</SelectItem>
                                                            <SelectItem value="sales_executive">Sales Executive</SelectItem>
                                                            <SelectItem value="sales_manager">Sales Manager</SelectItem>
                                                            <SelectItem value="purchase_operations">Purchase / Operations</SelectItem>
                                                            <SelectItem value="finance_accounts">Finance / Accounts</SelectItem>
                                                            <SelectItem value="viewer">Viewer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[11px] sm:text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs sm:text-sm">
                                                        Status <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger
                                                                data-testid="select-edit-user-status"
                                                                className="text-sm"
                                                            >
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="inactive">Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[11px] sm:text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full text-sm mt-1"
                                        disabled={updateMutation.isPending}
                                        data-testid="button-submit-edit-user"
                                    >
                                        {updateMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Update User
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
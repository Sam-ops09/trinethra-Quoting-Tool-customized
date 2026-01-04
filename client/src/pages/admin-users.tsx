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
    Home,
    ChevronRight,
} from "lucide-react";
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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
                <div className="flex-1 w-full max-w-full mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 py-4 xs:py-5 sm:py-6 lg:py-8 space-y-5 xs:space-y-6 sm:space-y-7 lg:space-y-8">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-48" />
                    <div className="grid gap-4 xs:gap-5 sm:gap-6 grid-cols-1 xs:grid-cols-3 auto-rows-max">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded-lg" />
                        ))}
                    </div>
                    <Skeleton className="h-32 rounded-lg" />
                    <div className="grid gap-3 xs:gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max flex-1">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-56 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col w-full">
            <div className="flex-1 w-full max-w-full mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 py-2 xs:py-2 sm:py-3 lg:py-4 space-y-2 xs:space-y-2.5 sm:space-y-3 lg:space-y-4">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
                    <button
                        onClick={() => window.location.href = "/"}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <Home className="h-3.5 w-3.5" />
                        <span>Home</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <Users className="h-3.5 w-3.5" />
                        User Management
                    </span>
                </nav>


                {/* Header */}
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-2 w-full">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-0.5 xs:mb-1">
                            User Management
                        </h1>
                        <p className="text-[10px] xs:text-xs sm:text-xs text-slate-600 dark:text-slate-400">
                            Manage team access and permissions
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                data-testid="button-create-user"
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 w-full xs:w-auto text-xs xs:text-sm px-3 xs:px-4 py-1.5 xs:py-2 h-auto"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                <span>Add User</span>
                            </Button>
                        </DialogTrigger>

                                {/* CREATE USER DIALOG */}
                                <DialogContent
                                    className="
                    w-[min(100%-1rem,42rem)]
                    max-h-[90vh]
                    p-0
                    rounded-2xl
                    overflow-hidden
                    flex
                    flex-col
                  "
                                >
                                    <DialogHeader className="px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 pb-2 border-b text-center space-y-1 bg-muted/40">
                                        <DialogTitle className="text-base xs:text-lg sm:text-xl font-semibold">
                                            Create New User
                                        </DialogTitle>
                                        <DialogDescription className="text-[11px] xs:text-xs sm:text-sm text-muted-foreground">
                                            Invite a teammate and assign their role and status.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 sm:py-5 overflow-y-auto bg-background">
                                        <Form {...createForm}>
                                            <form
                                                onSubmit={createForm.handleSubmit(handleCreateSubmit)}
                                                className="space-y-2.5 xs:space-y-3 sm:space-y-4"
                                            >
                                                <FormField
                                                    control={createForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                                Full Name <span className="text-destructive">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    data-testid="input-user-name"
                                                                    className="text-xs xs:text-sm"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={createForm.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                                Email <span className="text-destructive">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    type="email"
                                                                    data-testid="input-user-email"
                                                                    className="text-xs xs:text-sm"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
                                                    <FormField
                                                        control={createForm.control}
                                                        name="backupEmail"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                                    Backup Email{" "}
                                                                    <span className="text-muted-foreground text-[10px] xs:text-[11px]">
                                    (optional)
                                  </span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        type="email"
                                                                        data-testid="input-user-backup-email"
                                                                        className="text-xs xs:text-sm"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={createForm.control}
                                                        name="password"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                                    Password <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        type="password"
                                                                        data-testid="input-user-password"
                                                                        className="text-xs xs:text-sm"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
                                                    <FormField
                                                        control={createForm.control}
                                                        name="role"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                                    Role <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger
                                                                            data-testid="select-user-role"
                                                                            className="text-xs xs:text-sm"
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
                                                                <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={createForm.control}
                                                        name="status"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                                    Status <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger
                                                                            data-testid="select-user-status"
                                                                            className="text-xs xs:text-sm"
                                                                        >
                                                                            <SelectValue placeholder="Select status" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="active">Active</SelectItem>
                                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="w-full text-xs xs:text-sm mt-1"
                                                    disabled={createMutation.isPending}
                                                    data-testid="button-submit-user"
                                                >
                                                    {createMutation.isPending && (
                                                        <Loader2 className="mr-2 h-3 xs:h-4 w-3 xs:w-4 animate-spin" />
                                                    )}
                                                    Create User
                                                </Button>
                                            </form>
                                        </Form>
                                    </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-2 xs:gap-2.5 sm:gap-3 grid-cols-1 xs:grid-cols-3 w-full">
                    <Card className="border-slate-200 dark:border-slate-800 h-full">
                        <CardContent className="p-2.5 xs:p-3 sm:p-4 h-full flex flex-col justify-center">
                            <div className="flex items-center justify-between gap-2">
                                <div className="space-y-0.5 xs:space-y-0.5 min-w-0 flex-1">
                                    <p className="text-[10px] xs:text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">
                                        Total Users
                                    </p>
                                    <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                        {totalUsers}
                                    </p>
                                </div>
                                <div className="h-9 xs:h-10 sm:h-11 w-9 xs:w-10 sm:w-11 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                                    <Users className="h-4.5 xs:h-5 sm:h-5.5 w-4.5 xs:w-5 sm:w-5.5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 h-full">
                        <CardContent className="p-2.5 xs:p-3 sm:p-4 h-full flex flex-col justify-center">
                            <div className="flex items-center justify-between gap-2">
                                <div className="space-y-0.5 xs:space-y-0.5 min-w-0 flex-1">
                                    <p className="text-[10px] xs:text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">
                                        Active Users
                                    </p>
                                    <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {activeUsers}
                                    </p>
                                </div>
                                <div className="h-9 xs:h-10 sm:h-11 w-9 xs:w-10 sm:w-11 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                                    <UserCheck className="h-4.5 xs:h-5 sm:h-5.5 w-4.5 xs:w-5 sm:w-5.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 h-full">
                        <CardContent className="p-2.5 xs:p-3 sm:p-4 h-full flex flex-col justify-center">
                            <div className="flex items-center justify-between gap-2">
                                <div className="space-y-0.5 xs:space-y-0.5 min-w-0 flex-1">
                                    <p className="text-[10px] xs:text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">
                                        Admins
                                    </p>
                                    <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400">
                                        {adminUsers}
                                    </p>
                                </div>
                                <div className="h-9 xs:h-10 sm:h-11 w-9 xs:w-10 sm:w-11 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                                    <Shield className="h-4.5 xs:h-5 sm:h-5.5 w-4.5 xs:w-5 sm:w-5.5 text-rose-600 dark:text-rose-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SEARCH + FILTERS */}
                <Card className="border-slate-200 dark:border-slate-800 w-full">
                    <CardContent className="p-2.5 xs:p-3 sm:p-4 space-y-2 xs:space-y-2.5">
                        <div className="flex flex-col sm:flex-row gap-1.5 xs:gap-2 sm:items-center w-full">
                            <div className="relative flex-1 min-w-0">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 xs:h-3.5 w-3.5 xs:w-3.5 text-slate-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-9 xs:pl-9 text-xs xs:text-xs h-9 xs:h-9 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    data-testid="input-search-users"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col xs:flex-row gap-1.5 xs:gap-1.5 sm:gap-2 w-full">
                            {/* Role filters */}
                            <div className="flex flex-wrap gap-1">
                                {(["all", "admin", "sales_executive", "sales_manager", "purchase_operations", "finance_accounts", "viewer"] as RoleFilter[]).map(
                                    (role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setRoleFilter(role)}
                                            className={[
                                                "px-2 xs:px-2.5 py-1 xs:py-1 rounded-lg text-[10px] xs:text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap",
                                                roleFilter === role
                                                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
                                            ].join(" ")}
                                        >
                                            {role === "all"
                                                ? "All"
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

                            {/* Status filters */}
                            <div className="flex gap-1">
                                {(["all", "active", "inactive"] as StatusFilter[]).map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setStatusFilter(status)}
                                        className={[
                                            "px-2 xs:px-2.5 py-1 xs:py-1 rounded-lg text-[10px] xs:text-[10px] sm:text-xs font-medium transition-colors",
                                            statusFilter === status
                                                ? status === "active"
                                                    ? "bg-emerald-600 text-white"
                                                    : status === "inactive"
                                                        ? "bg-slate-600 text-white"
                                                        : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
                                        ].join(" ")}
                                    >
                                        {status === "all"
                                            ? "All"
                                            : status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* USERS LIST */}
                <Card className="border-slate-200 dark:border-slate-800 w-full flex-1 flex flex-col">
                    <CardHeader className="p-2 xs:p-2.5 sm:p-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base xs:text-base sm:text-lg font-bold">Users ({filteredUsers?.length || 0})</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-2.5 xs:p-3 sm:p-4 flex-1 flex flex-col overflow-y-auto">
                        {filteredUsers && filteredUsers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-3 w-full auto-rows-max">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="group p-2.5 xs:p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all"
                                        data-testid={`user-row-${user.id}`}
                                    >
                                        <div className="flex items-start gap-2 xs:gap-2.5 mb-2 xs:mb-3">
                                            <div className="h-8 xs:h-9 sm:h-10 w-8 xs:w-9 sm:w-10 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 shrink-0 font-bold text-xs xs:text-xs sm:text-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-xs xs:text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-[10px] xs:text-[10px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1 xs:gap-1.5 mb-2 xs:mb-3">
                                            <Badge className={getRoleBadgeColor(user.role)} variant="outline">
                                                <span className="text-[10px] xs:text-[10px]">{getRoleDisplayName(user.role)}</span>
                                            </Badge>
                                            <Badge
                                                variant={user.status === "active" ? "default" : "secondary"}
                                                className={user.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900" : ""}
                                            >
                                                <span className="text-[10px] xs:text-[10px]">{user.status}</span>
                                            </Badge>
                                        </div>

                                        {user.backupEmail && (
                                            <p className="text-[10px] xs:text-[10px] text-slate-600 dark:text-slate-400 truncate mb-2 xs:mb-3">
                                                Backup: {user.backupEmail}
                                            </p>
                                        )}

                                        <div className="flex gap-1 xs:gap-1.5 pt-2 xs:pt-3 border-t border-slate-200 dark:border-slate-800">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditUser(user)}
                                                data-testid={`button-edit-user-${user.id}`}
                                                className="flex-1 text-[10px] xs:text-[10px] sm:text-xs h-8 xs:h-8 sm:h-9"
                                            >
                                                <Edit className="h-3 xs:h-3 sm:h-3.5 w-3 xs:w-3 sm:w-3.5 mr-0.5" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => deleteMutation.mutate(user.id)}
                                                data-testid={`button-delete-user-${user.id}`}
                                                className="flex-1 text-[10px] xs:text-[10px] sm:text-xs h-8 xs:h-8 sm:h-9 hover:bg-destructive hover:text-destructive-foreground"
                                            >
                                                <Trash2 className="h-3 xs:h-3 sm:h-3.5 w-3 xs:w-3 sm:w-3.5 mr-0.5" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 xs:py-10 flex-1 flex flex-col items-center justify-center">
                                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 xs:p-5 sm:p-6 inline-block mb-3 xs:mb-4">
                                    <Users className="h-10 xs:h-12 sm:h-14 w-10 xs:w-12 sm:w-14 text-slate-400" />
                                </div>
                                <h3 className="font-semibold text-sm xs:text-sm sm:text-base mb-1.5 xs:mb-2">No users found</h3>
                                <p className="text-[10px] xs:text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                                    Try adjusting your search or filters.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* EDIT USER DIALOG (outside grid so it overlays entire page) */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent
                        className="
              w-[min(100%-1rem,36rem)]
              max-h-[90vh]
              p-0
              rounded-2xl
              overflow-hidden
              flex
              flex-col
            "
                    >
                        <DialogHeader className="px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 pb-2 border-b text-center space-y-1 bg-muted/40">
                            <DialogTitle className="text-base xs:text-lg sm:text-xl font-semibold">
                                Edit User
                            </DialogTitle>
                            <DialogDescription className="text-[11px] xs:text-xs sm:text-sm text-muted-foreground">
                                Update user information and permissions.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 sm:py-5 overflow-y-auto bg-background">
                            <Form {...editForm}>
                                <form
                                    onSubmit={editForm.handleSubmit(handleEditSubmit)}
                                    className="space-y-2.5 xs:space-y-3 sm:space-y-4"
                                >
                                    <FormField
                                        control={editForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                    Full Name <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        data-testid="input-edit-user-name"
                                                        className="text-xs xs:text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={editForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                    Email <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        data-testid="input-edit-user-email"
                                                        className="text-xs xs:text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
                                        <FormField
                                            control={editForm.control}
                                            name="backupEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                        Backup Email{" "}
                                                        <span className="text-muted-foreground text-[10px] xs:text-[11px]">
                              (optional)
                            </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            data-testid="input-edit-user-backup-email"
                                                            className="text-xs xs:text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                        Password (leave empty to keep current)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="password"
                                                            placeholder="Enter new password"
                                                            data-testid="input-edit-user-password"
                                                            className="text-xs xs:text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
                                        <FormField
                                            control={editForm.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                        Role <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger
                                                                data-testid="select-edit-user-role"
                                                                className="text-xs xs:text-sm"
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
                                                    <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] xs:text-xs sm:text-sm">
                                                        Status <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger
                                                                data-testid="select-edit-user-status"
                                                                className="text-xs xs:text-sm"
                                                            >
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="inactive">Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px] xs:text-[11px] sm:text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full text-xs xs:text-sm mt-1"
                                        disabled={updateMutation.isPending}
                                        data-testid="button-submit-edit-user"
                                    >
                                        {updateMutation.isPending && (
                                            <Loader2 className="mr-2 h-3 xs:h-4 w-3 xs:w-4 animate-spin" />
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

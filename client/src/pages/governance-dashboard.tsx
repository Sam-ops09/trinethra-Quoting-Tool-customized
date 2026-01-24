
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Shield,
    Users,
    Activity,
    CheckCircle2,
    XCircle,
    Lock,
    FileText,
    CreditCard,
    Ban,
    Fingerprint,
    Home,
    AlertCircle,
} from "lucide-react";
import { ActivityLogViewer } from "@/components/activity-log-viewer";
import { useAuth } from "@/lib/auth-context";
import { ROLE_INFO } from "@/lib/permissions-new";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
interface GovernanceStats {
    totalUsers: number;
    activeUsers: number;
    totalActivities: number;
    criticalActivities: number;
    unauthorizedAttempts: number;
    recentApprovals: number;
}

// Helper to normalize capability checking for the matrix view
const getCapabilities = (role: string) => {
    switch (role) {
        case "admin":
            return { read: true, write: true, delete: true, approval: true, finance: true };
        case "sales_manager":
            return { read: true, write: true, delete: false, approval: true, finance: false };
        case "sales_executive":
            return { read: true, write: true, delete: false, approval: false, finance: false };
        case "purchase_operations":
            return { read: true, write: true, delete: false, approval: false, finance: false };
        case "finance_accounts":
            return { read: true, write: true, delete: false, approval: false, finance: true };
        case "viewer":
            return { read: true, write: false, delete: false, approval: false, finance: false };
        default:
            return { read: false, write: false, delete: false, approval: false, finance: false };
    }
};

export default function GovernanceDashboard() {
    const { user } = useAuth();
    const { data: stats, isLoading } = useQuery<GovernanceStats>({
        queryKey: ["/api/governance/stats"],
    });

    const breadcrumbs = [
        { label: "Admin", href: "/admin/users", icon: Users },
        { label: "Governance & Audit", icon: Shield },
    ];

    // --- Access Control ---
    if (!user || user.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-950">
                <Card className="w-full max-w-md border-red-200 dark:border-red-800">
                    <CardHeader className="text-center p-4">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                            <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-base text-red-600 dark:text-red-400">Access Restricted</CardTitle>
                        <CardDescription className="text-xs mt-1">
                            Governance dashboard requires administrator privileges.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center pb-4">
                        <Badge variant="outline" className="border-red-300 text-red-600 dark:text-red-400 text-[10px]">
                            Error 403: Forbidden
                        </Badge>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const roleKeys = Object.keys(ROLE_INFO);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col w-full">
                <div className="flex-1 w-full max-w-full mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 py-4 space-y-6">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-64" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col w-full">
            <div className="flex-1 w-full max-w-full mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 py-4 space-y-6">
                
                <PageHeader 
                    title="Governance Dashboard"
                    description="Monitor system activity, manage permissions, and enforce compliance rules."
                    breadcrumbs={breadcrumbs}
                    showRefresh
                    refreshQueryKeys={[["/api/governance/stats"], ["/api/activity-logs/recent"]]}
                />

                {/* Compact Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <CompactStat
                        icon={Users}
                        label="Users"
                        value={stats?.activeUsers}
                        total={stats?.totalUsers}
                        color="blue"
                    />
                    <CompactStat
                        icon={Activity}
                        label="Events"
                        value={stats?.totalActivities}
                        color="purple"
                    />
                    <CompactStat
                        icon={Shield}
                        label="Critical"
                        value={stats?.criticalActivities}
                        color="amber"
                    />
                    <CompactStat
                        icon={Ban}
                        label="Blocked"
                        value={stats?.unauthorizedAttempts}
                        color="red"
                        alert={!!(stats?.unauthorizedAttempts && stats.unauthorizedAttempts > 0)}
                    />
                </div>

                {/* Compact Tabs */}
                <Tabs defaultValue="activity" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <TabsTrigger value="activity" className="gap-2">
                            <Activity className="h-4 w-4" />
                            <span className="hidden sm:inline">Audit Log</span>
                        </TabsTrigger>
                        <TabsTrigger value="matrix" className="gap-2">
                            <Fingerprint className="h-4 w-4" />
                            <span className="hidden sm:inline">Permissions Matrix</span>
                        </TabsTrigger>
                        <TabsTrigger value="rules" className="gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Compliance Rules</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Activity Log */}
                    <TabsContent value="activity">
                        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-purple-600" />
                                    <div>
                                        <CardTitle className="text-base font-semibold">System Activity</CardTitle>
                                        <CardDescription className="text-xs mt-0.5">
                                            Real-time audit trail of all user actions
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <div className="bg-white dark:bg-slate-950 h-[500px] overflow-hidden">
                                <ActivityLogViewer limit={50} showUser={true} />
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Permission Matrix - Card Based */}
                    <TabsContent value="matrix" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Role Capabilities
                            </h2>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-slate-600 dark:text-slate-400">Granted</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <XCircle className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-400">Denied</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {roleKeys.map((role) => {
                                const caps = getCapabilities(role);
                                const info = ROLE_INFO[role as keyof typeof ROLE_INFO];
                                return (
                                    <Card key={role} className="overflow-hidden hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
                                        <CardHeader className="p-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <CardTitle className="text-sm font-semibold truncate">
                                                        {info.name}
                                                    </CardTitle>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 uppercase">
                                                    {role.replace(/_/g, " ").split(" ")[0]}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-xs line-clamp-1">
                                                {info.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                <CapabilityBadge active={caps.read} label="Read" />
                                                <CapabilityBadge active={caps.write} label="Write" />
                                                <CapabilityBadge active={caps.approval} label="Approve" />
                                                <CapabilityBadge active={caps.finance} label="Finance" />
                                                <CapabilityBadge active={caps.delete} label="Delete" danger />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* Rules */}
                    <TabsContent value="rules">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <CompactRuleSection
                                title="Financial Controls"
                                icon={CreditCard}
                                description="Payment integrity & invoice locking"
                                color="green"
                            >
                                <Accordion type="single" collapsible className="w-full">
                                    <CompactRuleItem value="fin-1" title="Master Invoice Locking" severity="critical">
                                        Master invoices must be <strong>Confirmed</strong> before locking. Only Finance and Admin can lock.
                                    </CompactRuleItem>
                                    <CompactRuleItem value="fin-2" title="Payment Recording" severity="high">
                                        Payments recorded on finalized invoices only. Deleting payments triggers critical alerts.
                                    </CompactRuleItem>
                                    <CompactRuleItem value="fin-3" title="Currency & Tax">
                                        Tax rate changes require admin approval. Currency locked once invoices exist.
                                    </CompactRuleItem>
                                </Accordion>
                            </CompactRuleSection>

                            <CompactRuleSection
                                title="Sales Workflow"
                                icon={FileText}
                                description="Quote approvals & document lifecycle"
                                color="blue"
                            >
                                <Accordion type="single" collapsible className="w-full">
                                    <CompactRuleItem value="sales-1" title="Quote Approval Chain" severity="high">
                                        Sales Executives draft quotes. Manager approval required for high values.
                                    </CompactRuleItem>
                                    <CompactRuleItem value="sales-2" title="Serial Number Integrity">
                                        Serial numbers locked once invoice is sent to prevent fiscal gaps.
                                    </CompactRuleItem>
                                </Accordion>
                            </CompactRuleSection>

                            <CompactRuleSection
                                title="Access & Security"
                                icon={Lock}
                                description="Authentication & role boundaries"
                                color="purple"
                            >
                                <Accordion type="single" collapsible className="w-full">
                                    <CompactRuleItem value="sec-1" title="Role Escalation" severity="critical">
                                        Users cannot modify own roles. Admin-only operation with full audit.
                                    </CompactRuleItem>
                                    <CompactRuleItem value="sec-2" title="Data Visibility">
                                        Viewers have read-only access. Export restricted to Managers+.
                                    </CompactRuleItem>
                                </Accordion>
                            </CompactRuleSection>

                            <CompactRuleSection
                                title="Compliance & Audit"
                                icon={Shield}
                                description="Regulatory requirements & logging"
                                color="amber"
                            >
                                <Accordion type="single" collapsible className="w-full">
                                    <CompactRuleItem value="comp-1" title="Audit Trail Retention" severity="critical">
                                        All activities logged permanently. Cannot be deleted or modified.
                                    </CompactRuleItem>
                                    <CompactRuleItem value="comp-2" title="Deletion Safeguards">
                                        Critical records archived only, not deleted. Hard deletes require MFA.
                                    </CompactRuleItem>
                                </Accordion>
                            </CompactRuleSection>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// --- Compact Sub-components ---

function CompactStat({
    icon: Icon,
    label,
    value,
    total,
    color,
    alert = false
}: {
    icon: any;
    label: string;
    value?: number;
    total?: number;
    color: "blue" | "purple" | "amber" | "red";
    alert?: boolean;
}) {
    const colorConfig = {
        blue: { bg: "bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
        purple: { bg: "bg-purple-500", text: "text-purple-700 dark:text-purple-300" },
        amber: { bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
        red: { bg: "bg-red-500", text: "text-red-700 dark:text-red-300" }
    };

    const config = colorConfig[color];

    return (
        <Card className={cn("overflow-hidden transition-shadow hover:shadow-sm border-slate-200 dark:border-slate-800", alert && "ring-2 ring-red-500")}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {label}
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className={cn("text-2xl font-bold", config.text)}>
                                {value ?? 0}
                            </span>
                            {total && (
                                <span className="text-xs text-slate-400">
                                    /{total}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CapabilityBadge({ active, label, danger }: { active: boolean; label: string; danger?: boolean }) {
    return (
        <div className={cn(
            "flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors border",
            active
                ? danger
                    ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300"
                    : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300"
                : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-50"
        )}>
            {active ? (
                <CheckCircle2 className="h-3 w-3 shrink-0" />
            ) : (
                <XCircle className="h-3 w-3 shrink-0" />
            )}
            <span className="truncate">{label}</span>
        </div>
    );
}

function CompactRuleSection({
    title,
    icon: Icon,
    description,
    color,
    children
}: any) {
    const colorConfig = {
        green: "bg-green-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        amber: "bg-amber-500"
    } as const;

    return (
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 h-full">
            <CardHeader className="p-4 pb-3">
                <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", colorConfig[color as keyof typeof colorConfig])}>
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-bold">
                            {title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            {description}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {children}
            </CardContent>
        </Card>
    );
}

function CompactRuleItem({
    value,
    title,
    severity,
    children
}: {
    value: string;
    title: string;
    severity?: "critical" | "high" | "medium";
    children: React.ReactNode;
}) {
    const severityConfig = {
        critical: { badge: "Critical", className: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900" },
        high: { badge: "High", className: "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900" },
        medium: { badge: "Medium", className: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900" }
    };

    return (
        <AccordionItem value={value} className="border-b last:border-b-0 border-slate-100 dark:border-slate-800">
            <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-left">
                <div className="flex items-center gap-2 flex-wrap w-full pr-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {title}
                    </span>
                    {severity && (
                        <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 py-0 border shrink-0 ml-auto", severityConfig[severity].className)}
                        >
                            {severityConfig[severity].badge}
                        </Badge>
                    )}
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {children}
            </AccordionContent>
        </AccordionItem>
    );
}
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
    ChevronRight,
} from "lucide-react";
import { ActivityLogViewer } from "@/components/activity-log-viewer";
import { useAuth } from "@/lib/auth-context";
import { ROLE_INFO } from "@/lib/permissions-new";
import { cn } from "@/lib/utils";

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
    const [, setLocation] = useLocation();
    const { data: stats } = useQuery<GovernanceStats>({
        queryKey: ["/api/governance/stats"],
    });

    // --- Access Control ---
    if (!user || user.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center p-3">
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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Compact Sticky Header */}
            <div className="sticky top-0 z-20 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80">
                <div className="w-full max-w-full mx-auto px-2 xs:px-3 sm:px-4 lg:px-6">
                    <div className="flex items-center justify-between py-2 xs:py-2.5 gap-2 xs:gap-3">
                        <div className="flex items-center gap-1.5 xs:gap-2 min-w-0 flex-1">
                            <div className="p-1 xs:p-1.5 rounded-lg bg-blue-500 shrink-0">
                                <Shield className="h-3 xs:h-3.5 w-3 xs:w-3.5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
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
                                    <button
                                        onClick={() => setLocation("/admin/users")}
                                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                                    >
                                        <Users className="h-3.5 w-3.5" />
                                        <span>Admin</span>
                                    </button>
                                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                                        <Shield className="h-3.5 w-3.5" />
                                        Governance
                                    </span>
                                </nav>

                            </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 h-auto py-1 shrink-0 text-[8px] xs:text-[9px] px-1.5">
                            <Activity className="h-2 xs:h-2.5 w-2 xs:w-2.5 mr-0.5 xs:mr-1 animate-pulse" />
                            <span className="hidden xs:inline">Live</span>
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-full mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 py-2 xs:py-2.5 sm:py-3 space-y-2 xs:space-y-2.5 sm:space-y-3 pb-4 xs:pb-6">
                {/* Compact Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 xs:gap-2">
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
                <Tabs defaultValue="matrix" className="space-y-2">
                    <TabsList className="grid w-full grid-cols-3 h-8 bg-slate-100 dark:bg-slate-900 p-0.5">
                        <TabsTrigger value="matrix" className="text-[9px] sm:text-[10px] gap-0.5 xs:gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                            <Fingerprint className="h-3 w-3" />
                            <span className="hidden xs:inline">Perms</span>
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="text-[9px] sm:text-[10px] gap-0.5 xs:gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                            <Activity className="h-3 w-3" />
                            <span className="hidden xs:inline">Audit</span>
                        </TabsTrigger>
                        <TabsTrigger value="rules" className="text-[9px] sm:text-[10px] gap-0.5 xs:gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                            <FileText className="h-3 w-3" />
                            <span className="hidden xs:inline">Rules</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Permission Matrix - Card Based */}
                    <TabsContent value="matrix" className="space-y-2 mt-2">
                        <div className="flex items-center justify-between mb-1.5">
                            <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                                Role Capabilities
                            </h2>
                            <div className="flex items-center gap-1.5 xs:gap-2 text-[8px] sm:text-[9px]">
                                <div className="flex items-center gap-0.5">
                                    <CheckCircle2 className="h-2 w-2 text-green-500" />
                                    <span className="hidden sm:inline text-slate-600 dark:text-slate-400">Granted</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <XCircle className="h-2 w-2 text-slate-400" />
                                    <span className="hidden sm:inline text-slate-600 dark:text-slate-400">Denied</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-1.5 xs:gap-2">
                            {roleKeys.map((role) => {
                                const caps = getCapabilities(role);
                                const info = ROLE_INFO[role as keyof typeof ROLE_INFO];
                                return (
                                    <Card key={role} className="overflow-hidden hover:shadow-sm transition-shadow">
                                        <CardHeader className="p-2 xs:p-2.5 sm:p-3 pb-1.5 xs:pb-2">
                                            <div className="flex items-start justify-between gap-1.5 xs:gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-semibold">
                                                        {info.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-[9px] line-clamp-1 mt-0.5">
                                                        {info.description}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="secondary" className="text-[7px] xs:text-[8px] px-1 py-0 shrink-0">
                                                    {role.replace(/_/g, " ").substring(0, 4).toUpperCase()}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-2 xs:p-2.5 sm:p-3 pt-0">
                                            <div className="grid grid-cols-5 gap-0.5 xs:gap-1">
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

                    {/* Activity Log */}
                    <TabsContent value="activity" className="mt-2">
                        <Card className="overflow-hidden">
                            <CardHeader className="border-b p-2 xs:p-2.5 sm:p-3">
                                <div className="flex items-center gap-1.5 xs:gap-2">
                                    <Activity className="h-3 xs:h-3.5 w-3 xs:w-3.5 text-purple-600" />
                                    <div>
                                        <CardTitle className="text-[10px] xs:text-xs sm:text-sm">System Activity</CardTitle>
                                        <CardDescription className="text-[9px] mt-0.5">
                                            Real-time audit trail
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <div className="bg-white dark:bg-slate-950 max-h-[400px] xs:max-h-[450px] sm:max-h-[500px] overflow-y-auto">
                                <ActivityLogViewer limit={30} showUser={true} />
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Rules */}
                    <TabsContent value="rules" className="mt-2">
                        <div className="grid gap-2 xs:gap-2.5 lg:grid-cols-2">
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
        <Card className={cn("overflow-hidden transition-shadow hover:shadow-sm", alert && "ring-2 ring-red-500")}>
            <CardContent className="p-2 xs:p-2.5">
                <div className="flex items-center gap-1.5 xs:gap-2">
                    <div className={cn("p-1 xs:p-1.5 rounded-md shrink-0", config.bg)}>
                        <Icon className="h-3 xs:h-3 sm:h-3.5 w-3 xs:w-3 sm:w-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[8px] xs:text-[9px] sm:text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                            {label}
                        </p>
                        <div className="flex items-baseline gap-0.5 xs:gap-1">
                            <span className={cn("text-base xs:text-lg sm:text-xl font-bold", config.text)}>
                                {value ?? 0}
                            </span>
                            {total && (
                                <span className="text-[8px] xs:text-[9px] text-slate-500">
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
            "flex items-center justify-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 rounded border text-[8px] sm:text-[9px] font-medium transition-colors",
            active
                ? danger
                    ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300"
                    : "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800 text-green-700 dark:text-green-300"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-50"
        )}>
            {active ? (
                <CheckCircle2 className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0" />
            ) : (
                <XCircle className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0" />
            )}
            <span className="hidden sm:inline truncate">{label}</span>
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
        <Card className="overflow-hidden">
            <CardHeader className="p-2 xs:p-2.5 sm:p-3 pb-1.5 xs:pb-2">
                <div className="flex items-start gap-1.5 xs:gap-2">
                    <div className={cn("p-1 xs:p-1.5 rounded-lg shrink-0", colorConfig[color as keyof typeof colorConfig])}>
                        <Icon className="h-3 xs:h-3 sm:h-3.5 w-3 xs:w-3 sm:w-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-semibold">
                            {title}
                        </CardTitle>
                        <CardDescription className="text-[9px] mt-0.5">
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
        critical: { badge: "Critical", className: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },
        high: { badge: "High", className: "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700" },
        medium: { badge: "Medium", className: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700" }
    };

    return (
        <AccordionItem value={value} className="border-b last:border-b-0">
            <AccordionTrigger className="hover:no-underline px-2 xs:px-2.5 sm:px-3 py-2 xs:py-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-left">
                <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                    <span className="text-[10px] xs:text-xs sm:text-xs font-medium text-slate-900 dark:text-white">
                        {title}
                    </span>
                    {severity && (
                        <Badge
                            variant="outline"
                            className={cn("text-[7px] xs:text-[8px] px-1 py-0 border shrink-0", severityConfig[severity].className)}
                        >
                            {severityConfig[severity].badge}
                        </Badge>
                    )}
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-2 xs:px-2.5 sm:px-3 pb-2 xs:pb-2.5 text-[9px] xs:text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {children}
            </AccordionContent>
        </AccordionItem>
    );
}
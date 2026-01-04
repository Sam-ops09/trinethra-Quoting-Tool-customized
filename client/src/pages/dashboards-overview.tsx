import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
    BarChart3,
    Package,
    Receipt,
    FileText,
    ArrowRight,
    TrendingUp,
    Download,
    Search,
    Clock,
    Target,
    Activity,
    Zap,
    Layers,
    BarChart4,
    Barcode
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Data (Unchanged)
const dashboards = [
    {
        title: "Sales & Quote Dashboard",
        description: "Sales pipeline visibility, quote performance metrics, and conversion rates.",
        icon: FileText,
        url: "/dashboards/sales-quotes",
        gradient: "from-blue-500/10 to-blue-600/10",
        iconColor: "text-blue-600",
        badge: "Sales",
    },
    {
        title: "Vendor PO & Procurement",
        description: "Purchase order tracking, vendor spend analysis, and fulfillment rates.",
        icon: Package,
        url: "/dashboards/vendor-po",
        gradient: "from-green-500/10 to-green-600/10",
        iconColor: "text-green-600",
        badge: "Procurement",
    },
    {
        title: "Invoice & Collections",
        description: "Invoicing performance, receivables aging, and collection tracking.",
        icon: Receipt,
        url: "/dashboards/invoice-collections",
        gradient: "from-orange-500/10 to-orange-600/10",
        iconColor: "text-orange-600",
        badge: "Finance",
    },
    {
        title: "Serial Tracking & Warranty",
        description: "Product serial numbers, warranty management, and traceability.",
        icon: Barcode, // Changed icon for better relevance
        url: "/dashboards/serial-tracking",
        gradient: "from-purple-500/10 to-purple-600/10",
        iconColor: "text-purple-600",
        badge: "Operations",
    },
];

const features = [
    { icon: TrendingUp, title: "Visual Analytics", description: "Interactive charts and graphs.", color: "text-blue-600", },
    { icon: Search, title: "Detailed Insights", description: "Drill down into specific metrics/KPIs.", color: "text-orange-600", },
    { icon: Clock, title: "Real-time Data", description: "Information refreshed automatically.", color: "text-purple-600", },
    { icon: Download, title: "Export Reports", description: "Download in Excel and PDF formats.", color: "text-green-600", },
];


// --- Helper Components ---

// Stat/Feature Box for the Header
const FeatureStatBox = ({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) => (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors border border-dashed border-transparent hover:border-border">
        <div className={`shrink-0 p-2 rounded-full ${color}/10 flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="flex-1">
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
    </div>
);

// --- Main Component ---

export default function DashboardsOverview() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-8">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">

                {/* TOP SECTION: Header, Quick Stats, and Key Features */}
                <Card className="shadow-xl bg-gradient-to-br from-primary/5 to-background border-2 border-primary/20">
                    <CardHeader className="p-4 sm:p-6 pb-2">
                        <div className="flex items-center gap-3">
                            <Layers className="h-6 w-6 text-primary" />
                            <div>
                                <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Specialized Analytics Hub</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    Deep dive analytics and reporting across key business verticals.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-3">
                        <Separator className="mb-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Render Features as compact stat boxes */}
                            {features.map((feature, index) => (
                                <FeatureStatBox key={index} {...feature} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* MAIN SECTION: Dashboard Cards */}

                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Access Your Dashboards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {dashboards.map((dashboard) => (
                            <Card
                                key={dashboard.url}
                                className={`group relative overflow-hidden cursor-pointer transition-all duration-300 border hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5`}
                                onClick={() => setLocation(dashboard.url)}
                            >
                                {/* Subtle background glow on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${dashboard.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                <CardHeader className="p-4 relative">
                                    <div className="flex items-start justify-between">
                                        <div className={`h-10 w-10 rounded-lg ${dashboard.iconColor}/10 flex items-center justify-center shrink-0`}>
                                            <dashboard.icon className={`h-5 w-5 ${dashboard.iconColor}`} />
                                        </div>
                                        <Badge className={`text-xs font-semibold py-0.5 px-2 bg-muted text-foreground border-dashed border-border`}>
                                            {dashboard.badge}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 relative">
                                    <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                        {dashboard.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground leading-snug h-8 overflow-hidden line-clamp-2">
                                        {dashboard.description}
                                    </CardDescription>

                                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary opacity-80 group-hover:opacity-100 transition-all">
                                        Go to Dashboard
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* FOOTER INFO CARD */}
                <Card className="border-dashed border-2 bg-gradient-to-r from-secondary/5 to-background/5 mt-6">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                <BarChart4 className="h-5 w-5 text-secondary-foreground" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-base mb-1">Data Integrity & Reporting</h3>
                                <p className="text-sm text-muted-foreground">
                                    All dashboards utilize **real-time data** from the core system. For comprehensive reports or custom data extracts, refer to the **Export Reports** feature available within each view.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
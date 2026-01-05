"use client";

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
    Barcode,
    LayoutDashboard,
    ChevronRight,
    Sparkles,
    Globe,
    Home
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Data
const dashboards = [
    {
        title: "Sales & Quote Dashboard",
        description: "Sales pipeline visibility, quote performance metrics, and conversion rates.",
        icon: FileText,
        url: "/dashboards/sales-quotes",
        gradient: "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
        iconInit: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        badge: "Sales",
        badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
    },
    {
        title: "Vendor PO & Procurement",
        description: "Purchase order tracking, vendor spend analysis, and fulfillment rates.",
        icon: Package,
        url: "/dashboards/vendor-po",
        gradient: "from-emerald-500/20 via-green-500/20 to-teal-500/20",
        iconInit: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        badge: "Procurement",
        badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
    },
    {
        title: "Invoice & Collections",
        description: "Invoicing performance, receivables aging, and collection tracking.",
        icon: Receipt,
        url: "/dashboards/invoice-collections",
        gradient: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
        iconInit: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        badge: "Finance",
        badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400"
    },
    {
        title: "Serial Tracking & Warranty",
        description: "Product serial numbers, warranty management, and traceability.",
        icon: Barcode,
        url: "/dashboards/serial-tracking",
        gradient: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
        iconInit: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        badge: "Operations",
        badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400"
    },
];

const features = [
    { icon: TrendingUp, title: "Visual Analytics", description: "Interactive charts" },
    { icon: Search, title: "Deep Insights", description: "Drill-down metrics" },
    { icon: Clock, title: "Real-time Data", description: "Auto-refresh sync" },
    { icon: Download, title: "Export Reports", description: "PDF & Excel ready" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// --- Helper Components ---

function FeatureBox({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

// --- Main Component ---

export default function DashboardsOverview() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-12 animate-in fade-in duration-500">
             {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
                <div className="absolute top-0 left-1/4 w-[1000px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-[1000px] h-[500px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/2" />
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-10"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
                        <button
                            onClick={() => setLocation("/")}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <Home className="h-3.5 w-3.5" />
                            <span>Home</span>
                        </button>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                         <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                            <Layers className="h-3.5 w-3.5" />
                            Analytics Hub
                        </span>
                    </nav>

                    <div className="relative rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl">
                        {/* Hero Gradient Mesh */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 opacity-50" />
                        
                        <div className="relative p-8 sm:p-10">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                                <div className="space-y-4 max-w-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                                            <Sparkles className="h-6 w-6 text-white" />
                                        </div>
                                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                            Specialized Analytics Hub
                                        </h1>
                                    </div>
                                    <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                        Monitor key performance indicators across all business verticals. From sales pipelines to procurement logistics, get the insights you need to make data-driven decisions.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
                                    {features.map((feature, index) => (
                                        <FeatureBox key={index} {...feature} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Dashboard Grid */}
                <div className="space-y-6">
                    <motion.h2 variants={itemVariants} className="text-xl font-bold tracking-tight px-1 flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-indigo-500" />
                        Available Dashboards
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {dashboards.map((dashboard, i) => (
                            <motion.div
                                variants={itemVariants}
                                key={dashboard.url}
                                whileHover={{ y: -8 }}
                                onClick={() => setLocation(dashboard.url)}
                                className="group relative cursor-pointer"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${dashboard.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                
                                <Card className="h-full relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300">
                                    <CardContent className="p-6 flex flex-col h-full gap-5">
                                        <div className="flex items-start justify-between">
                                            <div className={`h-12 w-12 rounded-2xl ${dashboard.iconInit} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                                <dashboard.icon className="h-6 w-6" />
                                            </div>
                                            <Badge className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${dashboard.badgeColor} border-none`}>
                                                {dashboard.badge}
                                            </Badge>
                                        </div>
                                        
                                        <div className="space-y-2 flex-1">
                                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                                                {dashboard.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                {dashboard.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm font-semibold text-primary opacity-60 group-hover:opacity-100 transition-all pt-2">
                                            Open Dashboard <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer Info */}
                <motion.div variants={itemVariants}>
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <Globe className="h-6 w-6 text-slate-500" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Centralized Data Intelligence</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
                                All dashboards leverage the central data warehouse. Reporting is unified, ensuring data integrity across Sales, Procurement, Finance, and Operations. For custom reports, contact your system administrator.
                            </p>
                        </div>
                         <Button variant="outline" className="bg-white dark:bg-slate-800">
                            System Status
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  TrendingUp,
  FileText,
  DollarSign,
  Target,
  Calendar,
  PieChart as PieChartIcon,
  MapPin,
  Users,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Home,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
  Line,
  Sector
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { isFeatureEnabled } from "@shared/feature-flags";
import { formatCurrency } from "@/lib/currency";
import { useLocation } from "wouter";

interface AnalyticsData {
  overview: {
    totalQuotes: number;
    totalRevenue: string; // Formatted string from backend
    avgQuoteValue: string; // Formatted string
    conversionRate: string; // Formatted string
  };
  monthlyData: Array<{
    month: string;
    quotes: number;
    revenue: number;
    conversions: number;
  }>;
  topClients: Array<{
    name: string;
    totalRevenue: string; // Formatted
    quoteCount: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    value: number;
  }>;
}
interface RevenueForecast { month: string; forecastedRevenue: number; confidence: number; }
interface DealDistribution { range: string; count: number; totalValue: number; percentage: number; }
interface RegionalData { region: string; quoteCount: number; totalRevenue: number; percentage: number; }
interface PipelineStage { stage: string; count: number; totalValue: number; avgDealValue: number; }
interface CompetitorInsights { avgQuoteValue: number; medianQuoteValue: number; quoteFrequency: number; conversionTrend: number; }
interface VendorAnalytics {
  overview: {
    totalSpend: string;
    totalPOs: number;
    activeVendors: number;
    delayedPOs: number;
    avgPoValue: string;
  };
  topVendors: Array<{
    vendorName: string;
    totalSpend: string;
    poCount: number;
    avgPoValue: string;
  }>;
  vendorPerformance: Array<{
    vendorName: string;
    totalPOs: number;
    fulfilledPOs: number;
    onTimeDeliveryRate: string;
    totalSpend: string;
  }>;
  procurementDelays: {
    count: number;
    percentage: string;
  };
}

const COLORS = {
  primary: "hsl(205 32% 40%)", // #456882 - Medium blue
  secondary: "hsl(205 48% 22%)", // #1B3C53 - Dark blue
  success: "hsl(142 60% 40%)", // Success green
  warning: "hsl(38 92% 50%)", // Warning orange
  accent: "hsl(205 32% 40%)", // Same as primary
  chart: [
    "hsl(205 32% 40%)", // Primary - #456882
    "hsl(205 48% 22%)", // Secondary - #1B3C53
    "hsl(28 22% 83%)",  // Muted - #D2C1B6
    "hsl(142 60% 40%)", // Success
    "hsl(38 92% 50%)",  // Warning
    "hsl(205 32% 50%)"  // Lighter primary
  ]
};

// Utility Components
const TrendBadge = ({ change, trend }: { change?: string; trend: "up" | "down" | "neutral" }) => {
  if (!change) return null;
  const styles = {
    up: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400",
    down: "text-rose-600 bg-rose-100 dark:bg-rose-950 dark:text-rose-400",
    neutral: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400"
  };
  const Icon = { up: ArrowUpRight, down: ArrowDownRight, neutral: Sparkles }[trend];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", styles[trend])} aria-label={`Performance trend ${trend}`}> <Icon className="h-3.5 w-3.5" /> {change}</span>
  );
};

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  caption
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  caption?: string;
}) => (
  <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
    <CardContent className="relative p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">{title}</p>
          <div className="text-3xl font-bold text-slate-900 dark:text-white" aria-live="polite">{typeof value === "number" ? value.toLocaleString() : value}</div> 
          {caption && <p className="text-xs text-slate-500 dark:text-slate-400">{caption}</p>}
        </div>
        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-md">
            <Icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <TrendBadge change={change} trend={trend} />
        {change && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">vs last month</span>}
      </div>
    </CardContent>
  </Card>
);

const InsightTile = ({ label, value, description, badge }: { label: string; value: string; description: string; badge?: string }) => (
  <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 border border-slate-200/50 dark:border-slate-700/50" role="group" aria-label={label}>
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      {badge && <Badge variant="outline" className="rounded-full border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-900 dark:text-white">{badge}</Badge>}
    </div>
    <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white break-words" aria-live="polite">{value}</p>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
  </div>
);

// Section wrappers - Updated to match premium card style
const Section = ({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) => (
  <Card className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg overflow-hidden" aria-labelledby={`section-${title}`}>
    <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-5 pb-3">
      <div>
        <CardTitle id={`section-${title}`} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{title}</CardTitle>
        {description && <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{description}</CardDescription>}
      </div>
      {actions}
    </CardHeader>
    <CardContent className="p-5">{children}</CardContent>
  </Card>
);

// Loading skeleton - Updated container
const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  </div>
);

// Custom Active Shape for Pie Chart
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-xl font-bold fill-slate-900 dark:fill-white">
        {payload.count}
      </text>
      <text x={cx} y={cy} dy={28} textAnchor="middle" className="text-xs fill-slate-500 dark:fill-slate-400">
        Deals
      </text>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs font-bold fill-slate-900 dark:fill-white">{`Revenue ${formatCurrency(payload.totalValue)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs fill-slate-500 dark:fill-slate-400">
        {`(Share ${(percent * 100).toFixed(1)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState("12");
  const [activeTab, setActiveTab] = useState("overview");

  // Data Queries
  const { data, isLoading, isError } = useQuery<AnalyticsData>({ 
    queryKey: ["/api/analytics", timeRange]
  });

  const { data: forecast } = useQuery<RevenueForecast[]>({ 
    queryKey: ["/api/analytics/forecast"],
    enabled: isFeatureEnabled('analytics_forecasting')
  });
  
  const { data: dealDistribution } = useQuery<DealDistribution[]>({ 
    queryKey: ["/api/analytics/deal-distribution"] 
  });
  
  const { data: regionalData } = useQuery<RegionalData[]>({ 
    queryKey: ["/api/analytics/regional"] 
  });
  
  const { data: pipeline } = useQuery<PipelineStage[]>({
    queryKey: ["/api/analytics/pipeline"],
    enabled: isFeatureEnabled('analytics_charts')
  });
  
  const { data: insights } = useQuery<CompetitorInsights>({ 
    queryKey: ["/api/analytics/competitor-insights"],
    enabled: isFeatureEnabled('analytics_trends')
  });
  
  const { data: vendorAnalytics } = useQuery<VendorAnalytics>({
    queryKey: ["/api/analytics/vendor-spend", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/vendor-spend?timeRange=${timeRange}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch vendor analytics");
      return response.json();
    },
    enabled: isFeatureEnabled('analytics_vendorMetrics')
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const handleExport = () => {
    window.location.href = `/api/analytics/export?timeRange=${timeRange}`;
  };

  // Derived Values
  const latestMonth = useMemo(() => data?.monthlyData?.[data.monthlyData.length - 1], [data?.monthlyData]);
  const strongestRegion = useMemo(() => {
    if (!regionalData || regionalData.length === 0) return undefined;
    return regionalData.reduce((top, r) => (r.percentage > top.percentage ? r : top), regionalData[0]);
  }, [regionalData]);
  const pipelineSummary = useMemo(() => {
    if (!pipeline || pipeline.length === 0) return { totalCount: 0, totalValue: 0 };
    return pipeline.reduce((acc, s) => { acc.totalCount += s.count; acc.totalValue += s.totalValue; return acc; }, { totalCount: 0, totalValue: 0 });
  }, [pipeline]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Premium Breadcrumbs */}
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
                onClick={() => setLocation("/admin/analytics")}  
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
            >
                <span>Admin</span>
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                <BarChart3 className="h-3.5 w-3.5" />
                Analytics
            </span>
        </nav>

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <div className="relative px-6 sm:px-8 py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 shadow-lg">
                                <LayoutDashboard className="h-6 w-6 text-white dark:text-slate-900" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                    Analytics Dashboard
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                    Unified analytics workspace to monitor growth and performance
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-3 py-2 w-full sm:w-auto backdrop-blur-sm">
                            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="h-9 sm:h-10 w-full border-none bg-transparent px-0 text-xs sm:text-sm focus:ring-0 sm:w-[140px] text-slate-900 dark:text-white font-medium">
                                    <SelectValue placeholder="Time range" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="3">Last 3 months</SelectItem>
                                    <SelectItem value="6">Last 6 months</SelectItem>
                                    <SelectItem value="12">Last 12 months</SelectItem>
                                    <SelectItem value="all">All time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleExport} className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold text-sm w-full sm:w-auto">
                            <Download className="h-4 w-4 mr-2" /> Export Report
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        {/* Premium Tabs / Filter Card */}
        <Card className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg">
           <CardContent className="p-2 sm:p-3">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex w-full gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
                  {(["overview", "performance", "pipeline", "insights"] as const).map(k => (
                    <TabsTrigger 
                        key={k} 
                        value={k} 
                        className="flex-1 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all capitalize"
                    >
                      {k === "overview" ? "Snapshot" : k.charAt(0).toUpperCase() + k.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
           </CardContent>
        </Card>

        {isError && (
          <Card className="border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
            <CardContent className="p-4 flex items-center gap-3">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load analytics data. Please retry.</p>
              <Button variant="outline" size="sm" className="ml-auto" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />Reload
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && data && (
          <div className="space-y-6">
            <section aria-label="Key Performance Indicators">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {isFeatureEnabled('analytics_quoteMetrics') && (
                  <StatCard title="Total Quotes" value={data.overview.totalQuotes} change="12.5%" icon={FileText} trend="up" caption="Active proposals YTD" />
                )}
                {isFeatureEnabled('analytics_revenueMetrics') && (
                  <StatCard title="Total Revenue" value={formatCurrency(Number(data.overview.totalRevenue.replace(/[^0-9.-]+/g,"")))} change="23.1%" icon={DollarSign} trend="up" caption="Closed revenue" />
                )}
                <StatCard title="Average Deal Size" value={formatCurrency(Number(data.overview.avgQuoteValue.replace(/[^0-9.-]+/g,"")))} change="8.3%" icon={TrendingUp} trend="up" caption="Mean quote value" />
                <StatCard title="Conversion Rate" value={`${data.overview.conversionRate}%`} change="-2.4%" icon={Target} trend="down" caption="Quote-to-close ratio" />
              </div>
            </section>
            
            <div className="grid gap-6 lg:grid-cols-[minmax(300px,360px)_1fr]">
              <aside className="space-y-6 order-2 lg:order-1" aria-label="Executive Insights">
                <Section title="Executive Summary" description="Latest performance highlights">
                  <div className="space-y-4">
                    <InsightTile label="Latest Month" value={latestMonth ? latestMonth.month : "—"} description={latestMonth ? `Revenue ${formatCurrency(latestMonth.revenue)} with ${latestMonth.quotes} quotes issued` : "No recent month data available"} badge={latestMonth ? "Most recent" : undefined} />
                    <InsightTile label="Leading Region" value={strongestRegion ? strongestRegion.region : "—"} description={strongestRegion ? `${strongestRegion.percentage.toFixed(1)}% share • ${formatCurrency(strongestRegion.totalRevenue)} revenue` : "Regional insights pending"} badge={strongestRegion ? "Regional leader" : undefined} />
                    <InsightTile label="Pipeline Summary" value={formatCurrency(pipelineSummary.totalValue)} description={`${pipelineSummary.totalCount.toLocaleString()} open opportunities across all stages`} />
                  </div>
                </Section>
                {isFeatureEnabled('analytics_trends') && (
                  <Section title="Engagement" description="Cadence & conversion impact">
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Weekly Velocity</span>
                          <Badge variant="outline" className="rounded-full border-slate-200 dark:border-slate-700 text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Operational</Badge>
                        </div>
                        <Progress value={insights ? Math.min(insights.quoteFrequency * 8, 100) : 0} className="h-2 rounded-full bg-slate-100 dark:bg-slate-800" indicatorClassName="bg-slate-900 dark:bg-white" aria-valuenow={insights ? Math.min(insights.quoteFrequency * 8, 100) : 0} />
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{insights ? `${insights.quoteFrequency} quotes issued weekly with ${insights.conversionTrend.toFixed(1)}% conversion velocity.` : "Metrics pending activity."}</p>
                      </div>
                      <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10 px-4 py-3">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-wide">Strategic Watchlist</span>
                        </div>
                        <p className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed font-medium">Focus on high-value pursuits above {formatCurrency(Number(data.overview.avgQuoteValue.replace(/[^0-9.-]+/g,"")))} and reinforce follow-up on stalled approvals.</p>
                      </div>
                    </div>
                  </Section>
                )}
              </aside>
              <div className="space-y-6 order-1 lg:order-2">
                {isFeatureEnabled('analytics_charts') && (
                  <Section title="Revenue & Volume Trend" description="Combined view of revenue and quote activity" actions={<Badge variant="outline" className="gap-1 rounded-full border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"><CheckCircle2 className="h-3 w-3" /> YTD</Badge>}>
                    <div className="h-[300px] sm:h-[350px] lg:h-[400px] w-full" role="figure" aria-label="Revenue and quotes trend chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.4} />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                          <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                          <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "12px" }} />
                          <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                          <Area yAxisId="left" type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={3} fill="url(#revenueGradient)" name="Revenue" />
                          <Line yAxisId="right" type="monotone" dataKey="quotes" stroke={COLORS.secondary} strokeWidth={3} dot={{ fill: COLORS.secondary, r: 4, strokeWidth: 2, stroke: "white" }} name="Quotes" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </Section>
                )}
                
                <Section title="Top Accounts" description="Key revenue contributors this period">
                  <div className="space-y-3">
                    {data.topClients.slice(0, 5).map((client, i) => {
                      const totalQuotes = data.topClients.reduce((acc, c) => acc + c.quoteCount, 0);
                      const share = totalQuotes > 0 ? (client.quoteCount / totalQuotes * 100).toFixed(1) : "0.0";
                      return (
                        <div key={client.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-sm font-bold text-white dark:text-slate-900 shadow-md transform transition-transform hover:scale-110" aria-label={`Rank ${i + 1}`}>{i + 1}</div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={client.name}>{client.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className="text-[10px] px-1.5 h-5">{client.quoteCount} deals</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{formatCurrency(Number(client.totalRevenue.replace(/[^0-9.-]+/g,"")))}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Share {share}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Section>
                
                {isFeatureEnabled('analytics_charts') && (
                  <Section title="Status Distribution" description="Pipeline balance across stages" actions={<Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" aria-label="Refresh status distribution"><RefreshCw className="h-3.5 w-3.5" />Refresh</Button>}>
                    <div className="h-[250px] sm:h-[300px] w-full" role="figure" aria-label="Status distribution bar chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.statusBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.4} />
                          <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "12px" }} />
                          <Legend iconType="circle" />
                          <Bar dataKey="count" name="Quotes" fill={COLORS.primary} radius={[6, 6, 0, 0]} barSize={40} />
                          <Bar dataKey="value" name="Value" fill={COLORS.secondary} radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Section>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {isFeatureEnabled('analytics_forecasting') && (
                <Section title="Revenue Forecast" description="Projected trajectory for upcoming cycles">
                  <div className="h-[280px] sm:h-[320px]" role="figure" aria-label="Revenue forecast area chart">
                    {forecast && forecast.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.4} />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "12px" }} />
                          <Area type="monotone" dataKey="forecastedRevenue" stroke={COLORS.success} strokeWidth={3} fill="url(#forecastGradient)" name="Forecasted Revenue" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400 flex-col gap-2">
                        <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                            <Activity className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium">Forecast data unavailable</p>
                      </div>
                    )}
                  </div>
                </Section>
              )}
              
              <Section title="Regional Performance" description="Revenue & momentum by region">
                <div className="space-y-4">
                  {regionalData && regionalData.length > 0 ? (
                    regionalData.map(region => (
                      <div key={region.region} className="rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                            <MapPin className="h-4 w-4 text-slate-500" /> {region.region}
                          </div>
                          <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-400 font-semibold">{region.percentage.toFixed(1)}%</Badge>
                        </div>
                        <Progress value={region.percentage} className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700" indicatorClassName="bg-slate-900 dark:bg-white" aria-valuenow={region.percentage} aria-label={`${region.region} share`} />
                          <div className="mt-2 flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> {region.quoteCount} quotes</span>
                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(region.totalRevenue)}</span>
                          </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-48 items-center justify-center text-slate-400 flex-col gap-2">
                         <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                             <MapPin className="h-6 w-6" />
                         </div>
                      <p className="text-sm font-medium">Regional insights unavailable</p>
                    </div>
                  )}
                </div>
              </Section>
            </div>
            
            <Section title="Deal Size Distribution" description="Breakdown of quote value ranges" actions={<Badge className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1">{dealDistribution ? `${dealDistribution.length} ranges` : "No data"}</Badge>}>
              {dealDistribution && dealDistribution.some(d => d.count > 0) ? (
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="h-[280px] sm:h-[320px] w-full" role="figure" aria-label="Deal size distribution pie chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie 
                          activeIndex={activeIndex}
                          activeShape={renderActiveShape} 
                          data={dealDistribution.filter(d => d.count > 0)} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={60} 
                          outerRadius={90} 
                          fill="#8884d8"
                          dataKey="count"
                          onMouseEnter={(_, index) => setActiveIndex(index)}
                          paddingAngle={2}
                        >
                          {dealDistribution.filter(d => d.count > 0).map((entry, i) => (
                            <Cell 
                              key={entry.range} 
                              fill={COLORS.chart[dealDistribution.findIndex(d => d.range === entry.range) % COLORS.chart.length]} 
                              strokeWidth={0} 
                            />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 flex flex-col justify-center">
                    {dealDistribution.map((item, i) => (
                      <div key={item.range} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="h-3 w-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: COLORS.chart[i % COLORS.chart.length] }} aria-hidden="true" />
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.range}</span>
                        </div>
                        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                          <p className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{item.count} deals</p>
                          <p className="whitespace-nowrap">{formatCurrency(item.totalValue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center text-slate-400 flex-col gap-2">
                     <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                        <PieChartIcon className="h-6 w-6" />
                     </div>
                  <p className="text-sm font-medium">Distribution data unavailable</p>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* Pipeline Tab */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            {pipeline && pipeline.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <Section title="Pipeline Coverage" description="Volume of opportunities across stages" actions={<Badge className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1">{pipeline.length} stages</Badge>}>
                  <div className="h-[280px] sm:h-[340px] lg:h-[400px]" role="figure" aria-label="Sales pipeline horizontal bar chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pipeline} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} opacity={0.4} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis dataKey="stage" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "12px" }} />
                        <Bar dataKey="count" fill={COLORS.primary} radius={[0, 6, 6, 0]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
                <div className="space-y-4">
                  {pipeline.map(stage => (
                    <Card key={stage.stage} className="border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow" aria-label={`Stage ${stage.stage}`}>
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-center justify-between">
                          <Badge className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm truncate max-w-[65%]" title={stage.stage}>{stage.stage}</Badge>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">{stage.count.toLocaleString()} quotes</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Total Value</p>
                            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white break-words">{formatCurrency(stage.totalValue)}</p>
                          </div>
                          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Avg Deal</p>
                            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white break-words">{formatCurrency(stage.avgDealValue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg">
                <CardContent className="flex h-48 items-center justify-center text-slate-400 flex-col gap-2">
                     <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                         <LayoutDashboard className="h-6 w-6" />
                     </div>
                  <p className="text-sm font-medium">Pipeline data unavailable</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === "insights" && (
          <div className="space-y-6">
            {insights ? (
              <div className="space-y-6">
                <section aria-label="High-level insight metrics" className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
                  {([
                    { label: "Average Quote", value: formatCurrency(insights.avgQuoteValue), icon: DollarSign, sub: "Industry benchmark" },
                    { label: "Median Quote", value: formatCurrency(insights.medianQuoteValue), icon: BarChart3, sub: "Stability indicator" },
                    { label: "Quote Frequency", value: `${insights.quoteFrequency}/wk`, icon: Activity, sub: "Volume cadence" },
                    { label: "Conversion Rate", value: `${insights.conversionTrend.toFixed(1)}%`, icon: Target, sub: "Closing performance" }
                  ]).map(tile => (
                    <Card key={tile.label} className="group relative overflow-hidden rounded-2xl border-0 bg-white shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-100 dark:to-white">
                      <CardContent className="space-y-4 p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-white/70 dark:text-slate-900/70">{tile.label}</p>
                        <p className="text-3xl font-bold break-words text-white dark:text-slate-900 drop-shadow-sm" aria-live="polite">{tile.value}</p>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-white/90 dark:text-slate-900/90">
                          <tile.icon className="h-4 w-4" /> {tile.sub}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </section>
                <section aria-label="Narrative insights" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 shadow-sm"><DollarSign className="h-5 w-5" /></div>
                        <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Deal Size Analysis</h3><p className="text-xs text-slate-500 dark:text-slate-400">Variance check</p></div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Average quote value of {formatCurrency(insights.avgQuoteValue)} compared to median {formatCurrency(insights.medianQuoteValue)} suggests {insights.avgQuoteValue > insights.medianQuoteValue ? "premium outliers pushing revenue opportunities higher." : "consistency across most engagements with balanced deal sizes."}</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 shadow-sm"><Activity className="h-5 w-5" /></div>
                        <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Activity Momentum</h3><p className="text-xs text-slate-500 dark:text-slate-400">Cadence health</p></div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{insights.quoteFrequency} weekly quotes indicate {insights.quoteFrequency > 10 ? "exceptional pipeline coverage across teams." : insights.quoteFrequency > 5 ? "healthy prospecting rhythm sustaining consistent inflow." : "a moderate cadence with potential to accelerate demand generation."}</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 shadow-sm"><Target className="h-5 w-5" /></div>
                        <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Conversion Signal</h3><p className="text-xs text-slate-500 dark:text-slate-400">Close rate benchmark</p></div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Conversion at {insights.conversionTrend.toFixed(1)}% is {insights.conversionTrend > 30 ? "outperforming industry peers—maintain momentum with executive reviews." : insights.conversionTrend > 20 ? "competitive; optimizing follow-up touchpoints could unlock additional lift." : "trailing average; consider revisiting pricing or qualification strategy."}</p>
                    </CardContent>
                  </Card>
                </section>
                <Section title="Strategic Recommendations" description="Actionable next steps derived from current performance">
                  <div className="grid gap-4 md:grid-cols-2">
                    {([
                      { icon: TrendingUp, title: "Growth acceleration", body: "Expand enablement in top regions and reinforce premium offer packaging to sustain high-value wins." },
                      { icon: Users, title: "Client retention", body: "Launch executive QBRs for strategic accounts and introduce loyalty pricing for renewal cycles." },
                      { icon: Target, title: "Pipeline discipline", body: "Standardize stage exit criteria and automate escalation for stalled deals beyond 14 days." },
                      { icon: BarChart3, title: "Market intelligence", body: "Benchmark pricing quarterly and align positioning with emerging competitor offerings." }
                    ]).map(item => (
                      <div key={item.title} className="rounded-xl bg-white/50 dark:bg-slate-800/50 p-4 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                          <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-bold">{item.title}</span>
                        </div>
                        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            ) : (
              <Card className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg">
                 <CardContent className="flex h-48 items-center justify-center text-slate-400 flex-col gap-2">
                     <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                         <Sparkles className="h-6 w-6" />
                     </div>
                  <p className="text-sm font-medium">Insight data unavailable</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
  RefreshCw
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
  Line
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  overview: {
    totalQuotes: number;
    totalRevenue: string;
    avgQuoteValue: string;
    conversionRate: string;
  };
  monthlyData: Array<{
    month: string;
    quotes: number;
    revenue: number;
    conversions: number;
  }>;
  topClients: Array<{
    name: string;
    totalRevenue: string;
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
    up: "text-success bg-success/10",
    down: "text-destructive bg-destructive/10",
    neutral: "text-muted-foreground bg-muted"
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
  <Card className="border border-border shadow-sm transition-shadow hover:shadow-md" aria-labelledby={`stat-${title}`}> <CardContent className="p-5 lg:p-6"> <div className="flex items-start justify-between gap-4"> <div className="space-y-2"> <p id={`stat-${title}`} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p> <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground" aria-live="polite">{typeof value === "number" ? value.toLocaleString() : value}</div> {caption && <p className="text-xs text-muted-foreground">{caption}</p>} </div> <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground" aria-hidden="true"> <Icon className="h-6 w-6" /> </div> </div> <div className="mt-4 flex items-center gap-3 flex-wrap"> <TrendBadge change={change} trend={trend} /> {change && <span className="text-xs text-muted-foreground">vs previous period</span>} </div> </CardContent> </Card>
);

const InsightTile = ({ label, value, description, badge }: { label: string; value: string; description: string; badge?: string }) => (
  <div className="rounded-xl border border-border bg-card p-4 shadow-sm" role="group" aria-label={label}> <div className="flex items-center justify-between"> <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p> {badge && <Badge variant="outline" className="rounded-full border-border bg-muted text-xs font-semibold text-foreground">{badge}</Badge>} </div> <p className="mt-2 text-lg font-semibold text-foreground break-words" aria-live="polite">{value}</p> <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p> </div>
);

// Section wrappers
const Section = ({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) => (
  <Card className="border border-border shadow-sm" aria-labelledby={`section-${title}`}> <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"> <div> <CardTitle id={`section-${title}`} className="text-base sm:text-lg font-semibold text-foreground">{title}</CardTitle> {description && <CardDescription className="text-xs sm:text-sm text-muted-foreground">{description}</CardDescription>} </div> {actions} </CardHeader> <CardContent>{children}</CardContent> </Card>
);

// Loading skeleton
const LoadingState = () => (
  <div className="min-h-screen bg-background"> <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10 space-y-8"> <Skeleton className="h-40 rounded-2xl" /> <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"> {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)} </div> <div className="grid gap-6 lg:grid-cols-[2fr_1fr]"> <Skeleton className="h-96 rounded-2xl" /> <Skeleton className="h-96 rounded-2xl" /> </div> </div> </div>
);

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("12");
  const [activeTab, setActiveTab] = useState("overview");

  // Data Queries
  const { data, isLoading, isError } = useQuery<AnalyticsData>({ queryKey: ["/api/analytics", timeRange] });
  const { data: forecast } = useQuery<RevenueForecast[]>({ queryKey: ["/api/analytics/forecast"] });
  const { data: dealDistribution } = useQuery<DealDistribution[]>({ queryKey: ["/api/analytics/deal-distribution"] });
  const { data: regionalData } = useQuery<RegionalData[]>({ queryKey: ["/api/analytics/regional"] });
  const { data: pipeline } = useQuery<PipelineStage[]>({ queryKey: ["/api/analytics/pipeline"] });
  const { data: insights } = useQuery<CompetitorInsights>({ queryKey: ["/api/analytics/competitor-insights"] });
  const { data: vendorAnalytics } = useQuery<VendorAnalytics>({
    queryKey: ["/api/analytics/vendor-spend", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/vendor-spend?timeRange=${timeRange}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch vendor analytics");
      return response.json();
    },
  });

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
    <div className="min-h-screen bg-background pb-6 sm:pb-10">
      <header className="border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-40">
        <div className="mx-auto max-w-[1440px] px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Executive Analytics
              </span>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">Revenue Operations Intelligence</h1>
                <p className="max-w-2xl text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">Unified analytics workspace to monitor growth, pipeline health, and operational efficiency.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 w-full sm:w-auto">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="h-9 sm:h-10 w-full border-none bg-transparent px-0 text-xs sm:text-sm focus:ring-0 sm:w-[160px]">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Last 3 months</SelectItem>
                    <SelectItem value="6">Last 6 months</SelectItem>
                    <SelectItem value="12">Last 12 months</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" className="h-9 sm:h-10 w-full gap-2 rounded-lg border-border text-xs sm:text-sm sm:w-auto" aria-label="Open advanced filters">
                  <Filter className="h-4 w-4" /> Filters
                </Button>
                <Button className="h-9 sm:h-10 w-full gap-2 rounded-lg bg-gradient-to-r from-secondary to-primary text-xs sm:text-sm font-bold text-white hover:from-primary hover:to-secondary shadow-md sm:w-auto" aria-label="Export analytics report">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </div>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full gap-1 sm:gap-2 overflow-x-auto rounded-xl border border-border bg-card p-1 sm:p-1.5 shadow-sm scrollbar-hide" aria-label="Analytics Sections">
              {(["overview", "performance", "pipeline", "insights"] as const).map(k => (
                <TabsTrigger key={k} value={k} className="min-w-[90px] sm:min-w-[110px] flex-1 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md whitespace-nowrap">
                  {k === "overview" ? "Snapshot" : k.charAt(0).toUpperCase() + k.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 sm:space-y-10">
        {isError && (
          <Card className="border border-destructive/30 bg-destructive/10">
            <CardContent className="p-4 flex items-center gap-3">
              <p className="text-sm font-medium text-destructive">Failed to load analytics data. Please retry.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />Reload
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && data && (
          <div className="space-y-6 sm:space-y-8">
            <section aria-label="Key Performance Indicators">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Quotes" value={data.overview.totalQuotes} change="12.5%" icon={FileText} trend="up" caption="Active proposals YTD" />
                <StatCard title="Total Revenue" value={`₹${data.overview.totalRevenue}`} change="23.1%" icon={DollarSign} trend="up" caption="Closed revenue" />
                <StatCard title="Average Deal Size" value={`₹${data.overview.avgQuoteValue}`} change="8.3%" icon={TrendingUp} trend="up" caption="Mean quote value" />
                <StatCard title="Conversion Rate" value={`${data.overview.conversionRate}%`} change="-2.4%" icon={Target} trend="down" caption="Quote-to-close ratio" />
              </div>
            </section>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(240px,300px)_1fr]">
              <aside className="space-y-4 sm:space-y-6 order-2 lg:order-1" aria-label="Executive Insights">
                <Section title="Executive Summary" description="Latest performance highlights">
                  <div className="space-y-4">
                    <InsightTile label="Latest Month" value={latestMonth ? latestMonth.month : "—"} description={latestMonth ? `Revenue ₹${latestMonth.revenue.toLocaleString()} with ${latestMonth.quotes} quotes issued` : "No recent month data available"} badge={latestMonth ? "Most recent" : undefined} />
                    <InsightTile label="Leading Region" value={strongestRegion ? strongestRegion.region : "—"} description={strongestRegion ? `${strongestRegion.percentage.toFixed(1)}% share • ₹${strongestRegion.totalRevenue.toLocaleString()} revenue` : "Regional insights pending"} badge={strongestRegion ? "Regional leader" : undefined} />
                    <InsightTile label="Pipeline Summary" value={`₹${pipelineSummary.totalValue.toLocaleString()}`} description={`${pipelineSummary.totalCount.toLocaleString()} open opportunities across all stages`} />
                  </div>
                </Section>
                <Section title="Engagement Signals" description="Cadence & conversion impact">
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Weekly Quote Velocity</span>
                        <Badge variant="outline" className="rounded-full border-border text-xs text-muted-foreground">Operational</Badge>
                      </div>
                      <Progress value={insights ? Math.min(insights.quoteFrequency * 8, 100) : 0} className="h-2 rounded-full bg-muted" aria-valuenow={insights ? Math.min(insights.quoteFrequency * 8, 100) : 0} aria-label="Quote velocity progress" />
                      <p className="text-xs sm:text-sm text-muted-foreground">{insights ? `${insights.quoteFrequency} quotes issued weekly with ${insights.conversionTrend.toFixed(1)}% conversion velocity.` : "Engagement metrics will appear once activity resumes."}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted px-4 py-3">
                      <div className="flex items-center gap-2 text-foreground">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-medium">Strategic Watchlist</span>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">Focus on high-value pursuits above ₹{data.overview.avgQuoteValue} and reinforce follow-ups on stalled approvals.</p>
                    </div>
                  </div>
                </Section>
              </aside>
              <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
                <Section title="Revenue & Volume Trend" description="Combined view of revenue and quote activity" actions={<Badge variant="outline" className="gap-1 rounded-full border-primary/30 bg-primary/10 text-xs text-primary"><CheckCircle2 className="h-3 w-3" /> YTD</Badge>}>
                  <div className="h-[220px] xs:h-[260px] sm:h-[300px] md:h-[340px] lg:h-[380px]" role="figure" aria-label="Revenue and quotes trend chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data.monthlyData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                        <YAxis yAxisId="left" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} tickFormatter={(v) => `₹${v}`} />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                        <Tooltip contentStyle={{ borderRadius: 12, borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))" }} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: 16 }} />
                        <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--foreground))" strokeWidth={3} fill="url(#revenueGradient)" name="Revenue (₹)" />
                        <Line yAxisId="right" type="monotone" dataKey="quotes" stroke="hsl(var(--foreground))" strokeWidth={3} dot={{ fill: "hsl(var(--foreground))", r: 4 }} name="Quotes" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
                <Section title="Top Accounts" description="Key revenue contributors this period">
                  <div className="space-y-3">
                    {data.topClients.slice(0, 5).map((client, i) => {
                      const totalQuotes = data.topClients.reduce((acc, c) => acc + c.quoteCount, 0);
                      return (
                        <div key={client.name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white shadow-md" aria-label={`Rank ${i + 1}`}>{i + 1}</div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground truncate" title={client.name}>{client.name}</p>
                              <p className="text-xs text-muted-foreground">{client.quoteCount} {client.quoteCount === 1 ? "quote" : "quotes"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground whitespace-nowrap">₹{client.totalRevenue}</p>
                            <p className="text-xs text-muted-foreground">Share {(client.quoteCount / totalQuotes * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Section>
                <Section title="Status Distribution" description="Pipeline balance across stages" actions={<Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground" aria-label="Refresh status distribution"><RefreshCw className="h-4 w-4" />Refresh</Button>}>
                  <div className="h-[220px] xs:h-[260px] sm:h-[300px] md:h-[340px] lg:h-[380px]" role="figure" aria-label="Status distribution bar chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.statusBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="status" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                        <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                        <Tooltip contentStyle={{ borderRadius: 12, borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))" }} />
                        <Legend iconType="circle" />
                        <Bar dataKey="count" name="Quotes" fill={COLORS.primary} radius={[8, 8, 0, 0]} barSize={36} />
                        <Bar dataKey="value" name="Value (₹)" fill={COLORS.secondary} radius={[8, 8, 0, 0]} barSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2">
              <Section title="Revenue Forecast" description="Projected trajectory for upcoming cycles">
                <div className="h-[220px] xs:h-[260px] sm:h-[300px] md:h-[320px]" role="figure" aria-label="Revenue forecast area chart">
                  {forecast && forecast.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast}>
                        <defs>
                          <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                        <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip contentStyle={{ borderRadius: 12, borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))" }} />
                        <Area type="monotone" dataKey="forecastedRevenue" stroke={COLORS.success} strokeWidth={3} fill="url(#forecastGradient)" name="Forecasted Revenue (₹)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground flex-col">
                      <Activity className="mb-2 h-10 w-10" />
                      <p className="text-sm font-medium">Forecast data unavailable</p>
                    </div>
                  )}
                </div>
              </Section>
              <Section title="Regional Performance" description="Revenue & momentum by region">
                <div className="space-y-4">
                  {regionalData && regionalData.length > 0 ? (
                    regionalData.map(region => (
                      <div key={region.region} className="rounded-xl border border-border bg-muted p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <MapPin className="h-4 w-4 text-accent" /> {region.region}
                          </div>
                          <Badge variant="outline" className="rounded-full border-accent/30 bg-accent/10 text-xs text-accent">{region.percentage.toFixed(1)}%</Badge>
                        </div>
                        <Progress value={region.percentage} className="mt-3 h-2 rounded-full bg-card" aria-valuenow={region.percentage} aria-label={`${region.region} share`} />
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{region.quoteCount.toLocaleString()} quotes</span>
                          <span className="font-semibold text-foreground">₹{region.totalRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-48 items-center justify-center text-muted-foreground flex-col">
                      <MapPin className="mb-2 h-10 w-10" />
                      <p className="text-sm font-medium">Regional insights unavailable</p>
                    </div>
                  )}
                </div>
              </Section>
            </div>
            <Section title="Deal Size Distribution" description="Breakdown of quote value ranges" actions={<Badge className="rounded-full bg-gradient-to-r from-accent to-primary text-xs text-white">{dealDistribution ? `${dealDistribution.length} ranges` : "No data"}</Badge>}>
              {dealDistribution && dealDistribution.length > 0 ? (
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="h-[280px] sm:h-[320px]" role="figure" aria-label="Deal size distribution pie chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie data={dealDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={110} dataKey="count">
                          {dealDistribution.map((entry, i) => (
                            <Cell key={entry.range} fill={COLORS.chart[i % COLORS.chart.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const datum = payload[0].payload as DealDistribution;
                            return (
                              <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-md">
                                <p className="text-sm font-semibold text-foreground">{datum.range}</p>
                                <p className="mt-2">Count: {datum.count}</p>
                                <p>Value: ₹{datum.totalValue.toLocaleString()}</p>
                                <p>Share: {datum.percentage.toFixed(1)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {dealDistribution.map((item, i) => (
                      <div key={item.range} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS.chart[i % COLORS.chart.length] }} aria-hidden="true" />
                          <span className="text-sm font-medium text-foreground truncate">{item.range}</span>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p className="font-semibold text-foreground whitespace-nowrap">{item.count} deals</p>
                          <p className="whitespace-nowrap">₹{item.totalValue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center text-muted-foreground flex-col">
                  <PieChartIcon className="mb-2 h-10 w-10" />
                  <p className="text-sm font-medium">Distribution data unavailable</p>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* Pipeline Tab */}
        {activeTab === "pipeline" && (
          <div className="space-y-8">
            {pipeline && pipeline.length > 0 ? (
              <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                <Section title="Pipeline Coverage" description="Volume of opportunities across stages" actions={<Badge className="rounded-full bg-gradient-to-r from-secondary to-primary text-xs text-white">{pipeline.length} stages</Badge>}>
                  <div className="h-[260px] xs:h-[300px] sm:h-[340px] lg:h-[380px]" role="figure" aria-label="Sales pipeline horizontal bar chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pipeline} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                        <YAxis dataKey="stage" type="category" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} width={120} />
                        <Tooltip contentStyle={{ borderRadius: 12, borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))" }} />
                        <Bar dataKey="count" fill={COLORS.primary} radius={[0, 8, 8, 0]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
                <div className="space-y-4">
                  {pipeline.map(stage => (
                    <Card key={stage.stage} className="border border-border bg-muted shadow-sm" aria-label={`Stage ${stage.stage}`}>
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-center justify-between">
                          <Badge className="rounded-full bg-gradient-to-r from-secondary to-primary text-xs font-bold text-white shadow-sm truncate max-w-[60%]" title={stage.stage}>{stage.stage}</Badge>
                          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{stage.count.toLocaleString()} quotes</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg bg-card p-3">
                            <p className="text-xs text-muted-foreground">Total Value</p>
                            <p className="mt-1 text-sm font-semibold text-foreground break-words">₹{stage.totalValue.toLocaleString()}</p>
                          </div>
                          <div className="rounded-lg bg-card p-3">
                            <p className="text-xs text-muted-foreground">Avg Deal</p>
                            <p className="mt-1 text-sm font-semibold text-foreground break-words">₹{stage.avgDealValue.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border border-border shadow-sm">
                <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
                  <p className="text-sm font-medium">Pipeline data unavailable</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === "insights" && (
          <div className="space-y-8">
            {insights ? (
              <div className="space-y-8">
                <section aria-label="High-level insight metrics" className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
                  {([
                    { label: "Average Quote", value: `₹${insights.avgQuoteValue.toLocaleString()}`, icon: DollarSign, sub: "Industry benchmark" },
                    { label: "Median Quote", value: `₹${insights.medianQuoteValue.toLocaleString()}`, icon: BarChart3, sub: "Stability indicator" },
                    { label: "Quote Frequency", value: `${insights.quoteFrequency}/wk`, icon: Activity, sub: "Volume cadence" },
                    { label: "Conversion Rate", value: `${insights.conversionTrend.toFixed(1)}%`, icon: Target, sub: "Closing performance" }
                  ]).map(tile => (
                    <Card key={tile.label} className="border-2 border-primary/30 bg-gradient-to-br from-primary to-secondary shadow-md">
                      <CardContent className="space-y-4 p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-white">{tile.label}</p>
                        <p className="text-3xl font-bold break-words text-white drop-shadow-sm" aria-live="polite">{tile.value}</p>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-white/95">
                          <tile.icon className="h-4 w-4" /> {tile.sub}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </section>
                <section aria-label="Narrative insights" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="border border-border shadow-sm">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow-sm"><DollarSign className="h-5 w-5" /></div>
                        <div><h3 className="text-sm font-semibold text-foreground">Deal Size Analysis</h3><p className="text-xs text-muted-foreground">Average vs median variance</p></div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Average quote value of ₹{insights.avgQuoteValue.toLocaleString()} compared to median ₹{insights.medianQuoteValue.toLocaleString()} suggests {insights.avgQuoteValue > insights.medianQuoteValue ? "premium outliers pushing revenue opportunities higher." : "consistency across most engagements with balanced deal sizes."}</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border shadow-sm">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-primary text-white shadow-sm"><Activity className="h-5 w-5" /></div>
                        <div><h3 className="text-sm font-semibold text-foreground">Activity Momentum</h3><p className="text-xs text-muted-foreground">Cadence health</p></div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{insights.quoteFrequency} weekly quotes indicate {insights.quoteFrequency > 10 ? "exceptional pipeline coverage across teams." : insights.quoteFrequency > 5 ? "healthy prospecting rhythm sustaining consistent inflow." : "a moderate cadence with potential to accelerate demand generation."}</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border shadow-sm">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-success/90 to-success text-white shadow-sm"><Target className="h-5 w-5" /></div>
                        <div><h3 className="text-sm font-semibold text-foreground">Conversion Signal</h3><p className="text-xs text-muted-foreground">Close rate benchmark</p></div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Conversion at {insights.conversionTrend.toFixed(1)}% is {insights.conversionTrend > 30 ? "outperforming industry peers—maintain momentum with executive reviews." : insights.conversionTrend > 20 ? "competitive; optimizing follow-up touchpoints could unlock additional lift." : "trailing average; consider revisiting pricing or qualification strategy."}</p>
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
                      <div key={item.title} className="rounded-xl border border-border bg-muted p-4">
                        <div className="flex items-center gap-2 text-foreground">
                          <item.icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{item.title}</span>
                        </div>
                        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            ) : (
              <Card className="border border-border shadow-sm">
                <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
                  <p className="text-sm font-medium">Insight data unavailable</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

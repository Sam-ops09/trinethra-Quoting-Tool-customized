import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  ChevronRight,
  Shield,
  Activity,
  FileText,
  Users,
  Receipt,
  Package,
  Search,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

type AuditLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: any;
  timestamp: string;
  userName: string | null;
};

type AuditStats = { entityType: string; count: number }[];

const PAGE_SIZE = 30;

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  quote: <FileText className="h-3.5 w-3.5" />,
  invoice: <Receipt className="h-3.5 w-3.5" />,
  client: <Users className="h-3.5 w-3.5" />,
  user: <Users className="h-3.5 w-3.5" />,
  product: <Package className="h-3.5 w-3.5" />,
  sales_order: <Package className="h-3.5 w-3.5" />,
  vendor_po: <Package className="h-3.5 w-3.5" />,
};

const ENTITY_COLORS: Record<string, string> = {
  quote: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  invoice: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  client: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  user: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  product: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  sales_order: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  payment: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  vendor_po: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AuditTrail() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(0);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [searchAction, setSearchAction] = useState("");

  const filters = new URLSearchParams();
  filters.set("offset", String(page * PAGE_SIZE));
  filters.set("limit", String(PAGE_SIZE));
  if (entityFilter !== "all") filters.set("entityType", entityFilter);
  if (searchAction) filters.set("action", searchAction);

  const { data, isLoading } = useQuery<{ logs: AuditLog[]; total: number }>({
    queryKey: ["/api/activity-logs", page, entityFilter, searchAction],
    queryFn: async () => {
      const res = await fetch(`/api/activity-logs?${filters.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: stats } = useQuery<AuditStats>({
    queryKey: ["/api/activity-logs/stats"],
    queryFn: async () => {
      const res = await fetch("/api/activity-logs/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const totalActions = stats?.reduce((s, e) => s + e.count, 0) || 0;

  return (
    <div className="min-h-screen w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
            <Shield className="h-3.5 w-3.5" />
            Audit Trail
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-900 dark:bg-slate-100">
                <Shield className="h-5 w-5 text-white dark:text-slate-900" />
              </div>
              Audit Trail
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {total.toLocaleString()} actions recorded
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800">
                  <Activity className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{totalActions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {stats?.slice(0, 4).map((stat) => (
            <Card key={stat.entityType} className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${ENTITY_COLORS[stat.entityType] || "bg-slate-100 text-slate-600"}`}>
                    {ENTITY_ICONS[stat.entityType] || <Activity className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      {stat.entityType}
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.count.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search actions..."
                  value={searchAction}
                  onChange={(e) => {
                    setSearchAction(e.target.value);
                    setPage(0);
                  }}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select
                value={entityFilter}
                onValueChange={(v) => {
                  setEntityFilter(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {stats?.map((s) => (
                    <SelectItem key={s.entityType} value={s.entityType}>
                      {s.entityType.charAt(0).toUpperCase() + s.entityType.slice(1)} ({s.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity Log
              <Badge variant="secondary" className="text-[10px]">{total}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Shield className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No activity found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    {/* Entity Badge */}
                    <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${ENTITY_COLORS[log.entityType] || "bg-slate-100 text-slate-600"}`}>
                      {ENTITY_ICONS[log.entityType] || <Activity className="h-3.5 w-3.5" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {log.userName || "System"}
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                        <span className="text-xs text-slate-700 dark:text-slate-300">
                          {formatAction(log.action)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${ENTITY_COLORS[log.entityType] || ""}`}
                        >
                          {log.entityType}
                        </Badge>
                        {log.entityId && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[120px]">
                            {log.entityId.substring(0, 8)}...
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {timeAgo(log.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(log.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  Previous
                </Button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 text-xs"
                >
                  Next
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

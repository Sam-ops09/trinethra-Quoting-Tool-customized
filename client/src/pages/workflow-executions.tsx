import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    RefreshCw,
    Home,
    ChevronRight,
    Zap,
    Activity,
    Timer,
    LayoutList,
    Play
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Execution {
  id: string;
  workflowId: string;
  triggerType: string;
  status: "success" | "failure" | "pending";
  triggeredAt: string;
  completedAt: string | null;
  executionTimeMs: number | null;
  errorMessage: string | null;
  triggeredBy: string;
  contextData: any;
  executionLog: any[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
}

export default function WorkflowExecutions() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = params.id;

  const { data: workflow, isLoading: isLoadingWorkflow } = useQuery<Workflow>({
    queryKey: [`/api/workflows/${id}`],
  });

  const { toast } = useToast();
  const { data: executions, isLoading: isLoadingExecutions, refetch, isRefetching } = useQuery<Execution[]>({
    queryKey: [`/api/workflows/${id}/executions`],
  });

  const handleRefresh = async () => {
      await refetch();
      toast({
          title: "Refreshed",
          description: "Execution history updated",
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Success</Badge>;
      case "failure":
        return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-0"><Clock className="w-3 h-3 mr-1" /> Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDuration = (ms: number | null | undefined) => {
    if (ms === null || ms === undefined) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (dateString: string | null) => {
     if (!dateString) return { date: "N/A", time: "" };
     try {
       const date = new Date(dateString);
       if (isNaN(date.getTime())) return { date: "Invalid Date", time: "" };
       return {
         date: format(date, "MMM d, yyyy"),
         time: format(date, "h:mm:ss a")
       };
     } catch (e) {
       return { date: "Error", time: "" };
     }
  };
  
  // Calculate Stats
  const stats = {
      total: executions?.length || 0,
      success: executions?.filter(e => e.status === 'success').length || 0,
      failed: executions?.filter(e => e.status === 'failure').length || 0,
      avgDuration: executions 
          ? executions.reduce((acc, curr) => acc + (curr.executionTimeMs || 0), 0) / (executions.length || 1) 
          : 0
  };

  if (isLoadingWorkflow) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-[400px] w-full" />
            </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Workflow Not Found</h2>
        <Button onClick={() => setLocation("/workflows")}>Back to Workflows</Button>
      </div>
    );
  }

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
                onClick={() => setLocation("/workflows")}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
            >
                Workflows
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                <Activity className="h-3.5 w-3.5" />
                Execution History
            </span>
        </nav>

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <div className="relative px-6 sm:px-8 py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 shadow-lg">
                                <Zap className="h-6 w-6 text-white dark:text-slate-900" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                    {workflow.name}
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                    Execution history and logs
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button 
                            variant="outline" 
                            onClick={() => setLocation("/workflows")}
                            className="flex-1 sm:flex-none"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <Button 
                            variant="default" 
                            onClick={handleRefresh}
                            disabled={isRefetching}
                            className="flex-1 sm:flex-none bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                            <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="relative p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Total Runs</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-md">
                            <Play className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        </div>
                    </div>
                </CardContent>
             </Card>

             <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="relative p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Success</p>
                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.success}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 shadow-md">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </CardContent>
             </Card>

             <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="relative p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Refusals</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0 shadow-md">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </CardContent>
             </Card>

             <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="relative p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Avg Duration</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatDuration(Math.round(stats.avgDuration))}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 shadow-md">
                            <Timer className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </CardContent>
             </Card>
        </div>

        {/* Main Content */}
        <Card className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-2">
                    <LayoutList className="h-5 w-5 text-indigo-500" />
                    <CardTitle className="text-lg font-bold">Recent Executions</CardTitle>
                </div>
                <CardDescription>
                    Detailed execution logs and status for this workflow
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-b-2xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Status</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Triggered By</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Date & Time</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Duration</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Error Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingExecutions ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    </TableRow>
                                ))
                            ) : executions?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Activity className="h-12 w-12 mb-4 opacity-20" />
                                            <p className="text-lg font-medium text-slate-900 dark:text-slate-200">No executions found</p>
                                            <p className="text-sm">This workflow hasn't been triggered yet.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                executions?.map((execution) => {
                                    const dateInfo = formatDate(execution.triggeredAt);
                                    return (
                                        <TableRow key={execution.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <TableCell className="py-4">{getStatusBadge(execution.status)}</TableCell>
                                            <TableCell className="font-medium text-slate-700 dark:text-slate-300 py-4">
                                                {execution.triggeredBy.startsWith("user:") 
                                                    ? "User Action" 
                                                    : execution.triggeredBy}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900 dark:text-slate-200">
                                                        {dateInfo.date}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {dateInfo.time}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400 py-4">
                                                {formatDuration(execution.executionTimeMs)}
                                            </TableCell>
                                            <TableCell className="max-w-[300px] py-4">
                                                <div className="truncate text-slate-500 dark:text-slate-400" title={execution.errorMessage || ""}>
                                                    {execution.errorMessage || "-"}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

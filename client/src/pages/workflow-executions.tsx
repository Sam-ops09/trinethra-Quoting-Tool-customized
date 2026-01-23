import { useParams, Link } from "wouter";
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
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const id = params.id;

  const { data: workflow, isLoading: isLoadingWorkflow } = useQuery<Workflow>({
    queryKey: [`/api/workflows/${id}`],
  });

  const { data: executions, isLoading: isLoadingExecutions, refetch } = useQuery<Execution[]>({
    queryKey: [`/api/workflows/${id}/executions`],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Success</Badge>;
      case "failure":
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case "pending":
      case "running":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Running</Badge>;
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

  if (isLoadingWorkflow) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Workflow Not Found</h2>
        <Link href="/workflows">
          <Button>Back to Workflows</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-muted-foreground mb-2">
            <Link href="/workflows">
              <Button variant="ghost" size="sm" className="pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workflows
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Execution History</h1>
          <p className="text-muted-foreground">
            History for workflow: <span className="font-semibold text-foreground">{workflow.name}</span>
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>
            List of all triggered runs for this workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Triggered By</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Error Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingExecutions ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    </TableRow>
                  ))
                ) : executions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No executions found for this workflow yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  executions?.map((execution) => {
                    const dateInfo = formatDate(execution.triggeredAt);
                    return (
                    <TableRow key={execution.id}>
                      <TableCell>{getStatusBadge(execution.status)}</TableCell>
                      <TableCell className="font-medium">
                        {execution.triggeredBy.startsWith("user:") 
                          ? "User Action" 
                          : execution.triggeredBy}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {dateInfo.date}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {dateInfo.time}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDuration(execution.executionTimeMs)}</TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground" title={execution.errorMessage || ""}>
                        {execution.errorMessage || "-"}
                      </TableCell>
                    </TableRow>
                  )})
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

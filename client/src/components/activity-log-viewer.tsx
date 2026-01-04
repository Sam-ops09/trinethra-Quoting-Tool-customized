import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  User,
  FileText,
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId: string | null;
  timestamp: string;
}

interface ActivityLogViewerProps {
  entityType?: string;
  entityId?: string;
  limit?: number;
  showUser?: boolean;
}

export function ActivityLogViewer({
  entityType,
  entityId,
  limit = 50,
  showUser = true
}: ActivityLogViewerProps) {
  // Always use the recent logs endpoint (admin only)
  // TODO: Implement filtered endpoint for entityType/entityId when needed
  const { data: logs, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs/recent"],
  });

  const getActionIcon = (action: string) => {
    if (action.includes("approve")) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (action.includes("reject") || action.includes("cancel")) return <XCircle className="h-4 w-4 text-red-600" />;
    if (action.includes("edit") || action.includes("update")) return <Edit className="h-4 w-4 text-blue-600" />;
    if (action.includes("delete")) return <Trash2 className="h-4 w-4 text-red-600" />;
    if (action.includes("lock")) return <Lock className="h-4 w-4 text-orange-600" />;
    if (action.includes("unlock")) return <Unlock className="h-4 w-4 text-green-600" />;
    if (action.includes("payment")) return <DollarSign className="h-4 w-4 text-green-600" />;
    if (action.includes("serial")) return <Package className="h-4 w-4 text-purple-600" />;
    if (action.includes("unauthorized")) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    return <FileText className="h-4 w-4 text-gray-600" />;
  };

  const getActionBadge = (action: string) => {
    if (action.includes("approve")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (action.includes("reject") || action.includes("cancel") || action.includes("delete"))
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (action.includes("lock")) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    if (action.includes("payment")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (action.includes("serial")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (action.includes("unauthorized")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  };

  const formatAction = (action: string): string => {
    return action
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>No activity recorded yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Log
        </CardTitle>
        <CardDescription>
          {logs.length} activit{logs.length === 1 ? 'y' : 'ies'} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="mt-0.5">
                  {getActionIcon(log.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getActionBadge(log.action)}>
                      {formatAction(log.action)}
                    </Badge>

                    {log.entityType && (
                      <span className="text-xs text-muted-foreground">
                        on {log.entityType.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  {showUser && log.userName && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{log.userName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


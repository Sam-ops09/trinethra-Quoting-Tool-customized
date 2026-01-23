import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Loader2, Lock, User, Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from "@/components/permission-guard";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";

// Define comment type based on schema
interface Comment {
  id: string;
  authorType: string;
  authorName: string;
  authorEmail?: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  parentCommentId?: string;
}

export interface CommentsSectionProps {
  entityId: string;
  entityType: "quote" | "sales_order" | "vendor_po" | "invoice";
  title?: string;
  className?: string;
}

export function CommentsSection({ 
  entityId, 
  entityType, 
  title = "Comments & Notes",
  className 
}: CommentsSectionProps) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);

  // Map entityType to API endpoint segments and resource names
  const config = {
    quote: { 
      endpoint: `/api/quotes`, 
      resource: "quotes" as const,
      queryKey: `/api/quotes/${entityId}/comments` 
    },
    sales_order: { 
      endpoint: `/api/sales-orders`, 
      resource: "sales-orders" as const,
      queryKey: `/api/sales-orders/${entityId}/comments`
    },
    vendor_po: { 
      endpoint: `/api/vendor-pos`, 
      resource: "vendor-pos" as const, // Maps to 'vendor_pos' in ResourceType
      queryKey: `/api/vendor-pos/${entityId}/comments`
    },
    invoice: { 
      endpoint: `/api/invoices`, 
      resource: "invoices" as const,
      queryKey: `/api/invoices/${entityId}/comments`
    }
  }[entityType];
 
  // IMPORTANT: For Sales Orders, if the route is mounted differently, we need to adjust. 
  // However, based on implementation in quote-workflow-routes.ts, it was router.get("/sales-orders/:id/comments"). 
  // If quoteWorkflowRoutes is mounted at /api, then /api/sales-orders/:id/comments is correct.

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [config.queryKey],
    enabled: !!entityId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `${config.endpoint}/${entityId}/comments`, {
        message: newComment,
        isInternal: isInternalComment,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      setNewComment("");
      toast({ title: "Comment Added", description: "Your comment has been added." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add comment", variant: "destructive" });
    },
  });

  return (
    <Card className={`border-slate-200 dark:border-slate-800 ${className}`}>
      <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800/60">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          {title}
          {comments.length > 0 && (
            <Badge variant="secondary" className="text-xs h-5 px-1.5 rounded-full">
              {comments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Comments List */}
        <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              No comments yet. Start a discussion!
            </div>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`flex gap-3 group ${comment.isInternal ? 'bg-amber-50/50 dark:bg-amber-950/10 -mx-2 p-2 rounded-lg border border-transparent hover:border-amber-100 dark:hover:border-amber-900/30' : ''}`}
              >
                <div className={`mt-0.5 shrink-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${comment.authorType === 'internal' 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' 
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                    }`}
                >
                    {comment.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                      {comment.authorName}
                    </span>
                    {comment.authorType === 'client' && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">Client</Badge>
                    )}
                    {comment.isInternal && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1 gap-1 text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900 dark:bg-amber-950/30">
                            <Lock className="h-2 w-2" /> Internal
                        </Badge>
                    )}
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                    {comment.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Section */}
        <PermissionGuard resource={config.resource} action="edit">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-3">
                    <Textarea
                        placeholder="Type your comment here..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px] resize-none bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-1" 
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsInternalComment(!isInternalComment)}
                            className={`h-8 gap-1.5 text-xs ${isInternalComment ? 'text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            {isInternalComment ? <Lock className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                            {isInternalComment ? "Internal Note" : "Public Comment"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => addCommentMutation.mutate()}
                            disabled={!newComment.trim() || addCommentMutation.isPending}
                            className="h-8 gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                        >
                            {addCommentMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            Post Comment
                        </Button>
                    </div>
                </div>
            </div>
        </PermissionGuard>
      </CardContent>
    </Card>
  );
}

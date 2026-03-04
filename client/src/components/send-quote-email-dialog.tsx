import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Lock } from "lucide-react";

interface SendQuoteEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  quoteNumber: string;
  clientEmail?: string;
  clientName?: string;
}

export function SendQuoteEmailDialog({
  open,
  onOpenChange,
  quoteId,
  quoteNumber,
  clientEmail,
  clientName,
}: SendQuoteEmailDialogProps) {
  const canSendQuoteEmail = useFeatureFlag("email_quoteSending");
  const [recipientEmail, setRecipientEmail] = useState(clientEmail || "");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
 
  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/quotes/${quoteId}/email`, {
        recipientEmail,
        message: message || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Email Sent",
        description: `Quote ${quoteNumber} has been sent to ${recipientEmail}`,
      });
      onOpenChange(false);
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Email",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address",
        variant: "destructive",
      });
      return;
    }
    sendEmailMutation.mutate();
  };
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle>Send Quote via Email</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Quote {quoteNumber}
                {clientName && ` • ${clientName}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
 
        {!canSendQuoteEmail ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold mb-1">Email Sending Locked</h3>
            <p className="text-xs text-muted-foreground max-w-[280px] mb-6 font-['Open_Sans']">
              The email sending feature is currently disabled. Please contact your administrator.
            </p>
            <Alert className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 text-left">
              <InfoIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-700 dark:text-amber-300 text-[10px] leading-relaxed">
                This prevents sending quotes, invoices, and other communications via email until enabled.
              </AlertDescription>
            </Alert>
            <Button 
                variant="outline" 
                className="mt-6 w-full h-9 text-xs"
                onClick={() => onOpenChange(false)}
            >
                Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold">
                Recipient Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="client@example.com"
                required
                className="h-9 text-xs"
                disabled={sendEmailMutation.isPending}
              />
            </div>
 
            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs font-semibold">
                Additional Message (Optional)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal note to the client..."
                rows={4}
                className="text-xs resize-none"
                disabled={sendEmailMutation.isPending}
              />
              <p className="text-[10px] text-muted-foreground">
                The quote PDF will be attached automatically
              </p>
            </div>
 
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sendEmailMutation.isPending}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendEmailMutation.isPending || !recipientEmail}
                className="h-9 text-xs"
              >
                {sendEmailMutation.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-3 w-3 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}


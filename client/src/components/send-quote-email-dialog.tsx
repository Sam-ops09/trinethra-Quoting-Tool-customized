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
      </DialogContent>
    </Dialog>
  );
}


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Calendar, DollarSign, Building2, Loader2 } from "lucide-react";
import { CreateVendorPoDialog } from "./create-vendor-po-dialog";

interface Quote {
  id: string;
  quoteNumber?: string;
  quote_number?: string;
  clientName?: string;
  client_name?: string;
  status: string;
  total: string;
  createdAt?: string;
  created_at?: string;
}

interface SelectQuoteForPoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "sent":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "draft":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

export function SelectQuoteForPoDialog({ open, onOpenChange }: SelectQuoteForPoDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showCreatePoDialog, setShowCreatePoDialog] = useState(false);

  const { data: quotes, isLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
    enabled: open,
  });

  // Debug: Log quotes data to see what we're getting
  console.log('[SelectQuoteForPoDialog] Quotes data:', quotes);

  // Filter quotes - only show approved quotes that can have POs created
  const filteredQuotes = quotes?.filter((quote) => {
    const query = searchQuery.toLowerCase().trim();

    // Safely access quote fields with fallbacks
    const quoteNum = quote.quoteNumber || quote.quote_number || '';
    const clientName = quote.clientName || quote.client_name || '';

    const matchesSearch =
      !query ||
      quoteNum.toLowerCase().includes(query) ||
      clientName.toLowerCase().includes(query);

    // Only show approved quotes (typically these are the ones you'd create POs for)
    const isApproved = quote.status === "approved";

    return matchesSearch && isApproved;
  });

  const handleQuoteSelect = (quote: Quote) => {
    setSelectedQuote(quote);
    onOpenChange(false);
    setShowCreatePoDialog(true);
  };

  const handleCreatePoDialogClose = (open: boolean) => {
    setShowCreatePoDialog(open);
    if (!open) {
      setSelectedQuote(null);
      setSearchQuery("");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-3 xs:p-4 sm:p-5 md:p-6 gap-2 xs:gap-3 sm:gap-4">
          <DialogHeader className="space-y-1 xs:space-y-1.5">
            <DialogTitle className="text-base xs:text-lg sm:text-xl md:text-2xl">Select Quote for PO</DialogTitle>
            <DialogDescription className="text-[10px] xs:text-xs sm:text-sm">
              Choose an approved quote to create a vendor PO
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 xs:left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 xs:h-4 xs:w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 xs:pl-9 sm:pl-10 text-[10px] xs:text-xs sm:text-sm h-8 xs:h-9"
            />
          </div>

          {/* Quotes List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 xs:space-y-2 sm:space-y-2.5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 xs:py-10 sm:py-12">
                <Loader2 className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredQuotes && filteredQuotes.length > 0 ? (
              filteredQuotes.map((quote) => (
                <button
                  key={quote.id}
                  onClick={() => handleQuoteSelect(quote)}
                  className="w-full p-2 xs:p-2.5 sm:p-3 md:p-4 border rounded-lg hover:bg-accent/50 hover:border-primary/40 transition-colors text-left"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-1.5 xs:gap-2 sm:gap-3 md:gap-4">
                    <div className="flex-1 space-y-1 xs:space-y-1.5 sm:space-y-2 min-w-0">
                      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 flex-wrap">
                        <FileText className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-xs xs:text-sm sm:text-base truncate">
                          {quote.quoteNumber || quote.quote_number || 'N/A'}
                        </span>
                        <Badge className={`${getStatusColor(quote.status)} text-[9px] xs:text-[10px] px-1.5 py-0`}>
                          {quote.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-[10px] xs:text-xs sm:text-sm text-muted-foreground">
                        <Building2 className="h-2.5 w-2.5 xs:h-3 xs:w-3 shrink-0" />
                        <span className="truncate">{quote.clientName || quote.client_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 text-[10px] xs:text-xs sm:text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-0.5 xs:gap-1">
                          <Calendar className="h-2.5 w-2.5 xs:h-3 xs:w-3 shrink-0" />
                          <span>
                            {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() :
                             quote.created_at ? new Date(quote.created_at).toLocaleDateString() :
                             'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 xs:gap-1 font-semibold text-primary">
                          <DollarSign className="h-2.5 w-2.5 xs:h-3 xs:w-3 shrink-0" />
                          <span>₹{(parseFloat(quote.total || '0') / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 xs:h-8 text-xs shrink-0">
                      Select
                    </Button>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 xs:py-10 sm:py-12 text-muted-foreground">
                <FileText className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 mx-auto mb-2 xs:mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm xs:text-base sm:text-lg font-medium mb-1">
                  {searchQuery ? "No matches found" : "No approved quotes"}
                </p>
                <p className="text-[10px] xs:text-xs sm:text-sm">
                  {searchQuery ? "Try adjusting search" : "Only approved quotes can be used"}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create PO Dialog - Opens after quote selection */}
      {selectedQuote && (
        <CreateVendorPoDialog
          quoteId={selectedQuote.id}
          quoteNumber={selectedQuote.quoteNumber || selectedQuote.quote_number || 'N/A'}
          open={showCreatePoDialog}
          onOpenChange={handleCreatePoDialogClose}
        />
      )}
    </>
  );
}


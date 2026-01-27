import {
  Users,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Hash,
  Info,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuoteInfoCardProps {
  quote: any;
}

export function QuoteInfoCard({ quote }: QuoteInfoCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Client Details */}
      <Card className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Client Details</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Contact information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <UserIcon className="h-3.5 w-3.5" />
                  Client Name
                </div>
                <div className="font-semibold text-slate-900 dark:text-white text-base pl-5.5">
                  {quote.client.name}
                </div>
             </div>

             <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5" />
                  Email Address
                </div>
                 <div className="font-medium text-slate-900 dark:text-white pl-5.5 truncate" title={quote.client.email}>
                  {quote.client.email}
                </div>
             </div>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <Phone className="h-3.5 w-3.5" />
                  Phone Number
                </div>
                 <div className="font-medium text-slate-900 dark:text-white pl-5.5">
                  {quote.client.phone || "N/A"}
                </div>
             </div>

             <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                 <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <Hash className="h-3.5 w-3.5" />
                  GSTIN
                </div>
                 <div className="font-medium text-slate-900 dark:text-white pl-5.5">
                  {quote.client.gstin || "N/A"}
                </div>
             </div>
           </div>

           <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                Billing Address
              </div>
              <div className="font-medium text-slate-900 dark:text-white leading-relaxed pl-5.5">
                {quote.client.billingAddress}
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Project & Scope Details */}
      <Card className="rounded-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-6">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Project Details</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Scope and timeline</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid gap-6">
            {/* Attention To & Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <UserIcon className="h-3.5 w-3.5" />
                      Attention To
                    </div>
                     <div className="font-medium text-slate-900 dark:text-white pl-5.5">
                      {quote.attentionTo || "N/A"}
                    </div>
                 </div>

                 <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                     <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <Hash className="h-3.5 w-3.5" />
                      Reference No.
                    </div>
                     <div className="font-medium text-slate-900 dark:text-white pl-5.5">
                      {quote.referenceNumber || "N/A"}
                    </div>
                 </div>
            </div>

            {/* Dates */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                     <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      Quote Date
                    </div>
                     <div className="font-medium text-slate-900 dark:text-white pl-5.5">
                      {new Date(quote.quoteDate).toLocaleDateString()}
                    </div>
                 </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                     <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      Valid Until
                    </div>
                     <div className="font-medium text-slate-900 dark:text-white pl-5.5 flex items-center gap-2">
                      {new Date(new Date(quote.quoteDate).setDate(new Date(quote.quoteDate).getDate() + quote.validityDays)).toLocaleDateString()}
                       <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-white dark:bg-slate-950">
                        {quote.validityDays} Days
                      </Badge>
                    </div>
                 </div>
             </div>

             {/* Subject */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <FileText className="h-3.5 w-3.5" />
                    Subject / Project Name
                  </div>
                  <div className="font-medium text-slate-900 dark:text-white leading-relaxed pl-5.5">
                    {quote.subject || "No subject provided"}
                  </div>
              </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component since 'User' is used in 2 places but imported as UserIcon to avoid potential conflict with auth user if this was in main file
function UserIcon({ className }: { className?: string }) {
  return <Users className={className} />;
}

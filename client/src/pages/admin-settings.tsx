import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Calculator,
    DollarSign,
    Globe2,
    Percent,
    Home,
    ChevronRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminSettings } from "@/components/admin-settings/hooks";
import { TaxSettings } from "@/components/admin-settings/TaxSettings";
import { PricingSettings } from "@/components/admin-settings/PricingSettings";
import { CurrencySettings } from "@/components/admin-settings/CurrencySettings";
import { ApprovalSettings } from "@/components/admin-settings/ApprovalSettings";
import { CheckCircle2 } from "lucide-react";
import { isFeatureEnabled } from "@shared/feature-flags";

export default function AdminSettings() {
    const { taxRates, pricingTiers, currencyForm } = useAdminSettings();

    const metrics = {
        regions: taxRates?.length ?? 0,
        tiers: pricingTiers?.length ?? 0,
        baseCurrency: currencyForm.watch("baseCurrency"),
    };

    return (
        <div className="min-h-screen">
            <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm w-fit">
                    <button
                        onClick={() => window.location.href = "/"}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <Home className="h-3.5 w-3.5" />
                        <span>Home</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <button
                        onClick={() => window.location.href = "/admin/users"}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
                    >
                        <span>Admin</span>
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <Calculator className="h-3.5 w-3.5" />
                        Advanced Settings
                    </span>
                </nav>

                {/* Header */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Advanced Settings
                    </h1>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Configure tax rates, pricing tiers, and currency
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        Tax Regions
                                    </p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {metrics.regions}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                                    <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        Pricing Tiers
                                    </p>
                                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {metrics.tiers}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                                    <Percent className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        Base Currency
                                    </p>
                                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                        {metrics.baseCurrency}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                                    <Globe2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs: scrollable on mobile */}
                <Tabs defaultValue="tax" className="w-full">
                    <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                        <TabsList className={`inline-flex sm:grid w-full sm:max-w-3xl ${isFeatureEnabled('approvalRules_module') ? 'grid-cols-4' : 'grid-cols-3'} h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1`}>
                            <TabsTrigger value="tax" data-testid="tab-tax" className="flex items-center gap-1 text-[10px] sm:text-xs py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm rounded">
                                <Calculator className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                                <span className="hidden xs:inline">Tax Rates</span>
                            </TabsTrigger>
                            <TabsTrigger value="pricing" data-testid="tab-pricing" className="flex items-center gap-1 text-[10px] sm:text-xs py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm rounded">
                                <DollarSign className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                                <span className="hidden xs:inline">Pricing</span>
                            </TabsTrigger>
                            <TabsTrigger value="currency" data-testid="tab-currency" className="flex items-center gap-1 text-[10px] sm:text-xs py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm rounded">
                                <Globe2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                                <span className="hidden xs:inline">Currency</span>
                            </TabsTrigger>
                            {isFeatureEnabled('approvalRules_module') && (
                            <TabsTrigger value="approvals" data-testid="tab-approvals" className="flex items-center gap-1 text-[10px] sm:text-xs py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm rounded">
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                                <span className="hidden xs:inline">Approvals</span>
                            </TabsTrigger>
                            )}
                        </TabsList>
                    </div>

                    <TabsContent value="tax" className="space-y-3">
                        <TaxSettings />
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-3">
                        <PricingSettings />
                    </TabsContent>

                    <TabsContent value="currency" className="space-y-3">
                        <CurrencySettings />
                    </TabsContent>

                    {isFeatureEnabled('approvalRules_module') && (
                    <TabsContent value="approvals" className="space-y-3">
                        <ApprovalSettings />
                    </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}

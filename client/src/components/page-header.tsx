import { ReactNode } from "react";
import { PageBreadcrumbs } from "./page-breadcrumbs";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs: BreadcrumbItem[];
    actions?: ReactNode;
    showRefresh?: boolean;
    refreshQueryKeys?: string[][];
}

export function PageHeader({
    title,
    description,
    breadcrumbs,
    actions,
    showRefresh = true,
    refreshQueryKeys = [],
}: PageHeaderProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const handleRefresh = () => {
        if (refreshQueryKeys.length > 0) {
            refreshQueryKeys.forEach(queryKey => {
                queryClient.invalidateQueries({ queryKey });
            });
        } else {
            // Refresh all queries if no specific keys provided
            queryClient.invalidateQueries();
        }
        toast({
            title: "Refreshed",
            description: "Page data has been updated.",
        });
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Breadcrumbs */}
            <PageBreadcrumbs items={breadcrumbs} />

            {/* Header with Title and Actions */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-1.5">
                        <h1 className="text-heading tracking-tight break-words">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm sm:text-base text-muted-foreground font-['Open_Sans']">
                                {description}
                            </p>
                        )}
                    </div>
                    {/*<div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">*/}
                    {/*    {showRefresh && (*/}
                    {/*        <TooltipProvider>*/}
                    {/*            <Tooltip>*/}
                    {/*                <TooltipTrigger asChild>*/}
                    {/*                    <Button*/}
                    {/*                        variant="outline"*/}
                    {/*                        size="lg"*/}
                    {/*                        onClick={handleRefresh}*/}
                    {/*                        className="w-full sm:w-fit"*/}
                    {/*                    >*/}
                    {/*                        <RefreshCw className="h-5 w-5 mr-2" />*/}
                    {/*                        Refresh*/}
                    {/*                    </Button>*/}
                    {/*                </TooltipTrigger>*/}
                    {/*                <TooltipContent>*/}
                    {/*                    <p>Refresh page data (⌘R)</p>*/}
                    {/*                </TooltipContent>*/}
                    {/*            </Tooltip>*/}
                    {/*        </TooltipProvider>*/}
                    {/*    )}*/}
                    {/*    {actions}*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
}


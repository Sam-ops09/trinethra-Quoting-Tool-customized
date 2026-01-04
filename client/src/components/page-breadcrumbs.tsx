import { Home, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface PageBreadcrumbsProps {
    items: BreadcrumbItem[];
    showHome?: boolean;
}

export function PageBreadcrumbs({ items, showHome = true }: PageBreadcrumbsProps) {
    const [, setLocation] = useLocation();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {showHome && (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                onClick={() => setLocation("/")}
                                className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                            >
                                <Home className="h-4 w-4" />
                                <span className="hidden sm:inline">Home</span>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4" />
                        </BreadcrumbSeparator>
                    </>
                )}
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const Icon = item.icon;

                    return (
                        <div key={index} className="flex items-center gap-2">
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="font-semibold flex items-center gap-1.5">
                                        {Icon && <Icon className="h-4 w-4" />}
                                        {item.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink
                                        onClick={() => item.href && setLocation(item.href)}
                                        className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                                    >
                                        {Icon && <Icon className="h-4 w-4" />}
                                        {item.label}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && (
                                <BreadcrumbSeparator>
                                    <ChevronRight className="h-4 w-4" />
                                </BreadcrumbSeparator>
                            )}
                        </div>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}


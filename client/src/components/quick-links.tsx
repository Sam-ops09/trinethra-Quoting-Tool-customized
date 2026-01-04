import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useLocation } from "wouter";
import { LucideIcon } from "lucide-react";

interface QuickLink {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    color: string;
}

interface QuickLinksProps {
    links: QuickLink[];
    title?: string;
}

export function QuickLinks({ links, title = "Quick Navigation" }: QuickLinksProps) {
    const [, setLocation] = useLocation();

    if (links.length === 0) return null;

    return (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-1 bg-primary rounded-full" />
                        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
                    </div>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(links.length, 4)} gap-3`}>
                        {links.map((link) => (
                            <Button
                                key={link.href}
                                variant="outline"
                                className="justify-start h-auto py-3 px-4 hover:bg-primary/10 hover:border-primary transition-colors"
                                onClick={() => setLocation(link.href)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className={`h-10 w-10 rounded-lg ${link.color} flex items-center justify-center shrink-0`}>
                                        <link.icon className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">{link.title}</p>
                                        <p className="text-xs text-muted-foreground">{link.description}</p>
                                    </div>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


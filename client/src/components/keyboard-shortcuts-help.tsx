import { Card, CardContent } from "./ui/card";

interface KeyboardShortcut {
    key: string;
    description: string;
}

interface KeyboardShortcutsHelpProps {
    shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
    if (shortcuts.length === 0) return null;

    return (
        <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4">
                <details className="group">
                    <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium">
                        <span className="flex items-center gap-2">
                            <span className="text-muted-foreground">⌨️</span>
                            Keyboard Shortcuts
                        </span>
                        <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                        {shortcuts.map((shortcut, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                                <span className="text-muted-foreground">{shortcut.description}</span>
                                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">{shortcut.key}</kbd>
                            </div>
                        ))}
                    </div>
                </details>
            </CardContent>
        </Card>
    );
}


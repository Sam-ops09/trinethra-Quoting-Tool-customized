import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, Lock, Mail } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const resetSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export default function Login() {
    const [, setLocation] = useLocation();
    const { login, resetPassword } = useAuth();
    const { toast } = useToast();
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const resetForm = useForm<z.infer<typeof resetSchema>>({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        try {
            await login(values.email, values.password);
            toast({
                title: "Welcome back!",
                description: "You have successfully logged in.",
            });
            setLocation("/");
        } catch (error: any) {
            toast({
                title: "Login failed",
                description: error?.message || "Invalid credentials. Please try again.",
                variant: "destructive",
            });
        }
    };

    const onResetSubmit = async (values: z.infer<typeof resetSchema>) => {
        try {
            await resetPassword(values.email);
            toast({
                title: "Password reset email sent",
                description: "Check your backup email for reset instructions.",
            });
            setIsResetDialogOpen(false);
            resetForm.reset();
        } catch (error: any) {
            toast({
                title: "Failed to send reset email",
                description: error?.message || "Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen w-full bg-background">
            {/* Background layer */}
            <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />

            <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                {/* Left / Brand panel (hidden on small) */}
                <section className="relative hidden flex-col justify-between border-r bg-secondary/95 px-8 py-8 text-white lg:flex xl:px-12">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(0,0,0,0.35),_transparent_55%)]" />
                    <div className="absolute inset-6 -z-10 rounded-3xl border border-white/10" />

                    <header className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm shadow-black/30">
                            <img src="/" alt="Logo" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white">
                                Company name
                            </p>
                            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                                Company name-QuoteFlow
                            </h1>
                        </div>
                    </header>

                    <main className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white">
                                QUOTING INTELLIGENCE
                            </p>
                            <p className="text-balance text-2xl font-semibold leading-snug text-white">
                                Modern quoting & proposal
                                <br className="hidden xl:block" /> workflows for{" "}
                                <span className="text-white">sales teams</span>.
                            </p>
                            <p className="max-w-md text-sm text-white">
                                Centralize quotes, keep track of approvals, and export
                                client-ready commercial proposals in minutes—backed by
                                enterprise-grade reliability.
                            </p>
                        </div>

                        <dl className="grid grid-cols-2 gap-4 text-xs text-white">
                            <div className="space-y-1 rounded-2xl border border-white/10 bg-black/10 p-3">
                                <dt className="font-medium">Live pipeline</dt>
                                <dd className="text-[0.78rem]">
                                    Monitor draft, sent, and approved quotes in a unified view.
                                </dd>
                            </div>
                            <div className="space-y-1 rounded-2xl border border-white/10 bg-black/10 p-3">
                                <dt className="font-medium">Professional exports</dt>
                                <dd className="text-[0.78rem]">
                                    Generate polished PDFs aligned with your brand guidelines.
                                </dd>
                            </div>
                        </dl>

                        <p className="text-xs text-white">
                            Secure, role-based access ensures only authorized users can view
                            and manage quote data.
                        </p>
                    </main>

                    <footer className="mt-6 flex items-center justify-between text-[0.7rem] text-white">
                        <span>© {new Date().getFullYear()} Company name</span>
                        <span className="hidden gap-2 sm:flex">
              <span>Developed By</span>
              <span className="h-1 w-1 rounded-full bg-accent" />
              <span>Samanyu</span>
            </span>
                    </footer>
                </section>

                {/* Right / Auth section */}
                <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <div className="w-full max-w-md">
                        {/* Mobile brand header */}
                        <div className="mb-6 flex flex-col items-center gap-2 text-center lg:hidden">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-primary">
                                        Company name
                                    </p>
                                    <h1 className="text-base sm:text-lg font-semibold tracking-tight text-secondary">
                                        Company name-QuoteFlow
                                    </h1>
                                </div>
                            </div>
                            <p className="max-w-xs text-center text-xs text-muted-foreground font-['Open_Sans']">
                                Professional quoting and proposal generation platform.
                            </p>
                        </div>

                        <Card className="glass-effect shadow-elegant-xl backdrop-blur-xl">
                            <CardHeader className="space-y-1 px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
                                <CardTitle className="text-xl sm:text-2xl font-semibold">
                                    Sign in to your workspace
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Use your company email to access your quote pipeline.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0 shadow-elegant-xs">
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                {...field}
                                                                type="email"
                                                                placeholder="name@company.com"
                                                                data-testid="input-email"
                                                                className="h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0 shadow-elegant-xs">
                                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                {...field}
                                                                type="password"
                                                                placeholder="••••••••"
                                                                data-testid="input-password"
                                                                className="h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex items-center justify-end">
                                            <Dialog
                                                open={isResetDialogOpen}
                                                onOpenChange={setIsResetDialogOpen}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="h-auto px-0 text-xs font-medium text-primary hover:text-primary/80"
                                                        data-testid="button-forgot-password"
                                                    >
                                                        Forgot password?
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-sm">
                                                    <DialogHeader>
                                                        <DialogTitle>Reset password</DialogTitle>
                                                        <DialogDescription>
                                                            Enter your email address and we&apos;ll send a
                                                            reset link to your backup email.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <Form {...resetForm}>
                                                        <form
                                                            onSubmit={resetForm.handleSubmit(onResetSubmit)}
                                                            className="space-y-4"
                                                        >
                                                            <FormField
                                                                control={resetForm.control}
                                                                name="email"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Email</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                {...field}
                                                                                type="email"
                                                                                placeholder="name@company.com"
                                                                                data-testid="input-reset-email"
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <Button
                                                                type="submit"
                                                                className="w-full"
                                                                disabled={resetForm.formState.isSubmitting}
                                                                data-testid="button-send-reset"
                                                            >
                                                                {resetForm.formState.isSubmitting && (
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                )}
                                                                Send reset link
                                                            </Button>
                                                        </form>
                                                    </Form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="btn-classy w-full shadow-elegant-lg"
                                            disabled={form.formState.isSubmitting}
                                            data-testid="button-login"
                                        >
                                            {form.formState.isSubmitting && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Sign in
                                        </Button>
                                    </form>
                                </Form>

                                <div className="mt-6 space-y-3 text-center text-xs sm:text-sm font-['Open_Sans']">
                                    <div>
                    <span className="text-muted-foreground">
                      Don&apos;t have an account?
                    </span>{" "}
                                        <Button
                                            variant="link"
                                            className="px-1 font-medium"
                                            onClick={() => setLocation("/signup")}
                                            data-testid="link-signup"
                                        >
                                            Request access
                                        </Button>
                                    </div>
                                    <p className="text-[0.7rem] text-muted-foreground/80">
                                        Only authorized company users can sign in. Contact your
                                        workspace admin to get onboarded.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
    );
}
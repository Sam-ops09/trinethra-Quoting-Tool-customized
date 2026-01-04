import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, Lock, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      toast({
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired.",
        variant: "destructive",
      });
      setLocation("/login");
    } else {
      setToken(tokenParam);
    }
  }, [toast, setLocation]);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Reset token is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/auth/reset-password-confirm", {
        token,
        newPassword: values.password,
      });

      setIsSuccess(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now sign in with your new password.",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation("/login");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error?.message || "Failed to reset password. The link may have expired.",
        variant: "destructive",
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-border/80 shadow-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Password Reset Complete</CardTitle>
            <CardDescription>
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setLocation("/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Background layer */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />

      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Left / Brand panel (hidden on small) */}
        <section className="relative hidden flex-col justify-between border-r bg-secondary/95 px-8 py-8 text-secondary-foreground lg:flex xl:px-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(0,0,0,0.35),_transparent_55%)]" />
          <div className="absolute inset-6 -z-10 rounded-3xl border border-white/10" />

          <header className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background shadow-sm shadow-black/30">
              <img src="/logo.svg" alt="Logo" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-background">
                Company name
              </p>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-background">
                Company name-QuoteFlow
              </h1>
            </div>
          </header>

          <main className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-background/80">
                PASSWORD RESET
              </p>
              <p className="text-balance text-2xl font-semibold leading-snug text-background/95">
                Secure your account with a{" "}
                <span className="text-background">new password</span>.
              </p>
              <p className="max-w-md text-sm text-background/70">
                Choose a strong password that includes uppercase and lowercase letters,
                numbers, and special characters for maximum security.
              </p>
            </div>
          </main>

          <footer className="mt-6 flex items-center justify-between text-[0.7rem] text-background/55">
            <span>© {new Date().getFullYear()} Company name</span>
            <span className="hidden gap-2 sm:flex">
              <span>Developed By</span>
              <span className="h-1 w-1 rounded-full bg-accent" />
              <span>Samanyu</span>
            </span>
          </footer>
        </section>

        {/* Right / Form section */}
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="w-full max-w-md">
            {/* Mobile brand header */}
            <div className="mb-6 flex flex-col items-center gap-2 text-center lg:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80">
                    <img src="/logo.svg" alt="Logo" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
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
            </div>

            <Card className="border border-border/80 shadow-sm backdrop-blur-sm">
              <CardHeader className="space-y-1 px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
                <CardTitle className="text-xl sm:text-2xl">
                  Reset your password
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Enter your new password below. Make sure it's secure and memorable.
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
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
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
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
                                className="h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Password requirements:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>At least 8 characters long</li>
                        <li>Contains uppercase and lowercase letters</li>
                        <li>Contains at least one number</li>
                        <li>Contains at least one special character</li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Reset Password
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center text-xs sm:text-sm">
                  <Button
                    variant="link"
                    className="px-1 font-medium"
                    onClick={() => setLocation("/login")}
                  >
                    Back to login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}


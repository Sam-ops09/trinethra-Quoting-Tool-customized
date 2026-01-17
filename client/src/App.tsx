import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import PublicQuote from "@/pages/public-quote";
import Clients from "@/pages/clients";
import ClientDetail from "@/pages/client-detail";
import Quotes from "@/pages/quotes";
import QuoteCreate from "@/pages/quote-create";
import QuoteDetail from "@/pages/quote-detail";
import SalesOrdersList from "@/pages/sales-orders/list";
import SalesOrderDetail from "@/pages/sales-orders/detail";
import SalesOrderEdit from "@/pages/sales-orders/edit";
import Invoices from "@/pages/invoices";
import InvoiceDetail from "@/pages/invoice-detail";
import AdminUsers from "@/pages/admin-users";
import AdminSettings from "@/pages/admin-settings";
import AdminConfiguration from "@/pages/admin-configuration";
import Analytics from "@/pages/analytics";
import Vendors from "@/pages/vendors";
import VendorPOs from "@/pages/vendor-pos";
import VendorPoCreate from "@/pages/vendor-po-create";
import VendorPoDetail from "@/pages/vendor-po-detail";
import Products from "@/pages/products";
import GRNList from "@/pages/grn-list";
import GRNDetail from "@/pages/grn-detail";
import SerialSearch from "@/pages/serial-search";
import GovernanceDashboard from "@/pages/governance-dashboard";
import DashboardsOverview from "@/pages/dashboards-overview";
import SalesQuoteDashboard from "@/pages/sales-quote-dashboard";
import VendorPODashboard from "@/pages/vendor-po-dashboard";
import InvoiceCollectionsDashboard from "@/pages/invoice-collections-dashboard";
import SerialTrackingDashboard from "@/pages/serial-tracking-dashboard";
import InvoiceAnalytics from "@/pages/invoice-analytics";
import { Loader2, ShieldAlert } from "lucide-react";
import React from "react";
import { canAccessRoute, type UserRole } from "@/lib/permissions-new";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { isFeatureEnabled } from "@shared/feature-flags";

interface RouteConfig {
  component: React.ComponentType;
  requiresAuth?: boolean;
  requiredPath?: string;
}

function ProtectedRoute({ component: Component, requiredPath }: RouteConfig) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Check role-based access if a path is specified
  if (requiredPath && !canAccessRoute(user.role as UserRole, requiredPath)) {
    return <AccessDenied />;
  }

  return <Component />;
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-center">Access Denied</CardTitle>
          <CardDescription className="text-center">
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Horizontal Navbar */}
      <AppSidebar />

      {/* Main Content - Add padding-top to account for fixed navbar */}
      <main className="w-full pt-14 sm:pt-16">
        <Switch>
          <Route path="/" component={() => <ProtectedRoute component={Dashboard} requiredPath="/" />} />

          {/* Clients - with feature flag */}
          {isFeatureEnabled('pages_clients') && (
            <>
              <Route path="/clients" component={() => <ProtectedRoute component={Clients} requiredPath="/clients" />} />
              <Route path="/clients/:id" component={() => <ProtectedRoute component={ClientDetail} requiredPath="/clients" />} />
            </>
          )}

          {/* Quotes - with feature flag */}
          {isFeatureEnabled('pages_quotes') && (
            <>
              <Route path="/quotes" component={() => <ProtectedRoute component={Quotes} requiredPath="/quotes" />} />
              <Route path="/quotes/create" component={() => <ProtectedRoute component={QuoteCreate} requiredPath="/quotes" />} />
              <Route path="/quotes/:id/edit" component={() => <ProtectedRoute component={QuoteCreate} requiredPath="/quotes" />} />
              <Route path="/quotes/:id" component={() => <ProtectedRoute component={QuoteDetail} requiredPath="/quotes" />} />
            </>
          )}

          {/* Sales Orders */}
          <Route path="/sales-orders" component={() => <ProtectedRoute component={SalesOrdersList} requiredPath="/sales-orders" />} />
          <Route path="/sales-orders/:id/edit" component={() => <ProtectedRoute component={SalesOrderEdit} requiredPath="/sales-orders" />} />
          <Route path="/sales-orders/:id" component={() => <ProtectedRoute component={SalesOrderDetail} requiredPath="/sales-orders" />} />

          {/* Invoices - with feature flag */}
          {isFeatureEnabled('pages_invoices') && (
            <>
              <Route path="/invoices" component={() => <ProtectedRoute component={Invoices} requiredPath="/invoices" />} />
              <Route path="/invoices/analytics" component={() => <ProtectedRoute component={InvoiceAnalytics} requiredPath="/invoices" />} />
              <Route path="/invoices/:id" component={() => <ProtectedRoute component={InvoiceDetail} requiredPath="/invoices" />} />
            </>
          )}

          {/* Vendors - with feature flag */}
          {isFeatureEnabled('pages_vendors') && (
            <Route path="/vendors" component={() => <ProtectedRoute component={Vendors} requiredPath="/vendors" />} />
          )}

          {/* Vendor POs - with feature flag */}
          {isFeatureEnabled('pages_vendorPOs') && (
            <>
              <Route path="/vendor-pos" component={() => <ProtectedRoute component={VendorPOs} requiredPath="/vendor-pos" />} />
              <Route path="/vendor-pos/create" component={() => <ProtectedRoute component={VendorPoCreate} requiredPath="/vendor-pos" />} />
              <Route path="/vendor-pos/:id" component={() => <ProtectedRoute component={VendorPoDetail} requiredPath="/vendor-pos" />} />
            </>
          )}

          {/* Products - with feature flag */}
          {isFeatureEnabled('pages_products') && (
            <Route path="/products" component={() => <ProtectedRoute component={Products} requiredPath="/products" />} />
          )}

          {/* GRN - with feature flag */}
          {isFeatureEnabled('pages_grn') && (
            <>
              <Route path="/grn" component={() => <ProtectedRoute component={GRNList} requiredPath="/grn" />} />
              <Route path="/grn/:id" component={() => <ProtectedRoute component={GRNDetail} requiredPath="/grn" />} />
            </>
          )}

          {/* Serial Search - with feature flag */}
          {isFeatureEnabled('pages_serialSearch') && (
            <Route path="/serial-search" component={() => <ProtectedRoute component={SerialSearch} requiredPath="/serial-search" />} />
          )}

          {/* Dashboards - with feature flags */}
          {isFeatureEnabled('pages_dashboardsOverview') && (
            <Route path="/dashboards" component={() => <ProtectedRoute component={DashboardsOverview} requiredPath="/dashboards" />} />
          )}
          {isFeatureEnabled('pages_salesQuoteDashboard') && (
            <Route path="/dashboards/sales-quotes" component={() => <ProtectedRoute component={SalesQuoteDashboard} requiredPath="/dashboards/sales-quotes" />} />
          )}
          {isFeatureEnabled('pages_vendorPODashboard') && (
            <Route path="/dashboards/vendor-po" component={() => <ProtectedRoute component={VendorPODashboard} requiredPath="/dashboards/vendor-po" />} />
          )}
          {isFeatureEnabled('pages_invoiceCollectionsDashboard') && (
            <Route path="/dashboards/invoice-collections" component={() => <ProtectedRoute component={InvoiceCollectionsDashboard} requiredPath="/dashboards/invoice-collections" />} />
          )}
          {isFeatureEnabled('pages_serialTrackingDashboard') && (
            <Route path="/dashboards/serial-tracking" component={() => <ProtectedRoute component={SerialTrackingDashboard} requiredPath="/dashboards/serial-tracking" />} />
          )}

          {/* Admin - with feature flags */}
          {isFeatureEnabled('pages_adminUsers') && (
            <Route path="/admin/users" component={() => <ProtectedRoute component={AdminUsers} requiredPath="/admin/users" />} />
          )}
          {isFeatureEnabled('pages_adminSettings') && (
            <Route path="/admin/settings" component={() => <ProtectedRoute component={AdminSettings} requiredPath="/admin/settings" />} />
          )}
          {isFeatureEnabled('pages_adminConfiguration') && (
            <Route path="/admin/configuration" component={() => <ProtectedRoute component={AdminConfiguration} requiredPath="/admin/configuration" />} />
          )}
          {isFeatureEnabled('pages_adminAnalytics') && (
            <Route path="/admin/analytics" component={() => <ProtectedRoute component={Analytics} requiredPath="/admin/analytics" />} />
          )}
          {isFeatureEnabled('pages_governanceDashboard') && (
            <Route path="/admin/governance" component={() => <ProtectedRoute component={GovernanceDashboard} requiredPath="/admin/governance" />} />
          )}

          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/p/quote/:token" component={PublicQuote} />
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      {isFeatureEnabled('pages_signup') && (
        <Route path="/signup" component={() => <PublicRoute component={Signup} />} />
      )}
      {isFeatureEnabled('pages_resetPassword') && (
        <Route path="/reset-password" component={ResetPassword} />
      )}
      <Route>{user ? <AuthenticatedLayout /> : <Redirect to="/login" />}</Route>
    </Switch>
  );
}

function App() {
  const defaultTheme = isFeatureEnabled('ui_darkMode') ? 'light' : 'light';
  const showAnalytics = isFeatureEnabled('integration_vercelAnalytics');

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={defaultTheme}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            {showAnalytics && <VercelAnalytics />}
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

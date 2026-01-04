import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import {
  Building,
  FileText,
  Percent,
  Mail,
  CreditCard,
  Settings as SettingsIcon,
  Loader2,
  Save,
  Upload,
  Image as ImageIcon,
  Home,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

/* ────────────────────────────────────────────────────────────────────────────
   SCHEMAS
──────────────────────────────────────────────────────────────────────────── */

// Company Profile Schema
const companyProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  tan: z.string().optional(),
  logo: z.string().optional(), // base64 or URL
});

// Bank Details Schema
const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountName: z.string().min(1, "Account name is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  branch: z.string().optional(),
  swiftCode: z.string().optional(),
});

// Numbering Schemes Schema
const numberingSchemeSchema = z.object({
  quotePrefix: z.string().min(1, "Quote prefix is required"),
  quoteFormat: z.string().min(1, "Quote format is required"),
  vendorPoPrefix: z.string().min(1, "Vendor PO prefix is required"),
  vendorPoFormat: z.string().min(1, "Vendor PO format is required"),
  masterInvoicePrefix: z.string().min(1, "Master invoice prefix is required"),
  masterInvoiceFormat: z.string().min(1, "Master invoice format is required"),
  childInvoicePrefix: z.string().min(1, "Child invoice prefix is required"),
  childInvoiceFormat: z.string().min(1, "Child invoice format is required"),
  grnPrefix: z.string().min(1, "GRN prefix is required"),
  grnFormat: z.string().min(1, "GRN format is required"),
});

// Tax Rates Schema
const taxRateSchema = z.object({
  name: z.string().min(1, "Tax name is required"),
  percentage: z.coerce.number().min(0).max(100, "Must be between 0 and 100"),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// Payment Terms Schema
const paymentTermSchema = z.object({
  name: z.string().min(1, "Payment term name is required"),
  days: z.coerce.number().min(0, "Days must be positive"),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// Email Templates Schema
const emailTemplatesSchema = z.object({
  quoteSubject: z.string().min(1, "Quote email subject is required"),
  quoteBody: z.string().min(1, "Quote email body is required"),
  invoiceSubject: z.string().min(1, "Invoice email subject is required"),
  invoiceBody: z.string().min(1, "Invoice email body is required"),
  vendorPoSubject: z.string().min(1, "Vendor PO email subject is required"),
  vendorPoBody: z.string().min(1, "Vendor PO email body is required"),
  paymentReminderSubject: z.string().min(1, "Payment reminder subject is required"),
  paymentReminderBody: z.string().min(1, "Payment reminder body is required"),
});

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENT
──────────────────────────────────────────────────────────────────────────── */

export default function AdminConfiguration() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Feature flags
  const showBankDetails = useFeatureFlag('admin_bankDetails');
  const showNumberingSchemes = useFeatureFlag('admin_numberingSchemes');
  const showEmailTemplates = useFeatureFlag('email_integration');

  // Calculate number of visible tabs for responsive grid
  const visibleTabsCount = 1 + // Company tab (always visible)
    (showNumberingSchemes ? 1 : 0) +
    (showBankDetails ? 1 : 0) +
    (showEmailTemplates ? 1 : 0);

  // Fetch settings
  const { data: settings, isLoading: settingsLoading } = useQuery<Record<string, any>>({
    queryKey: ["api", "settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch settings: ${res.statusText}`);
      }
      return res.json();
    },
  });

  // Debug: Log when settings are loaded
  useEffect(() => {
    if (settings) {
      console.log("Settings loaded:", settings);
    }
  }, [settings]);

  /* ── COMPANY PROFILE ─────────────────────────────────────────────────────── */

  const companyForm = useForm<z.infer<typeof companyProfileSchema>>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      phone: "",
      email: "",
      website: "",
      gstin: "",
      pan: "",
      tan: "",
      logo: "",
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      companyForm.reset({
        companyName: settings?.company_companyName || "",
        address: settings?.company_address || "",
        city: settings?.company_city || "",
        state: settings?.company_state || "",
        zipCode: settings?.company_zipCode || "",
        country: settings?.company_country || "India",
        phone: settings?.company_phone || "",
        email: settings?.company_email || "",
        website: settings?.company_website || "",
        gstin: settings?.company_gstin || "",
        pan: settings?.company_pan || "",
        tan: settings?.company_tan || "",
        logo: settings?.company_logo || "",
      });
      // Also update logo preview if logo exists
      if (settings?.company_logo) {
        setLogoPreview(settings?.company_logo);
      }
    }
  }, [settings, companyForm]);

  const saveCompanyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof companyProfileSchema>) => {
      const settingsToSave = Object.entries(data).map(([key, value]) => ({
        key: `company_${key}`,
        value: value !== undefined && value !== null ? String(value) : "",
      }));

      const results = [];
      for (const setting of settingsToSave) {
        const result = await apiRequest("POST", "/api/settings", setting);
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "settings"] });
      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error saving company settings:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update company profile",
        variant: "destructive",
      });
    },
  });

  /* ── BANK DETAILS ────────────────────────────────────────────────────────── */

  const bankForm = useForm<z.infer<typeof bankDetailsSchema>>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      ifscCode: "",
      branch: "",
      swiftCode: "",
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      bankForm.reset({
        bankName: settings?.bank_bankName || "",
        accountNumber: settings?.bank_accountNumber || "",
        accountName: settings?.bank_accountName || "",
        ifscCode: settings?.bank_ifscCode || "",
        branch: settings?.bank_branch || "",
        swiftCode: settings?.bank_swiftCode || "",
      });
    }
  }, [settings, bankForm]);

  const saveBankMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bankDetailsSchema>) => {
      const settingsToSave = Object.entries(data).map(([key, value]) => ({
        key: `bank_${key}`,
        value: value !== undefined && value !== null ? String(value) : "",
      }));

      const results = [];
      for (const setting of settingsToSave) {
        const result = await apiRequest("POST", "/api/settings", setting);
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "settings"] });
      toast({
        title: "Success",
        description: "Bank details updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error saving bank details:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update bank details",
        variant: "destructive",
      });
    },
  });

  /* ── NUMBERING SCHEMES ───────────────────────────────────────────────────── */

  const numberingForm = useForm<z.infer<typeof numberingSchemeSchema>>({
    resolver: zodResolver(numberingSchemeSchema),
    defaultValues: {
      quotePrefix: "QT",
      quoteFormat: "{PREFIX}-{YEAR}-{COUNTER}",
      vendorPoPrefix: "PO",
      vendorPoFormat: "{PREFIX}-{YEAR}-{COUNTER}",
      masterInvoicePrefix: "MINV",
      masterInvoiceFormat: "{PREFIX}-{YEAR}-{COUNTER}",
      childInvoicePrefix: "INV",
      childInvoiceFormat: "{PREFIX}-{YEAR}-{COUNTER}",
      grnPrefix: "GRN",
      grnFormat: "{PREFIX}-{YEAR}-{COUNTER}",
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      numberingForm.reset({
        quotePrefix: settings?.quotePrefix || "QT",
        quoteFormat: settings?.quoteFormat || "{PREFIX}-{YEAR}-{COUNTER}",
        vendorPoPrefix: settings?.vendorPoPrefix || "PO",
        vendorPoFormat: settings?.vendorPoFormat || "{PREFIX}-{YEAR}-{COUNTER}",
        masterInvoicePrefix: settings?.masterInvoicePrefix || "MINV",
        masterInvoiceFormat: settings?.masterInvoiceFormat || "{PREFIX}-{YEAR}-{COUNTER}",
        childInvoicePrefix: settings?.childInvoicePrefix || "INV",
        childInvoiceFormat: settings?.childInvoiceFormat || "{PREFIX}-{YEAR}-{COUNTER}",
        grnPrefix: settings?.grnPrefix || "GRN",
        grnFormat: settings?.grnFormat || "{PREFIX}-{YEAR}-{COUNTER}",
      });
    }
  }, [settings, numberingForm]);

  const saveNumberingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof numberingSchemeSchema>) => {
      // Map form fields to the exact keys that the numbering service expects
      const settingsToSave = [
        // Quote numbering
        { key: "quotePrefix", value: data.quotePrefix },
        { key: "quoteFormat", value: data.quoteFormat },

        // Vendor PO numbering
        { key: "vendorPoPrefix", value: data.vendorPoPrefix },
        { key: "vendorPoFormat", value: data.vendorPoFormat },

        // Master Invoice numbering
        { key: "masterInvoicePrefix", value: data.masterInvoicePrefix },
        { key: "masterInvoiceFormat", value: data.masterInvoiceFormat },

        // Child Invoice numbering
        { key: "childInvoicePrefix", value: data.childInvoicePrefix },
        { key: "childInvoiceFormat", value: data.childInvoiceFormat },

        // GRN numbering
        { key: "grnPrefix", value: data.grnPrefix },
        { key: "grnFormat", value: data.grnFormat },
      ];

      for (const setting of settingsToSave) {
        await apiRequest("POST", "/api/settings", setting);
      }

      // Trigger document number migration after settings are saved
      const migrationResult = await apiRequest("POST", "/api/settings/migrate-document-numbers", {
        migrateQuotes: true,
        migrateVendorPos: true,
        migrateMasterInvoices: true,
        migrateChildInvoices: true,
        migrateGrns: true,
      });

      return migrationResult;
    },
    onSuccess: (migrationResult: any) => {
      queryClient.invalidateQueries({ queryKey: ["api", "settings"] });

      // Show detailed success message with migration counts
      const { migrated, errors } = migrationResult as {
        migrated?: {
          quotes?: number;
          vendorPos?: number;
          masterInvoices?: number;
          childInvoices?: number;
          grns?: number;
        };
        errors?: string[];
      };
      const totalMigrated =
        (migrated?.quotes || 0) +
        (migrated?.vendorPos || 0) +
        (migrated?.masterInvoices || 0) +
        (migrated?.childInvoices || 0) +
        (migrated?.grns || 0);

      let message = `Numbering schemes updated successfully!`;
      if (totalMigrated > 0) {
        message += ` Migrated ${totalMigrated} documents:`;
        if (migrated?.quotes) message += ` ${migrated.quotes} quotes,`;
        if (migrated?.vendorPos) message += ` ${migrated.vendorPos} vendor POs,`;
        if (migrated?.masterInvoices) message += ` ${migrated.masterInvoices} master invoices,`;
        if (migrated?.childInvoices) message += ` ${migrated.childInvoices} child invoices,`;
        if (migrated?.grns) message += ` ${migrated.grns} GRNs.`;
      }

      toast({
        title: "Success",
        description: message,
      });

      if (errors && errors.length > 0) {
        toast({
          title: "Warning",
          description: `Some migrations failed: ${errors.join(", ")}`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update numbering schemes: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  /* ── LOGO UPLOAD ─────────────────────────────────────────────────────────── */

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        companyForm.setValue("logo", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  /* ── EMAIL TEMPLATES ──────────────────────────────────────────────────────── */

  const emailForm = useForm<z.infer<typeof emailTemplatesSchema>>({
    resolver: zodResolver(emailTemplatesSchema),
    defaultValues: {
      quoteSubject: "Quote {QUOTE_NUMBER} from {COMPANY_NAME}",
      quoteBody: "Dear {CLIENT_NAME},\n\nPlease find attached quote {QUOTE_NUMBER} for your review.\n\nTotal Amount: {TOTAL}\nValid Until: {VALIDITY_DATE}\n\nBest regards,\n{COMPANY_NAME}",
      invoiceSubject: "Invoice {INVOICE_NUMBER} from {COMPANY_NAME}",
      invoiceBody: "Dear {CLIENT_NAME},\n\nPlease find attached invoice {INVOICE_NUMBER}.\n\nAmount Due: {TOTAL}\nDue Date: {DUE_DATE}\n\nPayment Details:\n{BANK_DETAILS}\n\nBest regards,\n{COMPANY_NAME}",
      vendorPoSubject: "Purchase Order {PO_NUMBER} from {COMPANY_NAME}",
      vendorPoBody: "Dear Vendor,\n\nPlease find attached purchase order {PO_NUMBER}.\n\nDelivery Required By: {DELIVERY_DATE}\nTotal Amount: {TOTAL}\n\nPlease confirm receipt and expected delivery date.\n\nBest regards,\n{COMPANY_NAME}",
      paymentReminderSubject: "Payment Reminder: Invoice {INVOICE_NUMBER}",
      paymentReminderBody: "Dear {CLIENT_NAME},\n\nThis is a friendly reminder that invoice {INVOICE_NUMBER} is due for payment.\n\nAmount Due: {OUTSTANDING}\nDue Date: {DUE_DATE}\nDays Overdue: {DAYS_OVERDUE}\n\nPlease arrange payment at your earliest convenience.\n\nBest regards,\n{COMPANY_NAME}",
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      emailForm.reset({
        quoteSubject: settings?.email_quote_subject || "Quote {QUOTE_NUMBER} from {COMPANY_NAME}",
        quoteBody: settings?.email_quote_body || "Dear {CLIENT_NAME},\n\nPlease find attached quote {QUOTE_NUMBER} for your review.\n\nTotal Amount: {TOTAL}\nValid Until: {VALIDITY_DATE}\n\nBest regards,\n{COMPANY_NAME}",
        invoiceSubject: settings?.email_invoice_subject || "Invoice {INVOICE_NUMBER} from {COMPANY_NAME}",
        invoiceBody: settings?.email_invoice_body || "Dear {CLIENT_NAME},\n\nPlease find attached invoice {INVOICE_NUMBER}.\n\nAmount Due: {TOTAL}\nDue Date: {DUE_DATE}\n\nPayment Details:\n{BANK_DETAILS}\n\nBest regards,\n{COMPANY_NAME}",
        vendorPoSubject: settings?.email_vendor_po_subject || "Purchase Order {PO_NUMBER} from {COMPANY_NAME}",
        vendorPoBody: settings?.email_vendor_po_body || "Dear Vendor,\n\nPlease find attached purchase order {PO_NUMBER}.\n\nDelivery Required By: {DELIVERY_DATE}\nTotal Amount: {TOTAL}\n\nPlease confirm receipt and expected delivery date.\n\nBest regards,\n{COMPANY_NAME}",
        paymentReminderSubject: settings?.email_payment_reminder_subject || "Payment Reminder: Invoice {INVOICE_NUMBER}",
        paymentReminderBody: settings?.email_payment_reminder_body || "Dear {CLIENT_NAME},\n\nThis is a friendly reminder that invoice {INVOICE_NUMBER} is due for payment.\n\nAmount Due: {OUTSTANDING}\nDue Date: {DUE_DATE}\nDays Overdue: {DAYS_OVERDUE}\n\nPlease arrange payment at your earliest convenience.\n\nBest regards,\n{COMPANY_NAME}",
      });
    }
  }, [settings, emailForm]);

  const saveEmailTemplatesMutation = useMutation({
    mutationFn: async (data: z.infer<typeof emailTemplatesSchema>) => {
      const settingsToSave = [
        { key: "email_quote_subject", value: data.quoteSubject },
        { key: "email_quote_body", value: data.quoteBody },
        { key: "email_invoice_subject", value: data.invoiceSubject },
        { key: "email_invoice_body", value: data.invoiceBody },
        { key: "email_vendor_po_subject", value: data.vendorPoSubject },
        { key: "email_vendor_po_body", value: data.vendorPoBody },
        { key: "email_payment_reminder_subject", value: data.paymentReminderSubject },
        { key: "email_payment_reminder_body", value: data.paymentReminderBody },
      ];

      const results = [];
      for (const setting of settingsToSave) {
        const result = await apiRequest("POST", "/api/settings", setting);
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "settings"] });
      toast({
        title: "Success",
        description: "Email templates updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error saving email templates:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update email templates",
        variant: "destructive",
      });
    },
  });

  /* ── TAX RATES ───────────────────────────────────────────────────────────── */

  const { data: taxRates } = useQuery<any[]>({
    queryKey: ["api", "tax-rates"],
    queryFn: async () => {
      const res = await fetch("/api/tax-rates", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch tax rates: ${res.statusText}`);
      }
      return res.json();
    },
  });

  const taxRateForm = useForm<z.infer<typeof taxRateSchema>>({
    resolver: zodResolver(taxRateSchema),
    defaultValues: {
      name: "",
      percentage: 0,
      description: "",
      isDefault: false,
    },
  });

  const saveTaxRateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taxRateSchema>) => {
      return await apiRequest("POST", "/api/tax-rates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "tax-rates"] });
      taxRateForm.reset();
      toast({
        title: "Success",
        description: "Tax rate added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add tax rate",
        variant: "destructive",
      });
    },
  });

  const deleteTaxRateMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/tax-rates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "tax-rates"] });
      toast({
        title: "Success",
        description: "Tax rate deleted successfully",
      });
    },
  });

  /* ── PAYMENT TERMS ───────────────────────────────────────────────────────── */

  const { data: paymentTerms } = useQuery<any[]>({
    queryKey: ["api", "payment-terms"],
    queryFn: async () => {
      const res = await fetch("/api/payment-terms", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch payment terms: ${res.statusText}`);
      }
      return res.json();
    },
  });

  const paymentTermForm = useForm<z.infer<typeof paymentTermSchema>>({
    resolver: zodResolver(paymentTermSchema),
    defaultValues: {
      name: "",
      days: 0,
      description: "",
      isDefault: false,
    },
  });

  const savePaymentTermMutation = useMutation({
    mutationFn: async (data: z.infer<typeof paymentTermSchema>) => {
      return await apiRequest("POST", "/api/payment-terms", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "payment-terms"] });
      paymentTermForm.reset();
      toast({
        title: "Success",
        description: "Payment term added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add payment term",
        variant: "destructive",
      });
    },
  });

  const deletePaymentTermMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/payment-terms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "payment-terms"] });
      toast({
        title: "Success",
        description: "Payment term deleted successfully",
      });
    },
  });

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-900 dark:text-slate-100 mx-auto" />
          <p className="text-xs text-slate-600 dark:text-slate-400">Loading configuration...</p>
        </div>
      </div>
    );
  }

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
                <SettingsIcon className="h-3.5 w-3.5" />
                Configuration
              </span>
          </nav>


        {/* Header */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Configuration
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Company profile, numbering schemes, and master data
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <TabsList className={cn(
              "inline-flex sm:grid w-full sm:max-w-4xl h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1",
              visibleTabsCount === 1 && "sm:grid-cols-1",
              visibleTabsCount === 2 && "sm:grid-cols-2",
              visibleTabsCount === 3 && "sm:grid-cols-3",
              visibleTabsCount === 4 && "sm:grid-cols-4"
            )}>
              <TabsTrigger value="company" className="flex items-center gap-1 text-[10px] sm:text-xs py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm rounded">
                <Building className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="hidden xs:inline">Company</span>
              </TabsTrigger>
              {showNumberingSchemes && (
                <TabsTrigger value="numbering" className="flex items-center gap-1 text-[10px] sm:text-xs py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm rounded">
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="hidden xs:inline">Numbering</span>
                </TabsTrigger>
              )}
              {showBankDetails && (
                <TabsTrigger value="bank" className="flex items-center gap-1 text-[10px] sm:text-xs py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm rounded">
                  <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="hidden xs:inline">Bank</span>
                </TabsTrigger>
              )}
              {showEmailTemplates && (
                <TabsTrigger value="email" className="flex items-center gap-1 text-[10px] sm:text-xs py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm rounded">
                  <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="hidden xs:inline">Email</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

        {/* Company Profile Tab */}
        <TabsContent value="company" className="space-y-3">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                  <Building className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Company Profile</CardTitle>
                  <CardDescription className="text-[10px]">
                    Information displayed on documents
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit((data) => saveCompanyMutation.mutate(data))} className="space-y-3">
                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm sm:text-base font-semibold">Company Logo</Label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border">
                      {(logoPreview || companyForm.watch("logo")) && (
                        <div className="h-20 w-20 sm:h-24 sm:w-24 border-2 rounded-xl flex items-center justify-center bg-background shrink-0 shadow-sm">
                          <img
                            src={logoPreview || companyForm.watch("logo")}
                            alt="Company Logo"
                            className="max-h-full max-w-full object-contain p-2"
                          />
                        </div>
                      )}
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="cursor-pointer text-xs sm:text-sm"
                            id="logo-upload"
                          />
                          <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                            <Upload className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Choose</span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground font-['Open_Sans']">
                          Upload your company logo (PNG, JPG, or SVG recommended, max 2MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm sm:text-base font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={companyForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Company name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="info@company.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+91 1234567890" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://www.company.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address */}
                  <FormField
                    control={companyForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter complete address" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={companyForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Mumbai" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Maharashtra" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="400001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="India" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  </div>

                  <Separator />

                  {/* Tax IDs */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Tax Identifiers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={companyForm.control}
                        name="gstin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GSTIN</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="22AAAAA0000A1Z5" />
                            </FormControl>
                            <FormDescription>GST Identification Number</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={companyForm.control}
                        name="pan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PAN</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="AAAAA0000A" />
                            </FormControl>
                            <FormDescription>Permanent Account Number</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={companyForm.control}
                        name="tan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TAN</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="AAAA00000A" />
                            </FormControl>
                            <FormDescription>Tax Deduction Account Number</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saveCompanyMutation.isPending} className="w-full sm:w-auto">
                      {saveCompanyMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Save className="mr-2 h-4 w-4" />
                      Save Company Profile
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Numbering Schemes Tab */}
        {showNumberingSchemes && (
          <TabsContent value="numbering" className="space-y-4">
          <Card className="card-elegant hover-glow">
            <CardHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-green-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Document Numbering Schemes</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Configure automatic numbering formats for all document types
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Form {...numberingForm}>
                <form onSubmit={numberingForm.handleSubmit((data) => saveNumberingMutation.mutate(data))} className="space-y-4 sm:space-y-6">
                  <div className="rounded-xl border-2 border-dashed p-4 sm:p-5 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-sm sm:text-base">Format Variables</h4>
                        <p className="text-xs text-muted-foreground">Use these placeholders in your numbering formats</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                      <div className="bg-background p-3 rounded-lg border">
                        <code className="text-primary font-mono font-bold">{"{PREFIX}"}</code>
                        <p className="text-muted-foreground mt-1">Prefix text</p>
                      </div>
                      <div className="bg-background p-3 rounded-lg border">
                        <code className="text-primary font-mono font-bold">{"{YEAR}"}</code>
                        <p className="text-muted-foreground mt-1">Current year</p>
                      </div>
                      <div className="bg-background p-3 rounded-lg border">
                        <code className="text-primary font-mono font-bold">{"{COUNTER}"}</code>
                        <p className="text-muted-foreground mt-1">Auto-increment</p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-['Open_Sans']">
                        <span className="font-semibold">Example:</span>{" "}
                        <code className="text-xs bg-background px-2 py-1 rounded">QT-{"{YEAR}"}-{"{COUNTER}"}</code>
                        {" "}→ QT-2025-001
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Quote Numbering */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold">Quotes</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={numberingForm.control}
                        name="quotePrefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prefix</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="QT" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={numberingForm.control}
                        name="quoteFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Format</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="{PREFIX}-{YEAR}-{COUNTER}" />
                            </FormControl>
                            <FormDescription>
                              Preview: {numberingForm.watch("quotePrefix")}-2025-001
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Vendor PO Numbering */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold">Vendor Purchase Orders</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={numberingForm.control}
                        name="vendorPoPrefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prefix</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="PO" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={numberingForm.control}
                        name="vendorPoFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Format</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="{PREFIX}-{YEAR}-{COUNTER}" />
                            </FormControl>
                            <FormDescription>
                              Preview: {numberingForm.watch("vendorPoPrefix")}-2025-001
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Master Invoice Numbering */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold">Master Invoices</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={numberingForm.control}
                        name="masterInvoicePrefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prefix</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="MINV" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={numberingForm.control}
                        name="masterInvoiceFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Format</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="{PREFIX}-{YEAR}-{COUNTER}" />
                            </FormControl>
                            <FormDescription>
                              Preview: {numberingForm.watch("masterInvoicePrefix")}-2025-001
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Child Invoice Numbering */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-orange-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold">Customer Invoices (Child)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={numberingForm.control}
                        name="childInvoicePrefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prefix</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="INV" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={numberingForm.control}
                        name="childInvoiceFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Format</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="{PREFIX}-{YEAR}-{COUNTER}" />
                            </FormControl>
                            <FormDescription>
                              Preview: {numberingForm.watch("childInvoicePrefix")}-2025-001
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* GRN Numbering */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-indigo-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold">Goods Receipt Notes (GRN)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={numberingForm.control}
                        name="grnPrefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prefix</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="GRN" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={numberingForm.control}
                        name="grnFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Format</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="{PREFIX}-{YEAR}-{COUNTER}" />
                            </FormControl>
                            <FormDescription>
                              Preview: {numberingForm.watch("grnPrefix")}-2025-001
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saveNumberingMutation.isPending} className="w-full sm:w-auto">
                      {saveNumberingMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Save className="mr-2 h-4 w-4" />
                      Save Numbering Schemes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Tax & Terms Tab */}
        <TabsContent value="tax" className="space-y-3">
          {/* Tax Rates Section */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                  <Percent className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Tax Rates (GST/VAT)</CardTitle>
                  <CardDescription className="text-[10px]">
                    Configure tax slabs for invoices and quotes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <Form {...taxRateForm}>
                <form onSubmit={taxRateForm.handleSubmit((data) => saveTaxRateMutation.mutate(data))} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={taxRateForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Tax Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="GST 18%" className="h-8 text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={taxRateForm.control}
                      name="percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Percentage *</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" min="0" max="100" placeholder="18" className="h-8 text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={taxRateForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Description</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Standard GST rate for services" className="h-8 text-xs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={taxRateForm.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal cursor-pointer">
                          Set as default tax rate
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="sm" disabled={saveTaxRateMutation.isPending} className="w-full sm:w-auto h-8 text-xs">
                    {saveTaxRateMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    <Save className="mr-2 h-3 w-3" />
                    Add Tax Rate
                  </Button>
                </form>
              </Form>

              <Separator />

              {/* Tax Rates List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold">Saved Tax Rates</h4>
                {taxRates && taxRates.length > 0 ? (
                  <div className="space-y-2">
                    {taxRates.map((rate: any) => (
                      <div key={rate.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold">{rate.name}</p>
                            {rate.isDefault && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Default</Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{rate.percentage}%</p>
                          {rate.description && (
                            <p className="text-[10px] text-muted-foreground mt-1">{rate.description}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTaxRateMutation.mutate(rate.id)}
                          disabled={deleteTaxRateMutation.isPending}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Loader2 className={cn("h-3 w-3", !deleteTaxRateMutation.isPending && "hidden")} />
                          <span className={cn(deleteTaxRateMutation.isPending && "hidden")}>×</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                    No tax rates configured yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms Section */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                  <CreditCard className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Payment Terms</CardTitle>
                  <CardDescription className="text-[10px]">
                    Define standard payment terms for invoices
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <Form {...paymentTermForm}>
                <form onSubmit={paymentTermForm.handleSubmit((data) => savePaymentTermMutation.mutate(data))} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={paymentTermForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Term Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Net 30" className="h-8 text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentTermForm.control}
                      name="days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Days *</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" placeholder="30" className="h-8 text-xs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={paymentTermForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Description</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Payment due within 30 days" className="h-8 text-xs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={paymentTermForm.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal cursor-pointer">
                          Set as default payment term
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="sm" disabled={savePaymentTermMutation.isPending} className="w-full sm:w-auto h-8 text-xs">
                    {savePaymentTermMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    <Save className="mr-2 h-3 w-3" />
                    Add Payment Term
                  </Button>
                </form>
              </Form>

              <Separator />

              {/* Payment Terms List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold">Saved Payment Terms</h4>
                {paymentTerms && paymentTerms.length > 0 ? (
                  <div className="space-y-2">
                    {paymentTerms.map((term: any) => (
                      <div key={term.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold">{term.name}</p>
                            {term.isDefault && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Default</Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{term.days} days</p>
                          {term.description && (
                            <p className="text-[10px] text-muted-foreground mt-1">{term.description}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePaymentTermMutation.mutate(term.id)}
                          disabled={deletePaymentTermMutation.isPending}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Loader2 className={cn("h-3 w-3", !deletePaymentTermMutation.isPending && "hidden")} />
                          <span className={cn(deletePaymentTermMutation.isPending && "hidden")}>×</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                    No payment terms configured yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Details Tab */}
        {showBankDetails && (
          <TabsContent value="bank" className="space-y-4">
          <Card className="card-elegant hover-glow">
            <CardHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-purple-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Bank Account Details</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Bank information displayed on invoice footers for payment
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Form {...bankForm}>
                <form onSubmit={bankForm.handleSubmit((data) => saveBankMutation.mutate(data))} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={bankForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="State Bank of India" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="branch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Mumbai Main Branch" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Company name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1234567890" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="SBIN0001234" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="swiftCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SWIFT Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="SBININBB123" />
                          </FormControl>
                          <FormDescription>For international payments</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saveBankMutation.isPending} className="w-full sm:w-auto">
                      {saveBankMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Save className="mr-2 h-4 w-4" />
                      Save Bank Details
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Email Templates Tab */}
        {showEmailTemplates && (
          <TabsContent value="email" className="space-y-3">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Email Templates</CardTitle>
                  <CardDescription className="text-[10px]">
                    Customize email templates for automated communications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit((data) => saveEmailTemplatesMutation.mutate(data))} className="space-y-4">

                  {/* Available Variables Info */}
                  <div className="p-2.5 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                    <p className="text-[10px] font-semibold text-blue-900 dark:text-blue-100 mb-1">Available Variables:</p>
                    <p className="text-[10px] text-blue-800 dark:text-blue-200 leading-relaxed">
                      {"{COMPANY_NAME}"}, {"{CLIENT_NAME}"}, {"{QUOTE_NUMBER}"}, {"{INVOICE_NUMBER}"}, {"{PO_NUMBER}"}, {"{TOTAL}"}, {"{OUTSTANDING}"}, {"{DUE_DATE}"}, {"{VALIDITY_DATE}"}, {"{DELIVERY_DATE}"}, {"{DAYS_OVERDUE}"}, {"{BANK_DETAILS}"}
                    </p>
                  </div>

                  {/* Quote Email Template */}
                  <div className="space-y-2 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Quote Email Template
                    </h3>
                    <FormField
                      control={emailForm.control}
                      name="quoteSubject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Subject Line</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter email subject" className="h-9 text-xs" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="quoteBody"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Email Body</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={5} placeholder="Enter email body" className="text-xs resize-none" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Invoice Email Template */}
                  <div className="space-y-2 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5" />
                      Invoice Email Template
                    </h3>
                    <FormField
                      control={emailForm.control}
                      name="invoiceSubject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Subject Line</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter email subject" className="h-9 text-xs" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="invoiceBody"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Email Body</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={5} placeholder="Enter email body" className="text-xs resize-none" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Vendor PO Email Template */}
                  <div className="space-y-2 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" />
                      Vendor PO Email Template
                    </h3>
                    <FormField
                      control={emailForm.control}
                      name="vendorPoSubject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Subject Line</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter email subject" className="h-9 text-xs" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="vendorPoBody"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Email Body</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={5} placeholder="Enter email body" className="text-xs resize-none" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Payment Reminder Email Template */}
                  <div className="space-y-2 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Payment Reminder Template
                    </h3>
                    <FormField
                      control={emailForm.control}
                      name="paymentReminderSubject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Subject Line</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter email subject" className="h-9 text-xs" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="paymentReminderBody"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Email Body</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={5} placeholder="Enter email body" className="text-xs resize-none" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                    <Button
                      type="submit"
                      disabled={saveEmailTemplatesMutation.isPending}
                      className="h-8 text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
                    >
                      {saveEmailTemplatesMutation.isPending ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 mr-1.5" />
                          Save Templates
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        )}
      </Tabs>
    </div>
    </div>
  );
}


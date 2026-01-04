import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
    taxRateSchema,
    pricingTierSchema,
    currencySettingsSchema,
    TaxRate,
    PricingTier,
    CurrencySettings,
} from "./types";

export function useAdminSettings() {
    const { toast } = useToast();

    // Base data
    const { data: taxRates, isLoading: taxRatesLoading } = useQuery<TaxRate[]>({
        queryKey: ["/api/tax-rates"],
    });

    const { data: pricingTiers, isLoading: pricingTiersLoading } = useQuery<PricingTier[]>({
        queryKey: ["/api/pricing-tiers"],
    });

    const { data: currencySettings } = useQuery<CurrencySettings>({
        queryKey: ["/api/currency-settings"],
    });

    /* ── Forms ─────────────────────────────────────────────────────────────── */

    const taxRateForm = useForm<z.infer<typeof taxRateSchema>>({
        resolver: zodResolver(taxRateSchema),
        defaultValues: {
            region: "",
            taxType: "GST",
            sgstRate: 0,
            cgstRate: 0,
            igstRate: 0,
        },
    });

    const pricingTierForm = useForm<z.infer<typeof pricingTierSchema>>({
        resolver: zodResolver(pricingTierSchema),
        defaultValues: {
            name: "",
            minAmount: 0,
            maxAmount: undefined,
            discountPercent: 0,
            description: "",
        },
    });

    const currencyForm = useForm<z.infer<typeof currencySettingsSchema>>({
        resolver: zodResolver(currencySettingsSchema),
        values: {
            baseCurrency: currencySettings?.baseCurrency || "INR",
            supportedCurrencies: currencySettings?.supportedCurrencies
                ? JSON.parse(currencySettings.supportedCurrencies)
                : ["INR", "USD", "EUR"],
        },
    });

    /* ── Mutations ─────────────────────────────────────────────────────────── */

    const createTaxRateMutation = useMutation({
        mutationFn: async (data: z.infer<typeof taxRateSchema>) => {
            return await apiRequest("POST", "/api/tax-rates", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tax-rates"] });
            taxRateForm.reset();
            toast({ title: "Tax rate created", description: "The tax rate has been added successfully." });
        },
        onError: (error: any) => {
            toast({
                title: "Failed to create tax rate",
                description: error?.message || "Something went wrong.",
                variant: "destructive",
            });
        },
    });

    const deleteTaxRateMutation = useMutation({
        mutationFn: async (id: string) => {
            return await apiRequest("DELETE", `/api/tax-rates/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tax-rates"] });
            toast({ title: "Tax rate deleted", description: "The tax rate has been removed successfully." });
        },
    });

    const toggleTaxRateStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            return await apiRequest("PATCH", `/api/tax-rates/${id}`, { isActive });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tax-rates"] });
            toast({ title: "Tax rate status updated", description: "Status updated successfully." });
        },
    });

    const createPricingTierMutation = useMutation({
        mutationFn: async (data: z.infer<typeof pricingTierSchema>) => {
            const payload = {
                ...data,
                maxAmount: data.maxAmount === undefined || data.maxAmount === null || isNaN(data.maxAmount as number) || data.maxAmount === 0 
                    ? null 
                    : data.maxAmount,
            };
            return await apiRequest("POST", "/api/pricing-tiers", payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/pricing-tiers"] });
            pricingTierForm.reset();
            toast({ title: "Pricing tier created", description: "The pricing tier has been added." });
        },
    });

    const deletePricingTierMutation = useMutation({
        mutationFn: async (id: string) => {
            return await apiRequest("DELETE", `/api/pricing-tiers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/pricing-tiers"] });
            toast({ title: "Pricing tier deleted", description: "The pricing tier has been removed." });
        },
    });

    const updateCurrencySettingsMutation = useMutation({
        mutationFn: async (data: z.infer<typeof currencySettingsSchema>) => {
            return await apiRequest("POST", "/api/currency-settings", {
                baseCurrency: data.baseCurrency,
                supportedCurrencies: JSON.stringify(data.supportedCurrencies),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/currency-settings"] });
            toast({ title: "Currency settings updated", description: "Saved successfully." });
        },
    });

    /* ── Submit Handlers ───────────────────────────────────────────────────── */

    const onTaxRateSubmit = async (values: z.infer<typeof taxRateSchema>) => {
        await createTaxRateMutation.mutateAsync(values);
    };

    const onPricingTierSubmit = async (values: z.infer<typeof pricingTierSchema>) => {
        await createPricingTierMutation.mutateAsync(values);
    };

    const onCurrencySettingsSubmit = async (values: z.infer<typeof currencySettingsSchema>) => {
        await updateCurrencySettingsMutation.mutateAsync(values);
    };

    return {
        taxRates,
        taxRatesLoading,
        pricingTiers,
        pricingTiersLoading,
        currencySettings,
        taxRateForm,
        pricingTierForm,
        currencyForm,
        createTaxRateMutation,
        deleteTaxRateMutation,
        toggleTaxRateStatusMutation,
        createPricingTierMutation,
        deletePricingTierMutation,
        updateCurrencySettingsMutation,
        onTaxRateSubmit,
        onPricingTierSubmit,
        onCurrencySettingsSubmit,
    };
}


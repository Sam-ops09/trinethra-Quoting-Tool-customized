import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────────
   Schemas & Types
──────────────────────────────────────────────────────────────────────────── */

export const taxRateSchema = z.object({
    region: z.string().min(1, "Region is required"),
    taxType: z.string().min(1, "Tax type is required"),
    sgstRate: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            return val;
        },
        z.coerce.number().min(0).max(100)
    ),
    cgstRate: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            return val;
        },
        z.coerce.number().min(0).max(100)
    ),
    igstRate: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            return val;
        },
        z.coerce.number().min(0).max(100)
    ),
});

export type TaxRate = {
    id: string;
    region: string;
    taxType: string;
    sgstRate: string;
    cgstRate: string;
    igstRate: string;
    effectiveFrom: string;
    effectiveTo?: string;
    isActive: boolean;
};

export const pricingTierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    minAmount: z.coerce.number().min(0),
    maxAmount: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            return val;
        },
        z.coerce.number().min(0).optional()
    ),
    discountPercent: z.coerce.number().min(0).max(100),
    description: z.string().optional(),
});

export type PricingTier = {
    id: string;
    name: string;
    minAmount: string;
    maxAmount?: string;
    discountPercent: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export const currencySettingsSchema = z.object({
    baseCurrency: z.string().min(1, "Base currency is required"),
    supportedCurrencies: z.array(z.string()).min(1, "At least one currency is required"),
});

export type CurrencySettings = {
    id?: string;
    baseCurrency: string;
    supportedCurrencies: string; // JSON array string
    exchangeRates?: string;
    updatedAt?: string;
};


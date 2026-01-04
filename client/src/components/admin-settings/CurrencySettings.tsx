import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Globe2 } from "lucide-react";
import { useAdminSettings } from "./hooks";

export function CurrencySettings() {
    const {
        currencyForm,
        updateCurrencySettingsMutation,
        onCurrencySettingsSubmit,
    } = useAdminSettings();

    const supportedCurrenciesList = ["INR","USD","EUR","GBP","AUD","CAD","SGD","AED"];

    return (
        <Card className="card-elegant hover-glow">
            <CardHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-purple-500/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Globe2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <CardTitle className="text-base sm:text-lg">Currency Settings</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Base & supported currencies
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <Form {...currencyForm}>
                    <form
                        onSubmit={currencyForm.handleSubmit(onCurrencySettingsSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={currencyForm.control}
                            name="baseCurrency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Base Currency *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger data-testid="select-base-currency">
                                                <SelectValue placeholder="Select base currency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {supportedCurrenciesList.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {c}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Primary currency for quotes & invoices</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <FormLabel>Supported Currencies</FormLabel>
                            <FormDescription>Select additional currencies for international clients</FormDescription>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                                {supportedCurrenciesList.map((currency) => (
                                    <FormField
                                        key={currency}
                                        control={currencyForm.control}
                                        name="supportedCurrencies"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300"
                                                        checked={field.value?.includes(currency)}
                                                        onChange={(e) => {
                                                            const current = field.value || [];
                                                            if (e.target.checked) {
                                                                field.onChange([...current, currency]);
                                                            } else {
                                                                field.onChange(current.filter((c: string) => c !== currency));
                                                            }
                                                        }}
                                                        data-testid={`checkbox-currency-${currency}`}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {currency}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2">Current Settings</h4>
                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="font-medium">Base Currency:</span>{" "}
                                    {currencyForm.watch("baseCurrency")}
                                </p>
                                <p>
                                    <span className="font-medium">Supported:</span>{" "}
                                    {currencyForm.watch("supportedCurrencies")?.join(", ") || "None"}
                                </p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={updateCurrencySettingsMutation.isPending}
                            data-testid="button-save-currency"
                            className="bg-primary hover:bg-secondary"
                        >
                            {updateCurrencySettingsMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Currency Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


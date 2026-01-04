import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calculator, Shield } from "lucide-react";
import { useAdminSettings } from "./hooks";
import { TaxRate } from "./types";
import { InfoChip, NumberField } from "./utils";

export function TaxSettings() {
    const {
        taxRates,
        taxRatesLoading,
        taxRateForm,
        createTaxRateMutation,
        deleteTaxRateMutation,
        toggleTaxRateStatusMutation,
        onTaxRateSubmit,
    } = useAdminSettings();

    return (
        <Card className="card-elegant hover-glow">
            <CardHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-500/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <CardTitle className="text-base sm:text-lg">Tax Rate Management</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Configure GST by region & type
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-base sm:text-lg font-semibold">Tax Rates</h3>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-secondary">
                                <Calculator className="h-4 w-4 mr-2" />
                                Add Tax Rate
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[min(100%-2rem,36rem)]">
                            <DialogHeader>
                                <DialogTitle>Add New Tax Rate</DialogTitle>
                            </DialogHeader>
                            <Form {...taxRateForm}>
                                <form onSubmit={taxRateForm.handleSubmit(onTaxRateSubmit)} className="space-y-4">
                                    <FormField
                                        control={taxRateForm.control}
                                        name="region"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Region *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., IN-KA, IN-MH" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={taxRateForm.control}
                                        name="taxType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tax Type *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select tax type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="GST">GST</SelectItem>
                                                        <SelectItem value="VAT">VAT</SelectItem>
                                                        <SelectItem value="SAT">SAT</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3">
                                        <NumberField name="sgstRate" label="SGST Rate (%)" control={taxRateForm.control} />
                                        <NumberField name="cgstRate" label="CGST Rate (%)" control={taxRateForm.control} />
                                        <NumberField name="igstRate" label="IGST Rate (%)" control={taxRateForm.control} />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={createTaxRateMutation.isPending}
                                        className="w-full bg-primary hover:bg-secondary"
                                    >
                                        {createTaxRateMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Create Tax Rate
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Desktop table */}
                <div className="border rounded-lg overflow-x-auto hidden sm:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[120px]">Region</TableHead>
                                <TableHead className="min-w-[100px]">Tax Type</TableHead>
                                <TableHead className="min-w-[80px]">SGST</TableHead>
                                <TableHead className="min-w-[80px]">CGST</TableHead>
                                <TableHead className="min-w-[80px]">IGST</TableHead>
                                <TableHead className="min-w-[100px]">Status</TableHead>
                                <TableHead className="min-w-[220px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taxRatesLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                        Loading tax rates...
                                    </TableCell>
                                </TableRow>
                            ) : (taxRates?.length ?? 0) === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No tax rates configured yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                taxRates!.map((rate: TaxRate) => (
                                    <TableRow key={rate.id}>
                                        <TableCell className="font-medium">{rate.region}</TableCell>
                                        <TableCell>{rate.taxType}</TableCell>
                                        <TableCell>{rate.sgstRate}%</TableCell>
                                        <TableCell>{rate.cgstRate}%</TableCell>
                                        <TableCell>{rate.igstRate}%</TableCell>
                                        <TableCell>
                                            <Badge variant={rate.isActive ? "default" : "secondary"}>
                                                {rate.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() =>
                                                        toggleTaxRateStatusMutation.mutate({
                                                            id: rate.id,
                                                            isActive: !rate.isActive,
                                                        })
                                                    }
                                                    disabled={toggleTaxRateStatusMutation.isPending}
                                                >
                                                    {rate.isActive ? "Deactivate" : "Activate"}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => deleteTaxRateMutation.mutate(rate.id)}
                                                    disabled={deleteTaxRateMutation.isPending}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile cards */}
                <div className="grid gap-3 sm:hidden">
                    {taxRatesLoading ? (
                        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading tax rates...
                        </div>
                    ) : (taxRates?.length ?? 0) === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            No tax rates configured yet
                        </div>
                    ) : (
                        taxRates!.map((rate: TaxRate) => (
                            <Card key={rate.id} className="border-2">
                                <CardContent className="p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold">{rate.region}</div>
                                        <Badge variant={rate.isActive ? "default" : "secondary"}>
                                            {rate.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">Type: {rate.taxType}</div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <InfoChip label="SGST" value={`${rate.sgstRate}%`} />
                                        <InfoChip label="CGST" value={`${rate.cgstRate}%`} />
                                        <InfoChip label="IGST" value={`${rate.igstRate}%`} />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs flex-1"
                                            onClick={() =>
                                                toggleTaxRateStatusMutation.mutate({
                                                    id: rate.id,
                                                    isActive: !rate.isActive,
                                                })
                                            }
                                        >
                                            {rate.isActive ? "Deactivate" : "Activate"}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => deleteTaxRateMutation.mutate(rate.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign } from "lucide-react";
import { useAdminSettings } from "./hooks";
import { PricingTier } from "./types";
import { InfoChip, NumberField } from "./utils";

export function PricingSettings() {
    const {
        pricingTiers,
        pricingTiersLoading,
        pricingTierForm,
        createPricingTierMutation,
        deletePricingTierMutation,
        onPricingTierSubmit,
    } = useAdminSettings();

    return (
        <Card className="card-elegant hover-glow">
            <CardHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-green-500/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <CardTitle className="text-base sm:text-lg">Pricing Tiers</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Automatic discounts by amount
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-base sm:text-lg font-semibold">Tiers</h3>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-secondary">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Add Pricing Tier
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[min(100%-2rem,36rem)]">
                            <DialogHeader>
                                <DialogTitle>Add New Pricing Tier</DialogTitle>
                            </DialogHeader>
                            <Form {...pricingTierForm}>
                                <form
                                    onSubmit={pricingTierForm.handleSubmit(onPricingTierSubmit)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={pricingTierForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tier Name *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., Standard, Premium" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                                        <NumberField name="minAmount" label="Minimum Amount *" control={pricingTierForm.control} />
                                        <FormField
                                            control={pricingTierForm.control}
                                            name="maxAmount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Maximum Amount (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            step="0.01"
                                                            value={field.value ?? ""}
                                                            onChange={(e) =>
                                                                field.onChange(e.target.value ? Number(e.target.value) : undefined)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Leave empty for unlimited</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <NumberField
                                        name="discountPercent"
                                        label="Discount Percentage *"
                                        control={pricingTierForm.control}
                                    />
                                    <FormField
                                        control={pricingTierForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Optional description" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={createPricingTierMutation.isPending}
                                        className="w-full bg-primary hover:bg-secondary"
                                    >
                                        {createPricingTierMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Create Pricing Tier
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
                                <TableHead className="min-w-[140px]">Tier Name</TableHead>
                                <TableHead className="min-w-[120px]">Min Amount</TableHead>
                                <TableHead className="min-w-[120px]">Max Amount</TableHead>
                                <TableHead className="min-w-[100px]">Discount</TableHead>
                                <TableHead className="min-w-[220px]">Description</TableHead>
                                <TableHead className="min-w-[100px]">Status</TableHead>
                                <TableHead className="min-w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pricingTiersLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                        Loading pricing tiers...
                                    </TableCell>
                                </TableRow>
                            ) : (pricingTiers?.length ?? 0) === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No pricing tiers configured yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pricingTiers!.map((tier: PricingTier) => (
                                    <TableRow key={tier.id}>
                                        <TableCell className="font-medium">{tier.name}</TableCell>
                                        <TableCell>₹{Number(tier.minAmount).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {tier.maxAmount ? `₹${Number(tier.maxAmount).toLocaleString()}` : "Unlimited"}
                                        </TableCell>
                                        <TableCell>{tier.discountPercent}%</TableCell>
                                        <TableCell className="max-w-[280px] truncate" title={tier.description || "-"}>
                                            {tier.description || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={tier.isActive ? "default" : "secondary"}>
                                                {tier.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => deletePricingTierMutation.mutate(tier.id)}
                                                disabled={deletePricingTierMutation.isPending}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile cards */}
                <div className="grid gap-3 sm:hidden">
                    {pricingTiersLoading ? (
                        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading pricing tiers...
                        </div>
                    ) : (pricingTiers?.length ?? 0) === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            No pricing tiers configured yet
                        </div>
                    ) : (
                        pricingTiers!.map((tier: PricingTier) => (
                            <Card key={tier.id} className="border-2">
                                <CardContent className="p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold">{tier.name}</div>
                                        <Badge variant={tier.isActive ? "default" : "secondary"}>
                                            {tier.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <InfoChip label="Min" value={`₹${Number(tier.minAmount).toLocaleString()}`} />
                                        <InfoChip
                                            label="Max"
                                            value={tier.maxAmount ? `₹${Number(tier.maxAmount).toLocaleString()}` : "∞"}
                                        />
                                        <InfoChip label="Discount" value={`${tier.discountPercent}%`} />
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {tier.description || "—"}
                                    </p>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => deletePricingTierMutation.mutate(tier.id)}
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


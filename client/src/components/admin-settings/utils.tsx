import { Input } from "@/components/ui/input";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

export function InfoChip({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-muted/50 p-2 text-center">
            <div className="text-[10px] text-muted-foreground">{label}</div>
            <div className="text-sm font-semibold">{value}</div>
        </div>
    );
}

export function NumberField({
    name,
    label,
    control,
}: {
    name: any;
    label: string;
    control: any;
}) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }: any) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            type="number"
                            step="0.01"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}


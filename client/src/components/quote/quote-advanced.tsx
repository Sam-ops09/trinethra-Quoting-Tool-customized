import { UseFormReturn } from "react-hook-form";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExecBOMSection } from "@/components/shared/exec-bom-section";
import { SLASection, type SLAData } from "@/components/quote/sla-section";
import { TimelineSection, type TimelineData } from "@/components/quote/timeline-section";
import type { ExecBOMData } from "@/types/bom-types";

interface QuoteAdvancedProps {
    form: UseFormReturn<any>;
    bomData: ExecBOMData;
    setBomData: (data: ExecBOMData) => void;
    slaData: SLAData;
    setSlaData: (data: SLAData) => void;
    timelineData: TimelineData;
    setTimelineData: (data: TimelineData) => void;
}

export function QuoteAdvanced({ 
    form, 
    bomData, 
    setBomData, 
    slaData, 
    setSlaData, 
    timelineData, 
    setTimelineData 
}: QuoteAdvancedProps) {
    const showBOM = useFeatureFlag("quotes_bomSection");
    const showSLA = useFeatureFlag("quotes_slaSection");
    const showTimeline = useFeatureFlag("quotes_timelineSection");
    
    // Determine the default tab dynamically based on active features
    const defaultTab = showBOM ? "bom" : showSLA ? "sla" : showTimeline ? "timeline" : undefined;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Advanced details</h2>
                <p className="text-muted-foreground">
                    Define technical specifications, service level agreements, and project timeline.
                </p>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>Add notes and terms for your client</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        value={field.value || ""}
                                        placeholder="Add any additional notes (e.g. Bank details, Special instructions)..."
                                        className="min-h-[100px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="termsAndConditions"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Terms & Conditions</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        value={field.value || ""}
                                        placeholder="Enter specific terms and conditions..."
                                        className="min-h-[120px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle>Technical & Project Specifications</CardTitle>
                    <CardDescription>Include Bill of Materials, SLA definitions, or Project Timelines if applicable.</CardDescription>
                </CardHeader>
                <CardContent>
                    {(showBOM || showSLA || showTimeline) && defaultTab && (
                      <Tabs defaultValue={defaultTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1 mb-6">
                              {showBOM && <TabsTrigger value="bom" className="py-2.5">📦 Bill of Materials</TabsTrigger>}
                              {showSLA && <TabsTrigger value="sla" className="py-2.5">📋 Service Level Agreement</TabsTrigger>}
                              {showTimeline && <TabsTrigger value="timeline" className="py-2.5">📅 Project Timeline</TabsTrigger>}
                          </TabsList>
                          
                          {showBOM && (
                            <TabsContent value="bom" className="space-y-4">
                                <div className="bg-muted/10 p-4 rounded-lg border border-dashed">
                                    <ExecBOMSection
                                        value={bomData}
                                        onChange={setBomData}
                                    />
                                </div>
                            </TabsContent>
                          )}
                          
                          {showSLA && (
                            <TabsContent value="sla" className="space-y-4">
                                <div className="bg-muted/10 p-4 rounded-lg border border-dashed">
                                    <SLASection
                                        data={slaData}
                                        onChange={setSlaData}
                                    />
                                </div>
                            </TabsContent>
                          )}
                          
                          {showTimeline && (
                            <TabsContent value="timeline" className="space-y-4">
                                <div className="bg-muted/10 p-4 rounded-lg border border-dashed">
                                    <TimelineSection
                                        data={timelineData}
                                        onChange={setTimelineData}
                                    />
                                </div>
                            </TabsContent>
                          )}
                      </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

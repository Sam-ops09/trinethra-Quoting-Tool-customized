import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Shield, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SLAMetric {
  id: string;
  name: string;
  description: string;
  target: string;
  measurement: string;
  penalty?: string;
}

export interface SLAData {
  overview: string;
  responseTime?: string;
  resolutionTime?: string;
  availability?: string;
  supportHours?: string;
  escalationProcess?: string;
  metrics: SLAMetric[];
}

interface SLASectionProps {
  data: SLAData;
  onChange: (data: SLAData) => void;
  readonly?: boolean;
}

export function SLASection({ data, onChange, readonly = false }: SLASectionProps) {
  const addMetric = () => {
    const newMetric: SLAMetric = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      target: "",
      measurement: "percentage",
      penalty: "",
    };
    onChange({
      ...data,
      metrics: [...data.metrics, newMetric],
    });
  };

  const updateMetric = (id: string, field: keyof SLAMetric, value: any) => {
    onChange({
      ...data,
      metrics: data.metrics.map((metric) =>
        metric.id === id ? { ...metric, [field]: value } : metric
      ),
    });
  };

  const removeMetric = (id: string) => {
    onChange({
      ...data,
      metrics: data.metrics.filter((metric) => metric.id !== id),
    });
  };

  const updateField = (field: keyof SLAData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
        <h3 className="text-base sm:text-lg font-semibold">Service Level Agreement (SLA)</h3>
      </div>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium">Overview</label>
          <Textarea
            value={data.overview}
            onChange={(e) => updateField("overview", e.target.value)}
            placeholder="Provide an overview of the service level commitments"
            disabled={readonly}
            rows={3}
            data-testid="input-sla-overview"
            className="min-h-[70px] sm:min-h-[80px] text-sm resize-none"
          />
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Response Time
            </label>
            <Input
              value={data.responseTime || ""}
              onChange={(e) => updateField("responseTime", e.target.value)}
              placeholder="e.g., 4 business hours"
              disabled={readonly}
              data-testid="input-sla-response-time"
              className="h-9 sm:h-10 text-sm"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Resolution Time
            </label>
            <Input
              value={data.resolutionTime || ""}
              onChange={(e) => updateField("resolutionTime", e.target.value)}
              placeholder="e.g., 24 business hours"
              disabled={readonly}
              data-testid="input-sla-resolution-time"
              className="h-9 sm:h-10 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">System Availability</label>
            <Input
              value={data.availability || ""}
              onChange={(e) => updateField("availability", e.target.value)}
              placeholder="e.g., 99.9% uptime"
              disabled={readonly}
              data-testid="input-sla-availability"
              className="h-9 sm:h-10 text-sm"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Support Hours</label>
            <Input
              value={data.supportHours || ""}
              onChange={(e) => updateField("supportHours", e.target.value)}
              placeholder="e.g., 24/7 or Mon-Fri 9AM-6PM"
              disabled={readonly}
              data-testid="input-sla-support-hours"
              className="h-9 sm:h-10 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium">Escalation Process</label>
          <Textarea
            value={data.escalationProcess || ""}
            onChange={(e) => updateField("escalationProcess", e.target.value)}
            placeholder="Describe the escalation procedure for unresolved issues"
            disabled={readonly}
            rows={3}
            data-testid="input-sla-escalation"
            className="min-h-[70px] sm:min-h-[80px] text-sm resize-none"
          />
        </div>

        <div className="border-t pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
            <h4 className="font-medium text-sm sm:text-base">Performance Metrics</h4>
            {!readonly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMetric}
                data-testid="button-add-sla-metric"
                className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Add Metric
              </Button>
            )}
          </div>

          {data.metrics.length === 0 ? (
            <div className="text-center py-4 sm:py-6 text-muted-foreground text-xs sm:text-sm">
              No performance metrics defined
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {data.metrics.map((metric, index) => (
                <div key={metric.id} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-br from-muted/10 to-transparent">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-medium text-sm sm:text-base">Metric {index + 1}</h5>
                    {!readonly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMetric(metric.id)}
                        data-testid={`button-remove-sla-metric-${index}`}
                        className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Metric Name *</label>
                      <Input
                        value={metric.name}
                        onChange={(e) => updateMetric(metric.id, "name", e.target.value)}
                        placeholder="e.g., Ticket Resolution Rate"
                        disabled={readonly}
                        data-testid={`input-sla-metric-name-${index}`}
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Target *</label>
                      <Input
                        value={metric.target}
                        onChange={(e) => updateMetric(metric.id, "target", e.target.value)}
                        placeholder="e.g., 95%"
                        disabled={readonly}
                        data-testid={`input-sla-metric-target-${index}`}
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Description</label>
                    <Textarea
                      value={metric.description}
                      onChange={(e) => updateMetric(metric.id, "description", e.target.value)}
                      placeholder="Describe what this metric measures"
                      disabled={readonly}
                      rows={2}
                      data-testid={`input-sla-metric-description-${index}`}
                      className="min-h-[60px] sm:min-h-[70px] text-sm resize-none"
                    />
                  </div>

                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Measurement Unit</label>
                      <Select
                        value={metric.measurement}
                        onValueChange={(value) => updateMetric(metric.id, "measurement", value)}
                        disabled={readonly}
                      >
                        <SelectTrigger data-testid={`select-sla-metric-measurement-${index}`} className="h-9 sm:h-10 text-sm">
                          <SelectValue placeholder="Select measurement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="time">Time</SelectItem>
                          <SelectItem value="count">Count</SelectItem>
                          <SelectItem value="ratio">Ratio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Penalty for Non-Compliance</label>
                      <Input
                        value={metric.penalty || ""}
                        onChange={(e) => updateMetric(metric.id, "penalty", e.target.value)}
                        placeholder="e.g., 10% service credit"
                        disabled={readonly}
                        data-testid={`input-sla-metric-penalty-${index}`}
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


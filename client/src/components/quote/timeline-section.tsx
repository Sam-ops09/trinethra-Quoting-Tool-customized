import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Calendar, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface TimelineMilestone {
  id: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  status: "planned" | "in-progress" | "completed" | "delayed";
  deliverables?: string;
  dependencies?: string;
}

export interface TimelineData {
  projectOverview: string;
  startDate?: string;
  endDate?: string;
  milestones: TimelineMilestone[];
}

interface TimelineSectionProps {
  data: TimelineData;
  onChange: (data: TimelineData) => void;
  readonly?: boolean;
}

export function TimelineSection({ data, onChange, readonly = false }: TimelineSectionProps) {
  const addMilestone = () => {
    const newMilestone: TimelineMilestone = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      duration: "",
      status: "planned",
      deliverables: "",
      dependencies: "",
    };
    onChange({
      ...data,
      milestones: [...data.milestones, newMilestone],
    });
  };

  const updateMilestone = (id: string, field: keyof TimelineMilestone, value: any) => {
    onChange({
      ...data,
      milestones: data.milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      ),
    });
  };

  const removeMilestone = (id: string) => {
    onChange({
      ...data,
      milestones: data.milestones.filter((milestone) => milestone.id !== id),
    });
  };

  const updateField = (field: keyof TimelineData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "text-muted-foreground bg-muted";
      case "in-progress":
        return "text-primary bg-primary/10 dark:bg-primary/20";
      case "completed":
        return "text-success bg-success/10 dark:bg-success/20";
      case "delayed":
        return "text-destructive bg-destructive/10 dark:bg-destructive/20";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
        <h3 className="text-base sm:text-lg font-semibold">Project Timeline</h3>
      </div>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium">Project Overview</label>
          <Textarea
            value={data.projectOverview}
            onChange={(e) => updateField("projectOverview", e.target.value)}
            placeholder="Provide an overview of the project timeline and approach"
            disabled={readonly}
            rows={3}
            data-testid="input-timeline-overview"
            className="min-h-[70px] sm:min-h-[80px] text-sm resize-none"
          />
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Project Start Date</label>
            <Input
              type="date"
              value={data.startDate || ""}
              onChange={(e) => updateField("startDate", e.target.value)}
              disabled={readonly}
              data-testid="input-timeline-start-date"
              className="h-9 sm:h-10 text-sm"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Project End Date</label>
            <Input
              type="date"
              value={data.endDate || ""}
              onChange={(e) => updateField("endDate", e.target.value)}
              disabled={readonly}
              data-testid="input-timeline-end-date"
              className="h-9 sm:h-10 text-sm"
            />
          </div>
        </div>

        <div className="border-t pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
            <h4 className="font-medium text-sm sm:text-base">Milestones & Phases</h4>
            {!readonly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
                data-testid="button-add-milestone"
                className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Add Milestone
              </Button>
            )}
          </div>

          {data.milestones.length === 0 ? (
            <div className="text-center py-4 sm:py-6 text-muted-foreground text-xs sm:text-sm">
              No milestones defined yet
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {data.milestones.map((milestone, index) => (
                <div key={milestone.id} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-br from-muted/10 to-transparent">
                  <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <CheckCircle2 className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${
                        milestone.status === "completed" ? "text-success" : "text-muted-foreground"
                      }`} />
                      <h5 className="font-medium text-sm sm:text-base">Phase {index + 1}</h5>
                      <span className={`text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full whitespace-nowrap ${getStatusColor(milestone.status)}`}>
                        {milestone.status}
                      </span>
                    </div>
                    {!readonly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMilestone(milestone.id)}
                        data-testid={`button-remove-milestone-${index}`}
                        className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Milestone Name *</label>
                    <Input
                      value={milestone.name}
                      onChange={(e) => updateMilestone(milestone.id, "name", e.target.value)}
                      placeholder="e.g., Requirements Gathering"
                      disabled={readonly}
                      data-testid={`input-milestone-name-${index}`}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Description</label>
                    <Textarea
                      value={milestone.description}
                      onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                      placeholder="Describe the activities and goals for this phase"
                      disabled={readonly}
                      rows={2}
                      data-testid={`input-milestone-description-${index}`}
                      className="min-h-[60px] sm:min-h-[70px] text-sm resize-none"
                    />
                  </div>

                  <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Start Date</label>
                      <Input
                        type="date"
                        value={milestone.startDate || ""}
                        onChange={(e) => updateMilestone(milestone.id, "startDate", e.target.value)}
                        disabled={readonly}
                        data-testid={`input-milestone-start-date-${index}`}
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        value={milestone.endDate || ""}
                        onChange={(e) => updateMilestone(milestone.id, "endDate", e.target.value)}
                        disabled={readonly}
                        data-testid={`input-milestone-end-date-${index}`}
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 col-span-2 md:col-span-1">
                      <label className="text-xs sm:text-sm font-medium">Duration</label>
                      <Input
                        value={milestone.duration || ""}
                        onChange={(e) => updateMilestone(milestone.id, "duration", e.target.value)}
                        placeholder="e.g., 2 weeks"
                        disabled={readonly}
                        data-testid={`input-milestone-duration-${index}`}
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Status</label>
                    <Select
                      value={milestone.status}
                      onValueChange={(value: any) => updateMilestone(milestone.id, "status", value)}
                      disabled={readonly}
                    >
                      <SelectTrigger data-testid={`select-milestone-status-${index}`} className="h-9 sm:h-10 text-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Deliverables</label>
                    <Textarea
                      value={milestone.deliverables || ""}
                      onChange={(e) => updateMilestone(milestone.id, "deliverables", e.target.value)}
                      placeholder="List the expected deliverables for this milestone"
                      disabled={readonly}
                      rows={2}
                      data-testid={`input-milestone-deliverables-${index}`}
                      className="min-h-[60px] sm:min-h-[70px] text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Dependencies</label>
                    <Textarea
                      value={milestone.dependencies || ""}
                      onChange={(e) => updateMilestone(milestone.id, "dependencies", e.target.value)}
                      placeholder="List any dependencies or prerequisites"
                      disabled={readonly}
                      rows={2}
                      data-testid={`input-milestone-dependencies-${index}`}
                      className="min-h-[60px] sm:min-h-[70px] text-sm resize-none"
                    />
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


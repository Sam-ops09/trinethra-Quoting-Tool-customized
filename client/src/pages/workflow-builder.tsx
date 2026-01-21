
/**
 * Workflow Builder Page
 * 
 * Visual workflow builder for creating and editing workflows
 */

import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    Plus, 
    Trash2, 
    Save, 
    Play, 
    ArrowRight, 
    Zap, 
    AlertCircle, 
    ChevronLeft, 
    Settings, 
    ListChecks, 
    MousePointerClick,
    Info,
    Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkflowTrigger {
  id?: string;
  triggerType: string;
  conditions: Record<string, any>;
  isActive: boolean;
}

interface WorkflowAction {
  id?: string;
  actionType: string;
  actionConfig: Record<string, any>;
  executionOrder: number;
  delayMinutes: number;
  isActive: boolean;
}

interface WorkflowData {
  name: string;
  description: string;
  entityType: string;
  status: "active" | "inactive" | "draft";
  priority: number;
  triggerLogic: "AND" | "OR";
}

// Entity specific options
const ENTITY_FIELDS = {
    quote: ["status", "total_amount", "client_name", "valid_until"],
    invoice: ["status", "total_amount", "due_date", "client_name"],
    client: ["status", "industry", "region"],
};

export default function WorkflowBuilderPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditMode = Boolean(id);

  const [workflow, setWorkflow] = useState<WorkflowData>({
    name: "",
    description: "",
    entityType: "quote",
    status: "draft",
    priority: 0,
    triggerLogic: "AND",
  });

  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([
    {
      triggerType: "status_change",
      conditions: { field: "status", to: "" },
      isActive: true,
    },
  ]);

  const [actions, setActions] = useState<WorkflowAction[]>([
    {
      actionType: "send_email",
      actionConfig: { to: "", subject: "", body: "" },
      executionOrder: 0,
      delayMinutes: 0,
      isActive: true,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (isEditMode) {
      fetchWorkflow();
    }
  }, [id]);

  const fetchWorkflow = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch workflow");

      const data = await response.json();
      setWorkflow(data.workflow);
      
      // Map API triggers to UI state
      if (data.triggers && data.triggers.length > 0) {
        setTriggers(data.triggers);
      }
      
      // Map API actions to UI state
      if (data.actions && data.actions.length > 0) {
        setActions(data.actions);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load workflow",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!workflow.name) {
      toast({
        title: "Validation Error",
        description: "Workflow name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        workflow,
        triggers,
        actions: actions.map((a, index) => ({ ...a, executionOrder: index })),
      };

      const url = isEditMode ? `/api/workflows/${id}` : "/api/workflows";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save workflow");

      toast({
        title: "Success",
        description: `Workflow ${isEditMode ? "updated" : "created"} successfully`,
      });

      if (!isEditMode) {
        setLocation("/workflows");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save workflow",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // --- Trigger Handlers ---
  const addTrigger = () => {
    setTriggers([
      ...triggers,
      {
        triggerType: "status_change",
        conditions: { field: "status", to: "" },
        isActive: true,
      },
    ]);
  };

  const removeTrigger = (index: number) => {
    const newTriggers = [...triggers];
    newTriggers.splice(index, 1);
    setTriggers(newTriggers);
  };

  const updateTrigger = (index: number, updates: Partial<WorkflowTrigger>) => {
    const newTriggers = [...triggers];
    newTriggers[index] = { ...newTriggers[index], ...updates };
    setTriggers(newTriggers);
  };

  // --- Action Handlers ---
  const addAction = () => {
    setActions([
      ...actions,
      {
        actionType: "send_email",
        actionConfig: { to: "", subject: "", body: "" },
        executionOrder: actions.length,
        delayMinutes: 0,
        isActive: true,
      },
    ]);
  };

  const removeAction = (index: number) => {
    const newActions = [...actions];
    newActions.splice(index, 1);
    setActions(newActions);
  };

  const updateAction = (index: number, updates: Partial<WorkflowAction>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    setActions(newActions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
            <Zap className="h-10 w-10 animate-pulse mx-auto mb-4 text-indigo-500" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
       {/* Premium Sticky Header */}
       <div className="sticky top-0 z-20 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                    <Button 
                         variant="ghost" 
                         size="sm" 
                         className="-ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                         onClick={() => setLocation("/workflows")}
                    >
                         <ChevronLeft className="h-4 w-4 mr-1" />
                         Back
                    </Button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div>
                             <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                                 {isEditMode ? "Edit Workflow" : "New Workflow"}
                             </h1>
                             <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                {workflow.name || "Untitled Workflow"}
                             </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                     <div className="flex items-center gap-2 mr-4">
                         <span className="text-xs text-slate-500 font-medium">Status</span>
                         <Badge variant={workflow.status === 'active' ? 'default' : 'outline'} className={cn(workflow.status === 'active' && 'bg-green-600 hover:bg-green-700 border-transparent')}>
                             {workflow.status.toUpperCase()}
                         </Badge>
                     </div>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px] shadow-lg shadow-indigo-500/20"
                    >
                        {saving ? (
                            <Zap className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save
                    </Button>
                </div>
            </div>
        </div>
      </div>

       <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-center">
                <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl h-auto shadow-sm">
                    <TabsTrigger value="general" className="px-6 py-2.5 rounded-lg text-xs font-medium gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-400">
                        <Settings className="h-4 w-4" />
                        General Info
                    </TabsTrigger>
                    <TabsTrigger value="triggers" className="px-6 py-2.5 rounded-lg text-xs font-medium gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-400">
                        <MousePointerClick className="h-4 w-4" />
                        Triggers ({triggers.length})
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="px-6 py-2.5 rounded-lg text-xs font-medium gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-400">
                        <ListChecks className="h-4 w-4" />
                        Actions ({actions.length})
                    </TabsTrigger>
                </TabsList>
            </div>

            <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.3 }}
                 className="max-w-4xl mx-auto"
            >
                <TabsContent value="general" className="mt-0 space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Basic Configuration</CardTitle>
                            <CardDescription>Define the core properties of this automation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Workflow Name</Label>
                                    <Input 
                                        placeholder="e.g. High Value Quote Approval" 
                                        value={workflow.name}
                                        onChange={(e) => setWorkflow({...workflow, name: e.target.value})}
                                        className="font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Entity</Label>
                                    <Select 
                                        value={workflow.entityType} 
                                        onValueChange={(val) => setWorkflow({...workflow, entityType: val})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="quote">Quote</SelectItem>
                                            <SelectItem value="invoice">Invoice</SelectItem>
                                            <SelectItem value="client">Client</SelectItem>
                                            <SelectItem value="vendor_po">Vendor PO</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                    placeholder="Describe what this workflow does..." 
                                    value={workflow.description}
                                    onChange={(e) => setWorkflow({...workflow, description: e.target.value})}
                                    rows={3}
                                    className="resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Active Status</Label>
                                    <p className="text-xs text-slate-500">Enable or disable this workflow immediately</p>
                                </div>
                                <Switch 
                                    checked={workflow.status === 'active'}
                                    onCheckedChange={(checked) => setWorkflow({...workflow, status: checked ? 'active' : 'inactive'})}
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={() => setActiveTab("triggers")} className="group">
                                    Next: Configure Triggers
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="triggers" className="mt-0 space-y-6">
                     <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Trigger Conditions</CardTitle>
                                <CardDescription>When should this workflow run?</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={addTrigger}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Trigger
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {triggers.map((trigger, index) => (
                                <div key={index} className="relative p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 group">
                                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50" onClick={() => removeTrigger(index)}>
                                             <Trash2 className="h-4 w-4" />
                                         </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-8">
                                        <div className="space-y-2">
                                            <Label>Trigger Event</Label>
                                            <Select 
                                                value={trigger.triggerType} 
                                                onValueChange={(val) => updateTrigger(index, { triggerType: val })}
                                            >
                                                <SelectTrigger className="bg-white dark:bg-slate-950">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="status_change">Status Changes</SelectItem>
                                                    <SelectItem value="field_update">Field Update</SelectItem>
                                                    <SelectItem value="created">Entity Created</SelectItem>
                                                    <SelectItem value="amount_threshold">Amount Threshold</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Target Condition</Label>
                                            <div className="flex gap-2">
                                                <Input 
                                                    placeholder="Field" 
                                                    value={trigger.conditions.field || ""}
                                                    onChange={(e) => updateTrigger(index, { 
                                                        conditions: { ...trigger.conditions, field: e.target.value } 
                                                    })}
                                                    className="bg-white dark:bg-slate-950"
                                                />
                                                <div className="flex items-center text-slate-400">
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                                <Input 
                                                     placeholder="Value" 
                                                     value={trigger.conditions.to || trigger.conditions.value || ""}
                                                     onChange={(e) => updateTrigger(index, { 
                                                        conditions: { ...trigger.conditions, to: e.target.value } 
                                                     })}
                                                     className="bg-white dark:bg-slate-950"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {triggers.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-sm text-slate-500">No triggers defined. This workflow will never run.</p>
                                    <Button variant="link" onClick={addTrigger}>Add your first trigger</Button>
                                </div>
                            )}

                             <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={() => setActiveTab("general")}>
                                     <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button onClick={() => setActiveTab("actions")} className="group">
                                    Next: Define Actions
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="actions" className="mt-0 space-y-6">
                     <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Automated Actions</CardTitle>
                                <CardDescription>What should happen when triggers match?</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={addAction}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Action
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {actions.map((action, index) => (
                                <div key={index} className="relative flex gap-4">
                                    <div className="flex flex-col items-center">
                                         <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-slate-950 z-10">
                                             {index + 1}
                                         </div>
                                         {index !== actions.length - 1 && (
                                             <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 my-1" />
                                         )}
                                    </div>
                                    
                                    <div className="flex-1 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 group mb-2">
                                        <div className="absolute right-0 top-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50" onClick={() => removeAction(index)}>
                                                 <Trash2 className="h-4 w-4" />
                                             </Button>
                                        </div>

                                        <div className="grid gap-4 max-w-2xl">
                                             <div className="space-y-2">
                                                <Label>Action Type</Label>
                                                <Select 
                                                    value={action.actionType} 
                                                    onValueChange={(val) => updateAction(index, { actionType: val })}
                                                >
                                                    <SelectTrigger className="bg-white dark:bg-slate-950 w-full sm:w-[300px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="send_email">Send Email</SelectItem>
                                                        <SelectItem value="create_notification">In-App Notification</SelectItem>
                                                        <SelectItem value="update_field">Update Field</SelectItem>
                                                        <SelectItem value="assign_user">Assign User</SelectItem>
                                                        <SelectItem value="webhook">Call Webhook</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Dynamic Config Fields based on Action Type */}
                                            {action.actionType === 'send_email' && (
                                                <div className="space-y-4 pt-2">
                                                     <Input 
                                                        placeholder="To: {{client_email}}" 
                                                        value={action.actionConfig.to || ""}
                                                        onChange={(e) => updateAction(index, { 
                                                            actionConfig: { ...action.actionConfig, to: e.target.value } 
                                                        })}
                                                        className="bg-white dark:bg-slate-950 font-mono text-xs"
                                                     />
                                                     <Input 
                                                        placeholder="Subject Line" 
                                                        value={action.actionConfig.subject || ""}
                                                        onChange={(e) => updateAction(index, { 
                                                            actionConfig: { ...action.actionConfig, subject: e.target.value } 
                                                        })}
                                                        className="bg-white dark:bg-slate-950"
                                                     />
                                                     <Textarea 
                                                        placeholder="Email body content..." 
                                                        value={action.actionConfig.body || ""}
                                                        onChange={(e) => updateAction(index, { 
                                                            actionConfig: { ...action.actionConfig, body: e.target.value } 
                                                        })}
                                                        className="bg-white dark:bg-slate-950 min-h-[100px]"
                                                     />
                                                     <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                                         <Info className="h-3 w-3" />
                                                         You can use variables like {'{{client_name}}'}, {'{{quote_number}}'}
                                                     </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                             {actions.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl ml-12">
                                    <p className="text-sm text-slate-500">No actions defined.</p>
                                </div>
                            )}

                            <div className="flex justify-between pt-4 pl-12">
                                <Button variant="ghost" onClick={() => setActiveTab("triggers")}>
                                     <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Workflow
                                </Button>
                            </div>
                        </CardContent>
                     </Card>
                </TabsContent>
            </motion.div>
        </Tabs>
      </div>
    </div>
  );
}

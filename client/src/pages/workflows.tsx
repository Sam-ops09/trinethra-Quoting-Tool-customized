
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Play,
  Edit,
  Trash2,
  Activity,
  Clock,
  AlertCircle,
  Home,
  ChevronRight,
  Shield,
  Zap,
  CheckCircle2,
  FileText,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  entityType: string;
  status: "active" | "inactive" | "draft";
  priority: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    filterWorkflows();
  }, [workflows, entityFilter, statusFilter]);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/api/workflows", {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch workflows");

      const data = await response.json();
      setWorkflows(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWorkflows = () => {
    let filtered = workflows;

    if (entityFilter !== "all") {
      filtered = filtered.filter((w) => w.entityType === entityFilter);
    }

    if (statusFilter !== "all" && statusFilter !== "active_tab") {
       // statusFilter logic handled by tabs mainly, but kept here for strict filters if needed
       if(statusFilter === 'active' || statusFilter === 'inactive' || statusFilter === 'draft') {
         filtered = filtered.filter((w) => w.status === statusFilter);
       }
    }

    setFilteredWorkflows(filtered);
  };

  const toggleWorkflowStatus = async (workflowId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active";
    
    try {
      const response = await fetch(`/api/workflows/${workflowId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !newStatus }),
      });

      if (!response.ok) throw new Error("Failed to toggle workflow");

      toast({
        title: "Success",
        description: `Workflow ${!newStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchWorkflows();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle workflow",
        variant: "destructive",
      });
    }
  };

  const deleteWorkflow = async (workflowId: string, workflowName: string) => {
    if (!confirm(`Are you sure you want to delete workflow "${workflowName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete workflow");

      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });

      fetchWorkflows();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete workflow",
        variant: "destructive",
      });
    }
  };

  const entityTypes = Array.from(new Set(workflows.map((w) => w.entityType)));

  const getEntityTypeLabel = (entityType: string) => {
    return entityType.charAt(0).toUpperCase() + entityType.slice(1).replace(/_/g, " ");
  };

  const stats = {
      total: workflows.length,
      active: workflows.filter(w => w.status === 'active').length,
      draft: workflows.filter(w => w.status === 'draft').length,
      system: workflows.filter(w => w.isSystem).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Clock className="h-10 w-10 animate-spin mx-auto mb-4 text-indigo-500" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading workflows...</p>
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
                    <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                         {/* Breadcrumbs */}
                         <nav className="flex items-center gap-2 mb-1">
                            <button 
                                onClick={() => setLocation("/")}
                                className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                Home
                            </button>
                            <ChevronRight className="h-3 w-3 text-slate-400" />
                            <span className="text-[11px] font-medium text-slate-500">Admin</span>
                            <ChevronRight className="h-3 w-3 text-slate-400" />
                            <span className="text-[11px] font-semibold text-slate-900 dark:text-white">Workflows</span>
                        </nav>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                            Workflow Automation
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setLocation("/workflows/create")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Workflow
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard 
                icon={Zap} 
                label="Total Workflows" 
                value={stats.total} 
                color="indigo" 
            />
            <StatCard 
                icon={Play} 
                label="Active" 
                value={stats.active} 
                color="green" 
            />
            <StatCard 
                icon={FileText} 
                label="Drafts" 
                value={stats.draft} 
                color="amber" 
            />
            <StatCard 
                icon={Shield} 
                label="System Defined" 
                value={stats.system} 
                color="purple" 
            />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col gap-6">
             {/* Toolbar */}
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1">
                <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(val) => {
                    if(val === 'all') setStatusFilter('all');
                    if(val === 'active') setStatusFilter('active');
                    if(val === 'drafts') setStatusFilter('draft');
                }}>
                    <TabsList className="bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-lg h-auto">
                        <TabsTrigger value="all" className="text-xs px-3 py-1.5 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800">All Workflows</TabsTrigger>
                        <TabsTrigger value="active" className="text-xs px-3 py-1.5 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800">Active</TabsTrigger>
                        <TabsTrigger value="drafts" className="text-xs px-3 py-1.5 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800">Drafts</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                     <div className="relative flex-1 sm:w-64">
                         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                         <input 
                            type="text"
                            placeholder="Search workflows..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                         />
                     </div>
                     <Select value={entityFilter} onValueChange={setEntityFilter}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                             <Filter className="w-3.5 h-3.5 mr-2 text-slate-500" />
                            <SelectValue placeholder="Filter by Entity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Entities</SelectItem>
                            {entityTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {getEntityTypeLabel(type)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                </div>
             </div>

             {/* Workflow Grid */}
             {filteredWorkflows.length === 0 ? (
                <EmptyState onAction={() => setLocation("/workflows/create")} />
             ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence>
                        {filteredWorkflows.map((workflow) => (
                            <WorkflowCard 
                                key={workflow.id} 
                                workflow={workflow} 
                                onDelete={deleteWorkflow}
                                onToggle={toggleWorkflowStatus}
                                onEdit={(id) => setLocation(`/workflows/${id}`)}
                                onViewHistory={(id) => setLocation(`/workflows/${id}/executions`)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
             )}
        </div>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
        green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", colors[color as keyof typeof colors])}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}

interface WorkflowCardProps {
  workflow: Workflow;
  onDelete: (id: string, name: string) => void;
  onToggle: (id: string, status: string) => void;
  onEdit: (id: string) => void;
  onViewHistory: (id: string) => void;
}

function WorkflowCard({ workflow, onDelete, onToggle, onEdit, onViewHistory }: WorkflowCardProps) {
    const getEntityTypeLabel = (entityType: string) => 
        entityType.charAt(0).toUpperCase() + entityType.slice(1).replace(/_/g, " ");

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
            
            <div className="p-5 pl-7 space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                                {workflow.name}
                            </h3>
                            {workflow.isSystem && (
                                <Shield className="h-3.5 w-3.5 text-indigo-500" />
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5em]">
                            {workflow.description || "No description provided."}
                        </p>
                    </div>
                    <Switch
                        checked={workflow.status === "active"}
                        onCheckedChange={() => onToggle(workflow.id, workflow.status)}
                        disabled={workflow.isSystem}
                         className="data-[state=checked]:bg-indigo-500"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                     <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-normal text-[10px]">
                        {getEntityTypeLabel(workflow.entityType)}
                     </Badge>
                     {workflow.status === 'active' ? (
                         <Badge  className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 font-normal text-[10px] hover:bg-green-100">
                             Active
                         </Badge>
                     ) : (
                         <Badge variant="outline" className="text-slate-500 font-normal text-[10px]">
                             {workflow.status}
                         </Badge>
                     )}
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => onEdit(workflow.id)}>
                            <Edit className="w-3.5 h-3.5" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-purple-600 hover:bg-purple-50" onClick={() => onViewHistory(workflow.id)}>
                            <Activity className="w-3.5 h-3.5" />
                         </Button>
                         {!workflow.isSystem && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(workflow.id, workflow.name)}>
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                         )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function EmptyState({ onAction }: { onAction: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No workflows found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm text-center mb-6">
                Get started by creating your first automated workflow to streamline your business processes.
            </p>
            <Button onClick={onAction} variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                Create New Workflow
            </Button>
        </div>
    );
}

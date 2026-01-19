import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Plus, Eye, Trash2, Edit, RefreshCw, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
    id: string;
    name: string;
    type: string;
    subject: string;
    body: string;
    availableVariables: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: string;
}

interface TemplateType {
    type: string;
    variables: { name: string; description: string }[];
    defaultTemplate: { subject: string; body: string };
}

const TYPE_LABELS: Record<string, string> = {
    quote: "Quote Email",
    invoice: "Invoice Email",
    sales_order: "Sales Order Email",
    payment_reminder: "Payment Reminder",
    password_reset: "Password Reset",
    welcome: "Welcome Email",
};

export function EmailTemplateSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [previewHtml, setPreviewHtml] = useState<{ subject: string; body: string } | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        type: "quote",
        subject: "",
        body: "",
        isActive: true,
        isDefault: false,
    });

    // Fetch templates
    const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
        queryKey: ["/api/email-templates"],
    });

    // Fetch template types
    const { data: templateTypes } = useQuery<TemplateType[]>({
        queryKey: ["/api/email-templates/types"],
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/email-templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
            setIsCreateOpen(false);
            resetForm();
            toast({ title: "Template created successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (data: { id: string } & typeof formData) => {
            const { id, ...body } = data;
            const res = await fetch(`/api/email-templates/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
            setEditingTemplate(null);
            resetForm();
            toast({ title: "Template updated successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/email-templates/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
            toast({ title: "Template deleted" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    // Seed defaults mutation
    const seedMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/email-templates/seed-defaults", {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
            toast({ title: "Default templates created" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    // Preview mutation
    const previewMutation = useMutation({
        mutationFn: async (data: { subject: string; body: string; type: string }) => {
            const res = await fetch("/api/email-templates/preview-draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: (data) => {
            setPreviewHtml({ subject: data.subject, body: data.body });
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            type: "quote",
            subject: "",
            body: "",
            isActive: true,
            isDefault: false,
        });
    };

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            type: template.type,
            subject: template.subject,
            body: template.body,
            isActive: template.isActive,
            isDefault: template.isDefault,
        });
    };

    const handleSubmit = () => {
        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, ...formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handlePreview = () => {
        previewMutation.mutate({
            subject: formData.subject,
            body: formData.body,
            type: formData.type,
        });
    };

    const getCurrentVariables = () => {
        const typeInfo = templateTypes?.find((t) => t.type === formData.type);
        return typeInfo?.variables || [];
    };

    const insertVariable = (varName: string) => {
        const newBody = formData.body + `{{${varName}}}`;
        setFormData({ ...formData, body: newBody });
    };

    const loadDefaultTemplate = () => {
        const typeInfo = templateTypes?.find((t) => t.type === formData.type);
        if (typeInfo?.defaultTemplate) {
            setFormData({
                ...formData,
                subject: typeInfo.defaultTemplate.subject,
                body: typeInfo.defaultTemplate.body,
            });
        }
    };

    return (
        <Card className="card-elegant hover-glow">
            <CardHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-purple-500/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg">Email Templates</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Configure email content with dynamic variables
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => seedMutation.mutate()}
                            disabled={seedMutation.isPending}
                        >
                            {seedMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline ml-2">Seed Defaults</span>
                        </Button>
                        <Dialog open={isCreateOpen || !!editingTemplate} onOpenChange={(open) => {
                            if (!open) {
                                setIsCreateOpen(false);
                                setEditingTemplate(null);
                                resetForm();
                                setPreviewHtml(null);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button onClick={() => { setIsCreateOpen(true); resetForm(); }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Template
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingTemplate ? "Edit Template" : "Create Email Template"}
                                    </DialogTitle>
                                </DialogHeader>
                                <Tabs defaultValue="editor" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="editor">Editor</TabsTrigger>
                                        <TabsTrigger value="preview">Preview</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="editor" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Template Name</Label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g., Professional Quote Email"
                                                />
                                            </div>
                                            <div>
                                                <Label>Template Type</Label>
                                                <Select
                                                    value={formData.type}
                                                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                                                    disabled={!!editingTemplate}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <Label>Email Subject</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={loadDefaultTemplate}
                                                    className="text-xs"
                                                >
                                                    <Code className="h-3 w-3 mr-1" />
                                                    Load Default
                                                </Button>
                                            </div>
                                            <Input
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                placeholder="Quote {{quote_number}} from {{company_name}}"
                                            />
                                        </div>
                                        <div>
                                            <Label>Email Body (HTML)</Label>
                                            <Textarea
                                                value={formData.body}
                                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                                placeholder="<p>Dear {{client_name}},</p>..."
                                                className="min-h-[200px] font-mono text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Available Variables</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {getCurrentVariables().map((v) => (
                                                    <Button
                                                        key={v.name}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs"
                                                        onClick={() => insertVariable(v.name)}
                                                        title={v.description}
                                                    >
                                                        {`{{${v.name}}}`}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <span className="text-sm">Active</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isDefault}
                                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                                />
                                                <span className="text-sm">Set as Default</span>
                                            </label>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="preview" className="space-y-4">
                                        <Button variant="outline" onClick={handlePreview} disabled={previewMutation.isPending}>
                                            {previewMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Eye className="h-4 w-4 mr-2" />
                                            )}
                                            Generate Preview
                                        </Button>
                                        {previewHtml && (
                                            <div className="border rounded-lg p-4 bg-white">
                                                <div className="font-semibold mb-2 text-sm text-muted-foreground">
                                                    Subject: {previewHtml.subject}
                                                </div>
                                                <div
                                                    className="prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: previewHtml.body }}
                                                />
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                                <DialogFooter>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={createMutation.isPending || updateMutation.isPending || !formData.name || !formData.subject || !formData.body}
                                    >
                                        {(createMutation.isPending || updateMutation.isPending) && (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        )}
                                        {editingTemplate ? "Update Template" : "Create Template"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Default</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : !templates?.length ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No templates configured. Click "Seed Defaults" to create default templates.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                templates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">{template.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{TYPE_LABELS[template.type] || template.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={template.isActive ? "default" : "secondary"}>
                                                {template.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {template.isDefault && <Badge variant="outline">Default</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(template)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteMutation.mutate(template.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

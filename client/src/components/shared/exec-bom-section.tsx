import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, Upload, ClipboardPaste, Check, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { ExecBOMData, ExecBOMBlock, ExecBOMSection as IBOMSection, ExecBOMItemRow } from '@/types/bom-types';
import { parseExcelToBOM, parseTextToBOM } from '@/lib/bom-parser';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ExecBOMSectionProps {
  value: ExecBOMData;
  onChange: (data: ExecBOMData) => void;
  readonly?: boolean;
}

export function ExecBOMSection({ value, onChange, readonly = false }: ExecBOMSectionProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteContent, setPasteContent] = useState('');
  const [previewData, setPreviewData] = useState<ExecBOMData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await parseExcelToBOM(file);
        setPreviewData(data);
        setIsPreviewOpen(true);
        toast({
          title: "Success",
          description: "Excel file parsed successfully.",
        });
      } catch (err) {
        console.error("Failed to parse Excel", err);
        toast({
          title: "Error",
          description: "Failed to parse Excel file. Please check the format.",
          variant: "destructive",
        });
      }
      // Reset input value to allow re-uploading same file
      e.target.value = '';
    }
  };

  const handlePasteParse = () => {
    if (!pasteContent.trim()) return;
    const data = parseTextToBOM(pasteContent);
    setPreviewData(data);
    setIsPreviewOpen(true);
    toast({
      title: "Success",
      description: "Text data parsed successfully.",
    });
  };

  const togglePreviewItem = (blockId: string, sectionId: string, itemId: string) => {
    if (!previewData) return;
    const newBlocks = previewData.blocks.map(block => {
      if (block.id !== blockId) return block;
      return {
        ...block,
        sections: block.sections.map(section => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.map(item => {
              if (item.id !== itemId) return item;
              return { ...item, selected: !item.selected };
            })
          };
        })
      };
    });
    setPreviewData({ blocks: newBlocks });
  };

  const confirmImport = () => {
    if (previewData) {
      // Filter out items that are not selected before merging
      const filteredBlocks = previewData.blocks.map(block => ({
        ...block,
        sections: block.sections.map(section => ({
          ...section,
          items: section.items.filter(item => item.selected)
        })).filter(section => section.items.length > 0)
      })).filter(block => block.sections.length > 0);

      const newBlocks = [...(value.blocks || []), ...filteredBlocks];
      onChange({ blocks: newBlocks });
      setPreviewData(null);
      setIsPreviewOpen(false);
      setPasteContent('');
    }
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear the entire BOM?')) {
      onChange({ blocks: [] });
    }
  };

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  const toggleAllItems = (checked: boolean) => {
    if (!previewData) return;
    const newBlocks = previewData.blocks.map(block => ({
      ...block,
      sections: block.sections.map(section => ({
        ...section,
        items: section.items.map(item => ({ ...item, selected: checked }))
      }))
    }));
    setPreviewData({ blocks: newBlocks });
  };

  const removeItem = (blockId: string, sectionId: string, itemId: string) => {
    const newBlocks = value.blocks.map(block => {
      if (block.id !== blockId) return block;
      return {
        ...block,
        sections: block.sections.map(section => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.filter(item => item.id !== itemId)
          };
        }).filter(section => section.items.length > 0)
      };
    }).filter(block => block.sections.length > 0);
    onChange({ blocks: newBlocks });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Bill of Materials (BOM)
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage structured BOM data from Excel or manual entry.
          </p>
        </div>
        
        {!readonly && (
          <div className="flex items-center gap-2">
            {(value.blocks && value.blocks.length > 0) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll} 
                className="text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/40 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear BOM
              </Button>
            )}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary/90 hover:bg-primary shadow-sm active:scale-[0.98] transition-all"
                  onClick={() => setPasteContent('')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden p-0 gap-0 border-none sm:rounded-2xl shadow-2xl">
                <div className="p-6 border-b bg-muted/30 flex-none bg-gradient-to-r from-background to-muted/20">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Import BOM Data</DialogTitle>
                  </DialogHeader>
                </div>
                
                <div className="flex-1 flex flex-col p-6 overflow-hidden gap-6 bg-background">
                  <Tabs defaultValue="upload" className={cn(
                    "flex flex-col overflow-hidden transition-all flex-none border rounded-xl",
                    previewData ? "h-[200px]" : "h-[320px]"
                  )}>
                    <div className="px-4 pt-4 pb-0 bg-muted/5 flex-none">
                      <TabsList className="bg-muted/50 p-1 rounded-lg">
                        <TabsTrigger value="upload" className="flex gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"><Upload className="h-4 w-4"/> Upload Excel</TabsTrigger>
                        <TabsTrigger value="paste" className="flex gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"><ClipboardPaste className="h-4 w-4"/> Paste Data</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <div className="flex-1 overflow-hidden p-4">
                      <TabsContent value="upload" className="mt-0 h-full border-none shadow-none p-0 outline-none">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary/50', 'bg-primary/5'); }}
                          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary/50', 'bg-primary/5'); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-primary/50', 'bg-primary/5');
                            const file = e.dataTransfer.files?.[0];
                            if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                               handleFileUpload({ target: { files: [file] } } as any);
                            }
                          }}
                          className="relative group flex flex-col items-center justify-center h-full border-2 border-dashed rounded-xl bg-muted/5 border-muted-foreground/20 transition-all duration-300 gap-3 cursor-pointer"
                        >
                          <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                            <Upload className="h-6 w-6" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="font-semibold text-sm">Click to upload or drag and drop</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">Excel files (.xlsx, .xls)</p>
                          </div>
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".xlsx, .xls"
                            className="hidden" 
                            onChange={handleFileUpload}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="paste" className="mt-0 h-full flex flex-col gap-4 border-none shadow-none p-0 outline-none">
                        <Textarea 
                          placeholder="Paste your BOM table here..." 
                          className="flex-1 min-h-[120px] font-mono text-sm border-muted-foreground/20 bg-muted/5 focus-visible:ring-primary/20 resize-none"
                          value={pasteContent}
                          onChange={(e) => setPasteContent(e.target.value)}
                        />
                        <Button onClick={handlePasteParse} disabled={!pasteContent.trim()} className="self-end px-8">
                          Preview Parsed Data
                        </Button>
                      </TabsContent>
                    </div>
                  </Tabs>

                {previewData && (
                  <div className="flex-1 border rounded-xl overflow-hidden flex flex-col min-h-0 shadow-sm border-muted-foreground/10 bg-muted/5">
                    <div className="bg-muted/40 px-5 py-3 border-b flex items-center justify-between flex-none backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Import Preview</span>
                        </div>
                        <div className="h-4 w-[1px] bg-muted-foreground/20" />
                        <label className="flex items-center gap-2 cursor-pointer group/all">
                          <Checkbox 
                            checked={previewData.blocks.every(b => b.sections.every(s => s.items.every(i => i.selected)))}
                            onCheckedChange={(checked) => toggleAllItems(!!checked)}
                            className="h-3.5 w-3.5 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className="text-[10px] font-bold text-muted-foreground group-hover/all:text-foreground transition-colors uppercase tracking-tight">Select All</span>
                        </label>
                      </div>
                      <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                        {previewData.blocks.length} Block{previewData.blocks.length !== 1 ? 's' : ''} Identified
                      </span>
                    </div>
                    <ScrollArea className="flex-1 min-h-0 bg-background/50">
                      <div className="p-6 space-y-8">
                        {previewData.blocks.map(block => (
                          <div key={block.id} className="space-y-4">
                             <div className="flex items-center gap-3">
                               <div className="h-8 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                               <h5 className="font-extrabold text-base tracking-tight">{block.title}</h5>
                             </div>
                             {block.sections.map(section => (
                               <div key={section.id} className="pl-4 space-y-3">
                                 <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                   <ChevronRight className="h-3 w-3" />
                                   {section.label}
                                 </div>
                                 <div className="rounded-lg border bg-background/80 overflow-hidden shadow-sm">
                                   <Table>
                                     <TableHeader className="bg-muted/30">
                                       <TableRow className="h-10 hover:bg-transparent">
                                         <TableHead className="w-[50px] text-center"></TableHead>
                                         <TableHead className="text-[11px] font-bold uppercase tracking-wider">Module</TableHead>
                                         <TableHead className="text-[11px] font-bold uppercase tracking-wider">Description</TableHead>
                                         <TableHead className="text-[11px] font-bold uppercase tracking-wider text-right pr-6">Qty</TableHead>
                                       </TableRow>
                                     </TableHeader>
                                     <TableBody>
                                        {section.items.map(item => (
                                          <TableRow key={item.id} className="h-11 hover:bg-primary/5 transition-colors group">
                                            <TableCell className="text-center">
                                              <Checkbox 
                                                checked={item.selected} 
                                                onCheckedChange={() => togglePreviewItem(block.id, section.id, item.id)}
                                                className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                              />
                                            </TableCell>
                                            <TableCell className="text-xs font-semibold">{item.module}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground line-clamp-1">{item.description}</TableCell>
                                            <TableCell className="text-xs text-right pr-6 font-mono font-bold text-primary">{item.qty}</TableCell>
                                          </TableRow>
                                        ))}
                                     </TableBody>
                                   </Table>
                                 </div>
                               </div>
                             ))}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-muted/20 flex-none bg-gradient-to-l from-background to-muted/10">
                <DialogFooter className="gap-2 sm:gap-0">
                   <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="hover:bg-background">Cancel</Button>
                   <Button 
                    onClick={confirmImport} 
                    disabled={!previewData}
                    className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all rounded-lg active:scale-95"
                   >
                     Import to BOM
                   </Button>
                </DialogFooter>
              </div>
              </DialogContent>
             </Dialog>
          </div>
        )}
      </div>

      {/* Main Display Area */}
      <div className="border rounded-2xl bg-card text-card-foreground shadow-xl overflow-hidden border-muted-foreground/10 bg-gradient-to-b from-background to-muted/5">
        <ScrollArea className={cn(
          "w-full",
          (value.blocks?.length || 0) > 0 ? "h-[650px]" : "h-auto"
        )}>
          {(!value.blocks || value.blocks.length === 0) ? (
             <div 
               onClick={() => setIsPreviewOpen(true)}
               className="flex flex-col items-center justify-center p-24 text-muted-foreground animate-in fade-in zoom-in duration-500 cursor-pointer group hover:bg-primary/5 transition-all"
             >
               <div className="p-8 rounded-full bg-muted/20 mb-6 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 shadow-inner">
                 <FileSpreadsheet className="h-16 w-16 opacity-40 group-hover:opacity-100" />
               </div>
               <h4 className="text-2xl font-black text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">Start Your BOM</h4>
               {!readonly && (
                 <p className="text-sm text-center max-w-[300px] font-medium leading-relaxed opacity-60">
                   Click here to <span className="text-primary font-bold">Import from Excel</span> or paste your data content.
                 </p>
               )}
             </div>
          ) : (
            <div className="divide-y divide-muted-foreground/10">
              {value.blocks.map((block) => {
                const matchesSearch = true; // Placeholder for search filter
                if (!matchesSearch) return null;
                
                const isExpanded = expandedBlocks[block.id] ?? true; 

                return (
                  <div key={block.id} className="bg-background/40 backdrop-blur-sm transition-all duration-300">
                    {/* Block Header */}
                    <div 
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 cursor-pointer select-none group transition-colors"
                      onClick={() => toggleBlock(block.id)}
                    >
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-extrabold text-sm tracking-tight text-foreground/90 uppercase">{block.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                          {block.sections.length} Section{block.sections.length !== 1 ? 's' : ''} • {block.sections.reduce((acc, s) => acc + s.items.length, 0)} Items
                        </p>
                      </div>
                    </div>

                    {/* Sections */}
                    {isExpanded && (
                      <div className="px-4 pb-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                        {block.sections.map((section) => (
                          <div key={section.id} className="space-y-3 pl-4 border-l-2 border-primary/20">
                             <div className="flex items-center justify-between group/sec">
                               <div className="text-[10px] font-black text-primary/70 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <span className="h-1 w-3 bg-primary/40 rounded-full" />
                                  {section.label}
                               </div>
                               <span className="text-[9px] font-bold text-muted-foreground opacity-0 group-hover/sec:opacity-100 transition-opacity whitespace-nowrap bg-muted/30 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                 {section.items.length} SKUs
                               </span>
                             </div>
                             <div className="rounded-xl border bg-card/50 shadow-sm overflow-hidden">
                               <Table>
                                 <TableHeader className="bg-muted/40 backdrop-blur-md">
                                   <TableRow className="h-10 hover:bg-transparent border-b-muted-foreground/10">
                                     <TableHead className="w-[180px] text-[10px] font-black uppercase tracking-wider h-10">Module</TableHead>
                                     <TableHead className="text-[10px] font-black uppercase tracking-wider h-10">Description</TableHead>
                                     <TableHead className="w-[90px] text-right text-[10px] font-black uppercase tracking-wider h-10 pr-6">Qty</TableHead>
                                     {!readonly && <TableHead className="w-[50px] h-10"></TableHead>}
                                   </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                    {section.items.map((item) => (
                                      <TableRow key={item.id} className="group/row h-11 hover:bg-primary/5 border-b-muted-foreground/5 last:border-0 transition-colors">
                                        <TableCell className="py-2 text-xs font-bold text-foreground/80">{item.module}</TableCell>
                                        <TableCell className="py-2 text-xs text-muted-foreground font-medium">{item.description}</TableCell>
                                        <TableCell className="py-2 text-xs text-right font-black text-primary pr-6">{item.qty}</TableCell>
                                        {!readonly && (
                                          <TableCell className="py-2 text-right pr-2">
                                             <Button 
                                               variant="ghost" 
                                               size="icon" 
                                               className="h-7 w-7 rounded-lg opacity-0 group-hover/row:opacity-100 group-hover/row:bg-destructive/10 transition-all hover:scale-110"
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 removeItem(block.id, section.id, item.id);
                                               }}
                                             >
                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                             </Button>
                                          </TableCell>
                                        )}
                                      </TableRow>
                                    ))}
                                 </TableBody>
                               </Table>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

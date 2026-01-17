// BOM Types for Exec Excel Format
export interface ExecBOMItemRow {
  type: 'item';
  id: string;
  module: string;
  description: string;
  qty: number;
  selected: boolean;
}

export interface ExecBOMSection {
  id: string;
  label: string;
  items: ExecBOMItemRow[];
}

export interface ExecBOMBlock {
  id: string; // Unique ID for the block
  title: string; // Title from the Excel/Source
  sections: ExecBOMSection[];
}

export interface ExecBOMData {
  blocks: ExecBOMBlock[];
}

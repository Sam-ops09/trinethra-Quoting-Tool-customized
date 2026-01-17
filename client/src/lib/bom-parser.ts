import { read, utils } from 'xlsx';
import { ExecBOMBlock, ExecBOMData, ExecBOMItemRow, ExecBOMSection } from '../types/bom-types';
import { nanoid } from 'nanoid';

export async function parseExcelToBOM(file: File): Promise<ExecBOMData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = read(arrayBuffer);
  // Assume first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = utils.sheet_to_json(worksheet, { header: 1 }); // Array of arrays

  return parseRawDataToBOM(jsonData as any[][]);
}

export function parseTextToBOM(text: string): ExecBOMData {
  // Simple TSV/CSV parser for copy-paste
  const rows = text.split('\n').map(row => row.split('\t'));
  return parseRawDataToBOM(rows);
}

function parseRawDataToBOM(rows: any[][]): ExecBOMData {
  const blocks: ExecBOMBlock[] = [];
  let currentBlock: ExecBOMBlock | null = null;
  let currentSection: ExecBOMSection | null = null;

  // Heuristic: 
  // - If row has only 1st column => Block Header or Section Header?
  // - Let's assume a structure or try to infer.
  // - Stronger heuristic:
  //   - Indentation or specific keywords?
  //   - Let's assume a standard indented format often used in BOMs:
  //     Row 1: Block Title
  //       Row 2: Section Title
  //         Row 3: Item...
  
  // Alternative for robustness without strict indentation relying on columns:
  // - Block: Column 0 has text, others empty.
  // - Section: Column 0/1 has text.
  // - Item: Multiple columns (Module, Description, Qty).

  // Refined Logic (based on user request for Block -> Section -> Item):
  // We will treat non-empty generic rows as hierarchy triggers.

  rows.forEach((row, index) => {
    // Skip completely empty rows
    if (row.length === 0 || row.every(c => !c)) return;

    const firstVal = row[0]?.toString().trim();
    const secondVal = row[1]?.toString().trim();
    const thirdVal = row[2]?.toString().trim();

    // Check if it looks like an item row (has data in multiple columns or specifically looks like [Module, Description, Qty])
    // Let's assume columns: [Module, Description, Qty] or similar.
    // If we have at least 3 columns with content, likely an item.
    const hasMultipleCols = row.filter(c => c && c.toString().trim().length > 0).length >= 2;

    // Check for Header Row (ignore case)
    const lowerFirst = firstVal?.toLowerCase() || '';
    const lowerSecond = secondVal?.toLowerCase() || '';
    const isHeaderRow = (lowerFirst.includes('module') || lowerFirst.includes('item')) && 
                        (lowerSecond.includes('description') || lowerSecond.includes('desc'));

    if (isHeaderRow) return;

    if (hasMultipleCols) {
        // It's an item
        const item: ExecBOMItemRow = {
            type: 'item',
            id: nanoid(),
            module: firstVal || '',
            description: secondVal || '',
            qty: parseFloat(thirdVal || '1') || 1,
            selected: true
        };

        if (!currentBlock) {
            currentBlock = { id: nanoid(), title: 'General Block', sections: [] };
            blocks.push(currentBlock);
        }
        if (!currentSection) {
            currentSection = { id: nanoid(), label: 'General Section', items: [] };
            currentBlock.sections.push(currentSection);
        }
        currentSection.items.push(item);
    } else {
        // It's likely a header (Block or Section)
        // If we just finished a section/block or it's the start
        // Simple logic: If we are effectively "indenting" via missing columns, handle it? 
        // Actually, often Block is in col 0, Section in col 0 under it? No, that's ambiguous.
        // Let's assume Block headers are purely text in Col 0.
        
        // If we have a current block but no section, this might be a section.
        // If we have a current section, this might start a new section OR a new block.
        
        // Let's assume:
        // - Uppercase or specific markers? No.
        
        // Strategy: 
        // If currentSection exists, close it and start new section?
        // Or if it looks "major", start new Block?
        
        // For simpler MVP: 
        // Treat every single-column row as a Section Header if inside a block.
        // If we are at top level (no block), it's a Block Header.

        const title = firstVal || row.find(c => c)?.toString().trim() || 'Untitled';
        
        // If we already have a block with sections, maybe this is a new block? 
        // Or just a new section in current block?
        // Let's bias towards new Section in current Block for now unless we can distinguish.
        
        if (!currentBlock) {
             currentBlock = { id: nanoid(), title: title, sections: [] };
             blocks.push(currentBlock);
             currentSection = null; // Reset section
        } else {
            // We have a block.
            // Create new section
            currentSection = { id: nanoid(), label: title, items: [] };
            currentBlock.sections.push(currentSection);
        }
    }
  });

  return { blocks };
}

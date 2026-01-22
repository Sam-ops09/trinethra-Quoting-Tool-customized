import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
// @ts-ignore
import SVGtoPDF from "svg-to-pdfkit";

export interface ResolvedLogo {
  logo: string | Buffer;
  mimeType: string;
}

export async function prepareLogo(logoInput?: string): Promise<ResolvedLogo> {
  // 1. Handle Base64 Data URI
  if (logoInput && logoInput.startsWith("data:image")) {
    try {
      const matches = logoInput.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = matches ? matches[1] : "unknown";
      const base64Data = logoInput.split(",")[1];
      if (base64Data) {
         // Cleanup
         const cleanBase64 = base64Data.replace(/\s/g, '');
         return { logo: Buffer.from(cleanBase64, "base64"), mimeType };
      }
    } catch (e) {
      console.error("Failed to parse logo base64:", e);
    }
  }

  // 2. Handle simple string path or URL (if provided as string but not data URI)
  if (logoInput && !logoInput.startsWith("data:")) {
      // It's a path or URL. If it's a local path, we return it.
      // We can try to guess mime type from extension
      const ext = path.extname(logoInput).toLowerCase().replace(".", "");
      let mime = "application/octet-stream";
      if (["png","jpg","jpeg"].includes(ext)) mime = `image/${ext}`;
      if (ext === "svg") mime = "image/svg+xml";
      return { logo: logoInput, mimeType: mime };
  }

  // 3. Fallback to defaults
  const p1 = path.join(process.cwd(), "client", "public", "AICERA_Logo.png");
  const p2 = path.join(process.cwd(), "client", "public", "logo.png");
  
  try {
     await fs.promises.access(p1, fs.constants.F_OK);
     return { logo: p1, mimeType: "image/png" };
  } catch {
     try {
        await fs.promises.access(p2, fs.constants.F_OK);
        return { logo: p2, mimeType: "image/png" };
     } catch {}
  }
  
  return { logo: "", mimeType: "" };
}

export function prepareLogoSync(logoInput?: string): ResolvedLogo {
  // 1. Handle Base64 Data URI
  if (logoInput && logoInput.startsWith("data:image")) {
    try {
      const matches = logoInput.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = matches ? matches[1] : "unknown";
      const base64Data = logoInput.split(",")[1];
      if (base64Data) {
         // Cleanup
         const cleanBase64 = base64Data.replace(/\s/g, '');
         return { logo: Buffer.from(cleanBase64, "base64"), mimeType };
      }
    } catch (e) {
      console.error("Failed to parse logo base64:", e);
    }
  }

  // 2. Handle simple string path or URL
  if (logoInput && !logoInput.startsWith("data:")) {
      const ext = path.extname(logoInput).toLowerCase().replace(".", "");
      let mime = "application/octet-stream";
      if (["png","jpg","jpeg"].includes(ext)) mime = `image/${ext}`;
      if (ext === "svg") mime = "image/svg+xml";
      return { logo: logoInput, mimeType: mime };
  }

  // 3. Fallback to defaults (Sync)
  const p1 = path.join(process.cwd(), "client", "public", "AICERA_Logo.png");
  const p2 = path.join(process.cwd(), "client", "public", "logo.png");
  
  if (fs.existsSync(p1)) return { logo: p1, mimeType: "image/png" };
  if (fs.existsSync(p2)) return { logo: p2, mimeType: "image/png" };
  
  return { logo: "", mimeType: "" };
}

export function drawLogo(
    doc: PDFKit.PDFDocument, 
    logo: string | Buffer, 
    mimeType: string, 
    x: number, 
    y: number, 
    size: number
): boolean {
    if (!logo) return false;

    try {
        const isBuffer = Buffer.isBuffer(logo);
        let isSVG = mimeType.includes("svg");
        
        // Hex check for Buffer if undetermined
        if (isBuffer && !isSVG) {
            const header = (logo as Buffer).subarray(0, 4).toString('hex').toUpperCase();
            if (header.includes("3C737667") || header.includes("3C3F786D")) {
                isSVG = true;
            }
        }
        
        // Path extension check
        if (!isBuffer && typeof logo === 'string' && !isSVG) {
             if (logo.toLowerCase().endsWith(".svg")) isSVG = true;
        }

        if (isSVG) {
            let svgString = "";
            if (isBuffer) {
                svgString = (logo as Buffer).toString('utf-8');
            } else if (typeof logo === 'string') {
                try {
                    svgString = fs.readFileSync(logo, 'utf-8');
                } catch (e) {
                    console.error("Failed to read SVG file:", e);
                    return false;
                }
            }
            
            if (svgString) {
                SVGtoPDF(doc, svgString, x, y, { 
                    width: size, 
                    height: size,
                    preserveAspectRatio: "xMinYMin meet" 
                });
                return true;
            }
        }
        
        // Default to Image
        doc.image(logo, x, y, { fit: [size, size] });
        return true;
    } catch (err) {
        console.error("Failed to draw logo:", err);
        return false;
    }
}

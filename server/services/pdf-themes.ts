// server/services/pdf-themes.ts
// PDF Theme Configuration for different client segments

export interface PDFTheme {
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    primaryLight: string;
    accent: string;
    accentLight: string;
    text: string;
    muted: string;
    border: string;
    bgSoft: string;
    bgAlt: string;
    success: string;
    warning: string;
  };
  fonts: {
    heading: string;
    body: string;
    bold: string;
  };
  styles: {
    headerStyle: 'wave' | 'gradient' | 'minimal' | 'corporate' | 'modern';
    borderRadius: number;
    shadowIntensity: 'none' | 'light' | 'medium' | 'strong';
    spacing: 'compact' | 'normal' | 'spacious';
  };
}

// Professional Theme - Default for corporate clients (ORIGINAL EXISTING THEME)
export const professionalTheme: PDFTheme = {
  name: 'professional',
  displayName: 'Professional',
  description: 'Classic corporate design with navy blue accents (original theme)',
  colors: {
    primary: '#0f172a',      // Original default PRIMARY
    primaryLight: '#1e293b', // Original default PRIMARY_LIGHT
    accent: '#3b82f6',       // Original default ACCENT
    accentLight: '#60a5fa',  // Original default ACCENT_LIGHT
    text: '#1e293b',         // Original default TEXT
    muted: '#64748b',        // Original default MUTED
    border: '#e2e8f0',       // Original default BORDER
    bgSoft: '#f8fafc',       // Original default BG_SOFT
    bgAlt: '#f1f5f9',        // Original default BG_ALT
    success: '#10b981',      // Original default SUCCESS
    warning: '#f59e0b',      // Original default WARNING
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    bold: 'Helvetica-Bold',
  },
  styles: {
    headerStyle: 'wave',
    borderRadius: 0,
    shadowIntensity: 'light',
    spacing: 'normal',
  },
};

// Modern Theme - For tech startups and innovative companies
export const modernTheme: PDFTheme = {
  name: 'modern',
  displayName: 'Modern',
  description: 'Contemporary design with vibrant colors and clean lines',
  colors: {
    primary: '#6366f1',
    primaryLight: '#818cf8',
    accent: '#ec4899',
    accentLight: '#f472b6',
    text: '#111827',
    muted: '#6b7280',
    border: '#e5e7eb',
    bgSoft: '#faf5ff',
    bgAlt: '#f3f4f6',
    success: '#34d399',
    warning: '#fbbf24',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    bold: 'Helvetica-Bold',
  },
  styles: {
    headerStyle: 'gradient',
    borderRadius: 4,
    shadowIntensity: 'medium',
    spacing: 'spacious',
  },
};

// Minimal Theme - For design-conscious clients and creative agencies
export const minimalTheme: PDFTheme = {
  name: 'minimal',
  displayName: 'Minimal',
  description: 'Clean and simple design with focus on content',
  colors: {
    primary: '#18181b',
    primaryLight: '#27272a',
    accent: '#71717a',
    accentLight: '#a1a1aa',
    text: '#09090b',
    muted: '#71717a',
    border: '#e4e4e7',
    bgSoft: '#fafafa',
    bgAlt: '#f4f4f5',
    success: '#22c55e',
    warning: '#eab308',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    bold: 'Helvetica-Bold',
  },
  styles: {
    headerStyle: 'minimal',
    borderRadius: 0,
    shadowIntensity: 'none',
    spacing: 'spacious',
  },
};

// Creative Theme - For creative industries and design agencies
export const creativeTheme: PDFTheme = {
  name: 'creative',
  displayName: 'Creative',
  description: 'Bold and colorful design for creative industries',
  colors: {
    primary: '#7c3aed',
    primaryLight: '#8b5cf6',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    text: '#1f2937',
    muted: '#6b7280',
    border: '#d1d5db',
    bgSoft: '#fef3c7',
    bgAlt: '#fef9c3',
    success: '#10b981',
    warning: '#ef4444',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    bold: 'Helvetica-Bold',
  },
  styles: {
    headerStyle: 'modern',
    borderRadius: 8,
    shadowIntensity: 'strong',
    spacing: 'normal',
  },
};

// Premium Theme - For high-value enterprise clients
export const premiumTheme: PDFTheme = {
  name: 'premium',
  displayName: 'Premium',
  description: 'Luxurious design with gold accents for premium clients',
  colors: {
    primary: '#1e1b4b',
    primaryLight: '#312e81',
    accent: '#d97706',
    accentLight: '#f59e0b',
    text: '#0f172a',
    muted: '#475569',
    border: '#cbd5e1',
    bgSoft: '#fef9c3',
    bgAlt: '#fefce8',
    success: '#059669',
    warning: '#dc2626',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    bold: 'Helvetica-Bold',
  },
  styles: {
    headerStyle: 'corporate',
    borderRadius: 2,
    shadowIntensity: 'strong',
    spacing: 'spacious',
  },
};

// Government Theme - For government and public sector clients
export const governmentTheme: PDFTheme = {
  name: 'government',
  displayName: 'Government',
  description: 'Formal and structured design for government entities',
  colors: {
    primary: '#1e3a8a',
    primaryLight: '#1e40af',
    accent: '#0369a1',
    accentLight: '#0284c7',
    text: '#1e293b',
    muted: '#64748b',
    border: '#cbd5e1',
    bgSoft: '#f8fafc',
    bgAlt: '#f1f5f9',
    success: '#16a34a',
    warning: '#ea580c',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    bold: 'Helvetica-Bold',
  },
  styles: {
    headerStyle: 'corporate',
    borderRadius: 0,
    shadowIntensity: 'none',
    spacing: 'compact',
  },
};

// Education Theme - For educational institutions
export const educationTheme: PDFTheme = {
  name: 'education',
  displayName: 'Education',
  description: 'Friendly and approachable design for education sector',
  colors: {
    primary: '#0891b2',
    primaryLight: '#06b6d4',
    accent: '#14b8a6',
    accentLight: '#2dd4bf',
    text: '#0f172a',
    muted: '#64748b',
    border: '#cbd5e1',
    bgSoft: '#f0fdfa',
    bgAlt: '#ccfbf1',
    success: '#10b981',
    warning: '#f97316',
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    bold: 'Helvetica-Bold',
  },
  styles: {
    headerStyle: 'modern',
    borderRadius: 4,
    shadowIntensity: 'light',
    spacing: 'normal',
  },
};

// Theme registry for easy access
export const themeRegistry: Record<string, PDFTheme> = {
  professional: professionalTheme,
  modern: modernTheme,
  minimal: minimalTheme,
  creative: creativeTheme,
  premium: premiumTheme,
  government: governmentTheme,
  education: educationTheme,
};

// Segment to theme mapping (default suggestions)
export const segmentThemeMapping: Record<string, string> = {
  enterprise: 'premium',
  corporate: 'professional',
  startup: 'modern',
  government: 'government',
  education: 'education',
  creative: 'creative',
};

// Get theme by name or return default
export function getTheme(themeName?: string): PDFTheme {
  if (!themeName) return professionalTheme;
  return themeRegistry[themeName] || professionalTheme;
}

// Get suggested theme for a client segment
export function getSuggestedTheme(segment?: string): PDFTheme {
  if (!segment) return professionalTheme;
  const themeName = segmentThemeMapping[segment] || 'professional';
  return getTheme(themeName);
}

// Get all available themes
export function getAllThemes(): PDFTheme[] {
  return Object.values(themeRegistry);
}


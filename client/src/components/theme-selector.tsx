/**
 * ThemeSelector Component
 *
 * A React component for selecting PDF themes for clients
 * Displays theme previews and handles theme updates
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface Theme {
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    [key: string]: string;
  };
  styles: {
    headerStyle: string;
    [key: string]: any;
  };
}

interface ThemeSelectorProps {
  clientId: string;
  currentSegment?: string;
  currentTheme?: string;
  onUpdate: (data: { segment?: string; preferredTheme?: string }) => void;
}

const segments = [
  { value: 'enterprise', label: 'Enterprise', description: 'Large corporations' },
  { value: 'corporate', label: 'Corporate', description: 'Standard business' },
  { value: 'startup', label: 'Startup', description: 'Tech startups' },
  { value: 'government', label: 'Government', description: 'Public sector' },
  { value: 'education', label: 'Education', description: 'Educational institutions' },
  { value: 'creative', label: 'Creative', description: 'Design agencies' },
];

export function ThemeSelector({ clientId, currentSegment, currentTheme, onUpdate }: ThemeSelectorProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [suggestedTheme, setSuggestedTheme] = useState<Theme | null>(null);
  const [selectedSegment, setSelectedSegment] = useState(currentSegment || '');
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all available themes
    fetch('/api/themes')
      .then(res => res.json())
      .then(data => setThemes(data))
      .catch(err => console.error('Failed to fetch themes:', err));
  }, []);

  useEffect(() => {
    // Get suggested theme when segment changes
    if (selectedSegment) {
      fetch(`/api/themes/segment/${selectedSegment}`)
        .then(res => res.json())
        .then(data => setSuggestedTheme(data))
        .catch(err => console.error('Failed to fetch suggested theme:', err));
    } else {
      setSuggestedTheme(null);
    }
  }, [selectedSegment]);

  const handleSegmentChange = (segment: string) => {
    setSelectedSegment(segment);
    onUpdate({ segment });
  };

  const handleThemeSelect = async (themeName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredTheme: themeName })
      });

      if (response.ok) {
        setSelectedTheme(themeName);
        onUpdate({ preferredTheme: themeName });
      }
    } catch (err) {
      console.error('Failed to update theme:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Segment Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Client Segment</CardTitle>
          <CardDescription>
            Choose a segment to get theme recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSegment} onValueChange={handleSegmentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select segment" />
            </SelectTrigger>
            <SelectContent>
              {segments.map(segment => (
                <SelectItem key={segment.value} value={segment.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{segment.label}</span>
                    <span className="text-xs text-muted-foreground">{segment.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Theme Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">PDF Theme</h3>
          {suggestedTheme && (
            <Badge variant="secondary">
              Suggested: {suggestedTheme.displayName}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map(theme => {
            const isSelected = selectedTheme === theme.name;
            const isSuggested = suggestedTheme?.name === theme.name;

            return (
              <Card
                key={theme.name}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => !loading && handleThemeSelect(theme.name)}
              >
                <CardHeader className="pb-3">
                  {/* Color Preview */}
                  <div
                    className="h-24 rounded-md mb-3 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    {isSuggested && !isSelected && (
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        Suggested
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-base">{theme.displayName}</CardTitle>
                  <CardDescription className="text-xs">
                    {theme.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      Primary
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                      Accent
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {theme.styles.headerStyle} header
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Preview Button */}
      {selectedTheme && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => {
            // Open PDF preview in new window
            window.open(`/api/quotes/preview?theme=${selectedTheme}`, '_blank');
          }}>
            Preview Theme
          </Button>
        </div>
      )}
    </div>
  );
}

export default ThemeSelector;


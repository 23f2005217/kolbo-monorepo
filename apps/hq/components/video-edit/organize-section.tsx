import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useVideoFormStore } from "@/stores/video-form-store";

interface OrganizeSectionProps {
  categories: any[];
  subsites: any[];
  creators: any[];
  filters?: any[];
}

const OrganizeSection = React.memo(function OrganizeSection({ categories, subsites, creators, filters = [] }: OrganizeSectionProps) {
  const formData = useVideoFormStore((state) => state.formData);
  const setFormData = useVideoFormStore((state) => state.setFormData);
  const setPartialFormData = useVideoFormStore((state) => state.setPartialFormData);

  // Helper to find the label for a filter value ID
  const getFilterValueLabel = (valueId: string) => {
    for (const filter of filters) {
      const value = filter.values?.find((v: any) => v.id === valueId);
      if (value) return `${filter.name}: ${value.label}`;
    }
    return valueId;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organize</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Categories</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(val) => setFormData({ categoryId: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="link" className="h-auto p-0 text-white hover:text-blue-500">Manage categories</Button>
        </div>

        <div className="space-y-2">
          <Label>Subsite</Label>
          <Select
            value={formData.subsiteId}
            onValueChange={(val) => setFormData({ subsiteId: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subsite..." />
            </SelectTrigger>
            <SelectContent>
              {subsites.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Authors</Label>
          {creators.length > 0 ? (
            <div className="space-y-2">
              {creators.map(creator => (
                <div key={creator.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.creators.includes(creator.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({ creators: [...formData.creators, creator.id] });
                      } else {
                        setFormData({ creators: formData.creators.filter(id => id !== creator.id) });
                      }
                    }}
                  />
                  <Label>{creator.displayName}</Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mb-1">
              You don't have any authors.
            </div>
          )}
          <Button variant="link" className="h-auto p-0 text-white hover:text-blue-500">Add authors</Button>
        </div>

        <div className="space-y-2">
          <Label>Custom filters</Label>
          <div className="text-xs text-muted-foreground">
            Select up to 3 filters to help users find your content
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.filterValueIds.slice(0, 3).map(id => (
              <Badge key={id} variant="secondary" className="flex items-center gap-1">
                {getFilterValueLabel(id)}
                <button
                  onClick={() => setFormData({ filterValueIds: formData.filterValueIds.filter(fid => fid !== id) })}
                  className="hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {formData.filterValueIds.length === 0 && (
              <span className="text-sm text-muted-foreground">No filters selected</span>
            )}
          </div>
          <Select
            value=""
            onValueChange={(val) => {
              if (val && !formData.filterValueIds.includes(val) && formData.filterValueIds.length < 3) {
                setFormData({ filterValueIds: [...formData.filterValueIds, val] });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add filter..." />
            </SelectTrigger>
            <SelectContent>
              {filters.map(filter => (
                <React.Fragment key={filter.id}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                    {filter.name}
                  </div>
                  {filter.values?.map((v: any) => (
                    <SelectItem key={v.id} value={v.id} disabled={formData.filterValueIds.includes(v.id)}>
                      {v.label}
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))}
              {filters.length === 0 && (
                <SelectItem value="none" disabled>No filters available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
});

export default OrganizeSection;

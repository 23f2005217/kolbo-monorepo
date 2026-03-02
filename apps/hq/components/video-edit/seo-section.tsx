import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useVideoFormStore } from "@/stores/video-form-store";

const SEOSection = React.memo(function SEOSection() {
  const formData = useVideoFormStore((state) => state.formData);
  const setFormData = useVideoFormStore((state) => state.setFormData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Website page title</Label>
          <Input 
            value={formData.seoTitle} 
            onChange={(e) => setFormData({ seoTitle: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Website URL</Label>
          <div className="flex rounded-md border border-input bg-muted/50">
            <span className="flex items-center px-3 text-muted-foreground border-r">/program/</span>
            <Input 
              value={formData.slug} 
              onChange={(e) => setFormData({ slug: e.target.value })}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Meta description</Label>
          <Input 
            value={formData.seoDescription} 
            onChange={(e) => setFormData({ seoDescription: e.target.value })}
            placeholder="Not visible on website or apps"
             maxLength={170}
          />
          <p className="text-xs text-muted-foreground text-right">Characters left: {170 - (formData.seoDescription?.length || 0)}</p>
        </div>
      </CardContent>
    </Card>
  );
});

export default SEOSection;

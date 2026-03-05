import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Video } from "lucide-react";
import { useVideoFormStore } from "@/stores/video-form-store";

const AdsSection = React.memo(function AdsSection() {
  const formData = useVideoFormStore((state) => state.formData);
  const setFormData = useVideoFormStore((state) => state.setFormData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ads</CardTitle>
        <CardDescription>
          Configure video ads. Custom VAST ads require a valid VAST ad tag URL.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Custom VAST Ad Tag URL */}
        <div className="space-y-2">
          <Label htmlFor="adTagUrl">Custom VAST Ad Tag URL</Label>
          <Input
            id="adTagUrl"
            placeholder="https://example.com/ads/vast.xml"
            value={formData.adTagUrl}
            onChange={(e) => setFormData({ adTagUrl: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Enter a VAST/VMAP ad tag URL for custom ads. Leave empty to use default ad settings.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Ad Pricing</Label>
          <Select
            value={formData.adPricing}
            onValueChange={(val) => setFormData({ adPricing: val as "standard" | "premium" })}
          >
            <SelectTrigger><SelectValue placeholder="Select ad pricing..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.adsPlacement.includes("pre_roll")}
              onCheckedChange={(checked) =>
                setFormData({
                  adsPlacement: checked
                    ? [...formData.adsPlacement, "pre_roll"]
                    : formData.adsPlacement.filter((p) => p !== "pre_roll"),
                })
              }
            />
            <Label className="text-sm font-normal">Pre Roll</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.adsPlacement.includes("mid_roll")}
              onCheckedChange={(checked) =>
                setFormData({
                  adsPlacement: checked
                    ? [...formData.adsPlacement, "mid_roll"]
                    : formData.adsPlacement.filter((p) => p !== "mid_roll"),
                })
              }
            />
            <Label className="text-sm font-normal">Mid Roll</Label>

            {formData.adsPlacement.includes("mid_roll") && (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-muted-foreground">Every</span>
                <Input
                  type="number"
                  className="w-16 h-7 px-2"
                  placeholder="10"
                  value={formData.midRollMinutes}
                  onChange={(e) => setFormData({ midRollMinutes: parseInt(e.target.value) || 0 })}
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Internal tags</Label>
          <div className="flex flex-wrap gap-2">
            {formData.adInternalTags.map((tag, idx) => (
              <Badge
                key={`ad-tag-${idx}`}
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => {
                  const newTags = formData.adInternalTags.filter((_, i) => i !== idx);
                  setFormData({ adInternalTags: newTags });
                }}
              >
                {tag}
                <Trash2 className="h-3 w-3" />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add internal tag..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  setFormData({ adInternalTags: [...formData.adInternalTags, e.currentTarget.value.trim()] });
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                const input = document.querySelector('input[placeholder="Add internal tag..."]') as HTMLInputElement;
                if (input && input.value.trim()) {
                  setFormData({ adInternalTags: [...formData.adInternalTags, input.value.trim()] });
                  input.value = '';
                }
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default AdsSection;

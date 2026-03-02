import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVideoFormStore } from "@/stores/video-form-store";

const AccessSection = React.memo(function AccessSection() {
  const formData = useVideoFormStore((state) => state.formData);
  const setFormData = useVideoFormStore((state) => state.setFormData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup 
          value={formData.isFree ? "free" : "gated"}
          onValueChange={(val) => setFormData({ isFree: val === "free" })}
        >
          <div className="flex items-start gap-2 space-x-2">
            <RadioGroupItem value="gated" id="gated" />
            <div>
              <Label htmlFor="gated" className="text-sm font-medium">Gated</Label>
              <p className="text-xs text-muted-foreground">Only users who access will be able to watch this content</p>
            </div>
          </div>
          <div className="flex items-start gap-2 space-x-2 mt-2">
            <RadioGroupItem value="free" id="free" />
            <div>
              <Label htmlFor="free" className="text-sm font-medium">Free for all users</Label>
              <p className="text-xs text-muted-foreground">All users will be able to watch this content, including users that are not logged in</p>
            </div>
          </div>
        </RadioGroup>

        <div className="pt-4 border-t space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minimumAge" className="text-sm font-medium">Minimum Age Recommendation</Label>
            <div className="flex items-center gap-2">
              <Input
                id="minimumAge"
                type="number"
                min="0"
                max="100"
                className="w-20"
                value={formData.minimumAge || ""}
                onChange={(e) => setFormData({ minimumAge: parseInt(e.target.value) || 0 })}
              />
              <span className="text-xs text-muted-foreground">years old (0 for no limit)</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxSimultaneousStreams" className="text-sm font-medium">Global Stream Limit</Label>
            <p className="text-xs text-muted-foreground">Maximum devices per user across ALL pricing tiers. Set to 0 to use tier-specific limits instead.</p>
            <Select 
              value={formData.maxSimultaneousStreams?.toString() || "0"} 
              onValueChange={(val) => setFormData({ maxSimultaneousStreams: parseInt(val) })}
            >
              <SelectTrigger id="maxSimultaneousStreams" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Use Tier Limits</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'device' : 'devices'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Geo-blocking (Blocked Countries)</Label>
            <p className="text-[10px] text-muted-foreground">Enter ISO-2 country codes (e.g. US, IL) to block playback in those regions.</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.geoBlocks.map((code) => (
                <div key={code} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs flex items-center gap-1 uppercase font-mono">
                  {code}
                  <button 
                    onClick={() => setFormData({ geoBlocks: formData.geoBlocks.filter(c => c !== code) })}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.geoBlocks.length === 0 && <span className="text-xs text-muted-foreground italic">No countries blocked</span>}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add country code..."
                className="h-8 text-xs uppercase"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim().toUpperCase();
                    if (val && val.length === 2 && !formData.geoBlocks.includes(val)) {
                      setFormData({ geoBlocks: [...formData.geoBlocks, val] });
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default AccessSection;

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVideoFormStore } from "@/stores/video-form-store";

const VisibilitySection = React.memo(function VisibilitySection({ onSave }: { onSave: () => void }) {
  const formData = useVideoFormStore((state) => state.formData);
  const setFormData = useVideoFormStore((state) => state.setFormData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{formData.status === "published" ? "Published" : "Unpublished"}</p>
            <p className="text-xs text-muted-foreground">
              {formData.status === "published" 
                ? "This video is visible to users" 
                : "This video is hidden from users"}
            </p>
          </div>
          <Switch
            checked={formData.status === "published"}
            onCheckedChange={(checked) => setFormData({ status: checked ? "published" : "unpublished" })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={!!formData.publishScheduledAt}
              onCheckedChange={(checked) =>
                setFormData({
                  publishScheduledAt: checked ? new Date().toISOString() : "",
                })
              }
            />
            <Label className="text-sm font-normal">Schedule publish</Label>
          </div>
          {formData.publishScheduledAt && (
            <div className="flex gap-2">
              <Input
                type="date"
                value={formData.publishScheduledAt.split("T")[0]}
                onChange={(e) => setFormData({
                  publishScheduledAt: `${e.target.value}T${formData.publishScheduledAt.split("T")[1]?.slice(0, 5) || "12:00"}:00`
                })}
              />
              <Input
                type="time"
                value={formData.publishScheduledAt.split("T")[1]?.slice(0, 5) || "12:00"}
                onChange={(e) => setFormData({
                  publishScheduledAt: `${formData.publishScheduledAt.split("T")[0]}T${e.target.value}:00`
                })}
              />
            </div>
          )}
        </div>
        
        <Button onClick={onSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Save
        </Button>
      </CardContent>
    </Card>
  );
});

export default VisibilitySection;

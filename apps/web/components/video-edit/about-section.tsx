import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useVideoFormStore } from "@/stores/video-form-store";

const AboutSection = React.memo(function AboutSection() {
  const formData = useVideoFormStore((state) => state.formData);
  const setFormData = useVideoFormStore((state) => state.setFormData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ title: e.target.value })}
            placeholder="Enter video title"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <RichTextEditor 
            value={formData.descriptionRich} 
            onChange={(val) => setFormData({ descriptionRich: val })}
            placeholder="This description will appear to the viewer what to expect from your video and why they should watch it. It's a helpful tool to increase the conversion rate!"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short description</Label>
          <Input
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ shortDescription: e.target.value })}
            placeholder="This will appear in a subscriber's playlist or other places where space is limited"
            maxLength={140}
          />
          <p className="text-xs text-muted-foreground text-right">
            Characters left: {140 - (formData.shortDescription?.length || 0)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

export default AboutSection;

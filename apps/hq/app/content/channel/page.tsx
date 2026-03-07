"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, Image as ImageIcon, Palette, Layout } from "lucide-react";

interface ChannelSettings {
  name: string;
  slug: string;
  description: string;
  category: string;
  isActive: boolean;
  featured: boolean;
}

export default function ChannelSettingsPage() {
  const [settings, setSettings] = React.useState<ChannelSettings>({
    name: "KolBo Channel",
    slug: "kolbo",
    description: "Your premium video content channel",
    category: "Entertainment",
    isActive: true,
    featured: false,
  });

  const handleSave = () => {
    console.log("Saving channel settings:", settings);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Channel Settings"
        description="Configure your channel details and appearance"
        actions={
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Channel Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="mt-2 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Channel Slug</label>
                <input
                  type="text"
                  value={settings.slug}
                  onChange={(e) => setSettings({ ...settings, slug: e.target.value })}
                  className="mt-2 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={settings.category}
                  onChange={(e) => setSettings({ ...settings, category: e.target.value })}
                  className="mt-2 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option>Entertainment</option>
                  <option>Education</option>
                  <option>News</option>
                  <option>Lifestyle</option>
                  <option>Business</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.isActive}
                    onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.featured}
                    onChange={(e) => setSettings({ ...settings, featured: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle>Channel Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Channel Thumbnail</label>
                <div className="mt-2 aspect-video border-2 border-dashed border-border/60 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Channel Icon</label>
                <div className="mt-2 aspect-square max-w-32 border-2 border-dashed border-border/60 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

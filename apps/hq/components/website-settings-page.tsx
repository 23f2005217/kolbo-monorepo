"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, Image as ImageIcon, Palette, DollarSign } from "lucide-react";
import { cn } from "@/utils";

interface WebsiteSettings {
  name: string;
  description: string;
  type: string;
  priceMonthly: number;
  priceYearly: number;
  trialDays: number;
  backgroundColor: string;
  textColor: string;
}

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = React.useState<WebsiteSettings>({
    name: "KolBo HQ",
    description: "Your premium video content platform",
    type: "Entertainment",
    priceMonthly: 9.99,
    priceYearly: 99.99,
    trialDays: 7,
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
  });

  const handleSave = () => {
    console.log("Saving settings:", settings);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Settings"
        description="Configure your channel appearance and pricing"
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
                <Palette className="h-5 w-5" />
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
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={settings.type}
                  onChange={(e) => setSettings({ ...settings, type: e.target.value })}
                  className="mt-2 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option>Entertainment</option>
                  <option>Education</option>
                  <option>News</option>
                  <option>Lifestyle</option>
                  <option>Business</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Price Per Month</label>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={settings.priceMonthly}
                      onChange={(e) => setSettings({ ...settings, priceMonthly: parseFloat(e.target.value) || 0 })}
                      step="0.01"
                      className="w-full h-9 rounded-md border border-input bg-background pl-7 pr-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Price Per Year</label>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={settings.priceYearly}
                      onChange={(e) => setSettings({ ...settings, priceYearly: parseFloat(e.target.value) || 0 })}
                      step="0.01"
                      className="w-full h-9 rounded-md border border-input bg-background pl-7 pr-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Trial Period</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={settings.trialDays}
                      onChange={(e) => setSettings({ ...settings, trialDays: parseInt(e.target.value) || 0 })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Background Color</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="h-9 w-16 rounded border border-input cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Text Color</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                      className="h-9 w-16 rounded border border-input cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.textColor}
                      onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                      className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg mt-4">
                <label className="text-sm font-medium mb-2 block">Preview</label>
                <div
                  className="p-4 rounded-lg border-2 border-dashed border-border"
                  style={{
                    backgroundColor: settings.backgroundColor,
                    color: settings.textColor,
                  }}
                >
                  <h3 className="text-xl font-bold">{settings.name}</h3>
                  <p className="mt-2 text-sm opacity-80">{settings.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle>Background Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Static Background Image</label>
                <div className="mt-2 border-2 border-dashed border-border/60 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Video Background</label>
                <div className="mt-2 border-2 border-dashed border-border/60 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload loop video (10s/3s)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4 up to 50MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle>Channel Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Channel Thumbnail</label>
                <div className="mt-2 aspect-video border-2 border-dashed border-border/60 rounded-lg flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Channel Icon</label>
                <div className="mt-2 aspect-square max-w-32 border-2 border-dashed border-border/60 rounded-lg flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

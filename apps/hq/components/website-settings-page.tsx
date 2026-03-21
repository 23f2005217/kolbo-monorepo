"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, Save } from "lucide-react";
import { useSubsites, useUpdateSubsite, Subsite } from "@/hooks/use-subsites";
import { toast } from "sonner";

export default function WebsiteSettingsPage() {
  const { subsites, loading: loadingSubsites } = useSubsites();
  const { updateSubsite, loading: isSaving } = useUpdateSubsite();
  
  const [selectedSubsiteId, setSelectedSubsiteId] = React.useState<string>("");
  const [formData, setFormData] = React.useState<Partial<Subsite>>({});

  React.useEffect(() => {
    if (subsites.length > 0 && !selectedSubsiteId) {
      setSelectedSubsiteId(subsites[0].id);
    }
  }, [subsites, selectedSubsiteId]);

  React.useEffect(() => {
    const subsite = subsites.find((s) => s.id === selectedSubsiteId);
    if (subsite) {
      setFormData({
        name: subsite.name || "",
        description: subsite.description || "",
        category: subsite.category || "entertainment",
        monthlyPrice: subsite.monthlyPrice ? subsite.monthlyPrice / 100 : 7.99,
        freeTrialDays: subsite.freeTrialDays || 0,
        config: subsite.config || {
          backgroundColor: "#ffffff",
          textColor: "#000000",
          showSearchBar: true,
          showFilters: true,
          filterCategory: true,
        },
      });
    }
  }, [selectedSubsiteId, subsites]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      config: { ...(prev.config || {}), [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!selectedSubsiteId) return;
    try {
      await updateSubsite(selectedSubsiteId, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        monthlyPrice: formData.monthlyPrice ? Math.round(formData.monthlyPrice * 100) : undefined,
        freeTrialDays: formData.freeTrialDays,
        config: formData.config,
      });
      toast.success("Channel settings updated successfully");
    } catch (error) {
      toast.error("Failed to update channel settings");
    }
  };

  if (loadingSubsites) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!subsites.length) {
    return <div className="p-8 text-center text-gray-500">No channels found.</div>;
  }

  return (
    <div className="max-w-3xl space-y-8 pb-12 pt-6">
      
      <div className="flex items-center justify-end mb-8">
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
        {/* Select Channel */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select Channel Name</Label>
          <Select value={selectedSubsiteId} onValueChange={setSelectedSubsiteId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Channel" />
            </SelectTrigger>
            <SelectContent>
              {subsites.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Description</Label>
          <Textarea 
            placeholder="Channel description and content" 
            className="min-h-[100px] resize-none"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        {/* Background Image */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Background Image</Label>
          <div className="h-32 w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition">
            <span className="text-sm text-gray-500 font-medium">Drag & drop or click to upload</span>
          </div>
        </div>

        {/* Select Video */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select Video</Label>
          <Select value={formData.config?.featuredVideo || ""} onValueChange={(val) => handleConfigChange("featuredVideo", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a video" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="video-1">Sample Video 1</SelectItem>
              <SelectItem value="video-2">Sample Video 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Content Type</Label>
          <Select value={formData.category || "entertainment"} onValueChange={(val) => handleChange("category", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Content Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="news">News</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subscription Price */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Subscription Price</Label>
          <div className="flex items-center gap-4">
            <Input 
              value={formData.monthlyPrice ?? 0} 
              onChange={(e) => handleChange("monthlyPrice", parseFloat(e.target.value))}
              type="number" 
              step="0.01" 
              className="max-w-[200px]" 
            />
            <span className="text-sm text-gray-500 font-medium">per</span>
            <Select defaultValue="month">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Free Trial */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Free Trial</Label>
          <div className="flex items-center gap-4">
            <Input 
              value={formData.freeTrialDays || 0}
              onChange={(e) => handleChange("freeTrialDays", parseInt(e.target.value))}
              type="number" 
              className="max-w-[100px]" 
            />
            <span className="text-sm text-gray-500 font-medium">days</span>
          </div>
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Background Color</Label>
          <div className="flex items-center gap-4 max-w-xs">
            <div 
              className="h-10 w-10 flex-shrink-0 rounded-md border border-gray-200 shadow-sm"
              style={{ backgroundColor: formData.config?.backgroundColor || "#ffffff" }}
            />
            <Input 
              value={formData.config?.backgroundColor || "#ffffff"} 
              onChange={(e) => handleConfigChange("backgroundColor", e.target.value)}
            />
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Text Color</Label>
          <div className="flex items-center gap-4 max-w-xs">
            <div 
              className="h-10 w-10 flex-shrink-0 rounded-md border border-gray-200 shadow-sm"
              style={{ backgroundColor: formData.config?.textColor || "#000000" }}
            />
            <Input 
              value={formData.config?.textColor || "#000000"} 
              onChange={(e) => handleConfigChange("textColor", e.target.value)}
            />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="pt-6 mt-6 border-t border-gray-100 space-y-6">
          <h3 className="text-lg font-semibold">Search & Filters</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Show Search Bar</Label>
              <p className="text-sm text-gray-500">Allow users to search content on this channel</p>
            </div>
            <Switch 
              checked={formData.config?.showSearchBar ?? true} 
              onCheckedChange={(val) => handleConfigChange("showSearchBar", val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Show Filters</Label>
              <p className="text-sm text-gray-500">Display filter options for browsing content</p>
            </div>
            <Switch 
              checked={formData.config?.showFilters ?? true} 
              onCheckedChange={(val) => handleConfigChange("showFilters", val)}
            />
          </div>

          <div className="pl-6 pt-2">
            <h4 className="text-sm font-semibold mb-4 text-gray-700">Available Filters</h4>
            <div className="flex items-center space-x-3">
              <Switch 
                id="filter-category" 
                checked={formData.config?.filterCategory ?? true}
                onCheckedChange={(val) => handleConfigChange("filterCategory", val)}
              />
              <Label htmlFor="filter-category" className="text-sm text-gray-600 font-medium">Category</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

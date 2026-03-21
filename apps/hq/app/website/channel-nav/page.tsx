"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ArrowLeft, Edit2, GripVertical, Upload } from "lucide-react";
import { useSubsites, Subsite } from "@/hooks/use-subsites";

export default function ChannelNavPage() {
  const { subsites, loading } = useSubsites();
  const [editingSubsite, setEditingSubsite] = React.useState<Subsite | null>(null);

  if (editingSubsite) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" className="gap-2" onClick={() => setEditingSubsite(null)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Channel Nav
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Edit Channel: {editingSubsite.name}</h1>

        <div className="grid gap-6 max-w-2xl">
          <Card className="border-border/60 bg-white">
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Channel Thumbnail</h3>
                <div className="w-full sm:w-80 aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                  <span className="text-sm text-gray-400">No thumbnail</span>
                  <Button variant="outline" size="sm" className="mt-2 bg-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Thumbnail
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Recommended size: 320x180px (16:9 aspect ratio)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-white">
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Channel Icon</h3>
                <div className="h-32 w-32 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition overflow-hidden">
                  <span className="text-xs text-gray-400">No icon</span>
                  <Button variant="outline" size="sm" className="mt-2 bg-white scale-75 border-gray-200 shadow-sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-4 font-medium">Recommended size: 128x128px (square)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
          <Button variant="outline" onClick={() => setEditingSubsite(null)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
          ))
        ) : (
          subsites.map((subsite, index) => (
            <div 
              key={subsite.id} 
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-500 transition cursor-pointer"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
              <div className="flex gap-2 text-gray-500 font-medium w-8">
                <span>{index + 1}</span>
              </div>
              <div className="font-semibold text-gray-900 flex-1">{subsite.name}</div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-blue-600"
                onClick={() => setEditingSubsite(subsite)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

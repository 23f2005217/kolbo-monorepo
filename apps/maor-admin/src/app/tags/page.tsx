"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataFetch, useMutation } from "@/hooks/use-data-fetch";

interface SearchTag {
  id: string;
  tag: string;
  _count?: { videos: number };
}

export default function TagsPage() {
  const { data: tags, loading, refetch } = useDataFetch<SearchTag[]>({ url: "/api/tags" });
  const [newTag, setNewTag] = React.useState("");

  const allTags = tags || [];
  const [search, setSearch] = React.useState("");

  const filtered = allTags.filter(t => t.tag.toLowerCase().includes(search.toLowerCase()));

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Search Tags</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All tags used across videos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Filter tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading tags...</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {search ? "No tags match your filter" : "No tags found. Add tags from the video edit page."}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filtered.map((t) => (
                  <Badge 
                    key={t.id} 
                    variant="secondary"
                    className="text-sm py-1.5 px-3"
                  >
                    {t.tag}
                    {t._count?.videos !== undefined && (
                      <span className="ml-2 text-muted-foreground text-xs">({t._count.videos})</span>
                    )}
                  </Badge>
                ))}
              </div>
            )}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              {allTags.length} total tags
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Plus } from "lucide-react";
import { useVideoFormStore } from "@/stores/video-form-store";

interface BundlesSectionProps {
  bundles: any[];
}

const BundlesSection = React.memo(function BundlesSection({ bundles }: BundlesSectionProps) {
  const formData = useVideoFormStore((state) => state.formData);
  const setFormData = useVideoFormStore((state) => state.setFormData);
  const showBundles = useVideoFormStore((state) => state.showBundles);
  const setShowBundles = useVideoFormStore((state) => state.setShowBundles);

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setShowBundles(!showBundles)}>
        <div className="flex items-center justify-between">
          <CardTitle>Bundles</CardTitle>
          <ChevronDown className={`h-4 w-4 transition-transform ${showBundles ? "rotate-180" : ""}`} />
        </div>
      </CardHeader>
      {showBundles && (
        <CardContent>
          <div className="space-y-2">
            {bundles.length > 0 ? (
              bundles.map(bundle => (
                <div key={bundle.id} className="flex items-center gap-2">
                  <Checkbox 
                    checked={formData.bundles.includes(bundle.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({ bundles: [...formData.bundles, bundle.id] });
                      } else {
                        setFormData({ bundles: formData.bundles.filter(id => id !== bundle.id) });
                      }
                    }}
                  />
                  <Label>{bundle.name}</Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No bundles available</p>
            )}
            <Button variant="outline" className="w-full mt-2">
              <Plus className="h-3 w-3 mr-2" /> Create new bundle
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
});

export default BundlesSection;

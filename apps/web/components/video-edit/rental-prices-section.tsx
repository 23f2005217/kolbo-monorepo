import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { useVideoFormStore } from "@/stores/video-form-store";

export default function RentalPricesSection() {
  const rentalOptions = useVideoFormStore((state) => state.formData.rentalOptions);
  const setFormData = useVideoFormStore((state) => state.setFormData);

  const handleAddRentalOption = () => {
    setFormData({
      rentalOptions: [...rentalOptions, { 
        duration: 1, 
        price: 0,
        pricePerDevice: 0,
        tierLabel: "",
        maxStreams: 0
      }]
    });
  };

  const handleUpdateOption = (index: number, field: string, value: any) => {
    const newOptions = [...rentalOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ rentalOptions: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = rentalOptions.filter((_, i) => i !== index);
    setFormData({ rentalOptions: newOptions });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Rental Prices</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rentalOptions.map((option, index) => (
          <div 
            key={`rental-${index}-${option.duration}`} 
            className="bg-muted/50 rounded-lg p-3 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-muted-foreground">Tier {index + 1}</span>
                <Input
                  className="h-8 text-xs flex-1"
                  placeholder="Label (e.g., Standard, HD)"
                  value={option.tierLabel || ""}
                  onChange={(e) => handleUpdateOption(index, 'tierLabel', e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => handleRemoveOption(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground">Duration</Label>
                <Select
                  value={option.duration.toString()}
                  onValueChange={(val) => handleUpdateOption(index, 'duration', parseInt(val))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="2">2 days</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground">Base Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    className="h-8 text-xs pl-7"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={option.price || ""}
                    onChange={(e) => handleUpdateOption(index, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground">Extra/Device</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    className="h-8 text-xs pl-7"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={option.pricePerDevice || ""}
                    onChange={(e) => handleUpdateOption(index, 'pricePerDevice', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground">Max Devices</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  min="0"
                  placeholder="∞"
                  value={option.maxStreams === 0 ? "" : option.maxStreams}
                  onChange={(e) => handleUpdateOption(index, 'maxStreams', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {option.price > 0 && (
              <div className="text-[10px] text-muted-foreground pt-1 border-t space-y-1">
                <p><strong>Pricing:</strong> ${option.price.toFixed(2)} for 1 device</p>
                {option.pricePerDevice > 0 && (
                  <p>+ ${option.pricePerDevice.toFixed(2)} for each additional device</p>
                )}
                {(option.maxStreams || 0) > 0 && (
                  <p className="text-[10px] text-orange-600">Max {option.maxStreams} devices allowed</p>
                )}
              </div>
            )}
          </div>
        ))}

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-9 text-xs border-dashed"
          onClick={handleAddRentalOption}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Rental Tier
        </Button>
      </CardContent>
    </Card>
  );
}

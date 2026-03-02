import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVideoFormStore } from "@/stores/video-form-store";

interface SubscriptionSectionProps {
  plans: any[];
}

export default function SubscriptionSection({ plans }: SubscriptionSectionProps) {
  const subscriptionPlanIds = useVideoFormStore((state) => state.formData.subscriptionPlanIds);
  const setFormData = useVideoFormStore((state) => state.setFormData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Subscription</Label>
          {plans.length > 0 ? (
            <Select
              value={subscriptionPlanIds.length > 1 ? "custom" : subscriptionPlanIds[0] || "none"}
              onValueChange={(val) => {
                if (val === "custom") {
                } else if (val === "all") {
                  setFormData({ subscriptionPlanIds: plans.map(p => p.id) });
                } else if (val === "none") {
                  setFormData({ subscriptionPlanIds: [] });
                } else {
                  setFormData({ subscriptionPlanIds: [val] });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={subscriptionPlanIds.length === 0 ? "No plans selected" : subscriptionPlanIds.length + " plans selected"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No subscription</SelectItem>
                <SelectItem value="all">All Plans</SelectItem>
                {plans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                ))}
                {subscriptionPlanIds.length > 1 && (
                  <SelectItem value="custom" disabled>{subscriptionPlanIds.length} plans selected</SelectItem>
                )}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-muted-foreground">No subscription plans available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

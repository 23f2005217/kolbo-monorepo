"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  Send,
  Calendar,
  Percent,
  Gift,
  Bell,
  Users,
  Target,
  TrendingUp,
  Plus,
} from "lucide-react";
import { cn } from "@/utils";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useCoupons } from "@/hooks/use-coupons";
import { useUpsellOffers } from "@/hooks/use-upsell-offers";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = React.useState("notifications");
  
  const { 
    notifications, 
    loading: notificationsLoading, 
    error: notificationsError 
  } = usePushNotifications();
  
  const { 
    coupons, 
    loading: couponsLoading, 
    error: couponsError 
  } = useCoupons();
  
  const { 
    upsells, 
    loading: upsellsLoading, 
    error: upsellsError 
  } = useUpsellOffers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing"
        description="Manage push notifications, coupons, and upsells"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notifications">Push Notifications</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="upsells">Upsells</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Notification
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : notificationsError ? (
                <div className="text-center py-12 text-red-600">
                  Error loading notifications
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No notifications yet. Create your first notification!
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border border-border/60 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{notification.targetAudience}</span>
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          <span>
                            {notification.scheduledAt 
                              ? new Date(notification.scheduledAt).toLocaleDateString()
                              : "Not scheduled"
                            }
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          notification.status === "sent"
                            ? "bg-green-500/10 text-green-700"
                            : notification.status === "scheduled"
                            ? "bg-blue-500/10 text-blue-700"
                            : "bg-gray-500/10 text-gray-700"
                        )}
                      >
                        {notification.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </div>

          {couponsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : couponsError ? (
            <div className="text-center py-12 text-red-600">
              Error loading coupons
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No coupons yet. Create your first coupon!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="border-border/60 bg-white">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-mono text-2xl">
                          {coupon.code}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {coupon.discountType === "percentage" 
                            ? `${coupon.discountValue}% off`
                            : `$${(coupon.discountValue / 100).toFixed(2)} off`
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Percent className="h-5 w-5 text-primary" />
                        <span className="text-2xl font-bold">
                          {coupon.discountType === "percentage" 
                            ? `${coupon.discountValue}%` 
                            : `$${(coupon.discountValue / 100).toFixed(2)}`
                          }
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Applies To</span>
                        <span className="font-medium">{coupon.appliesTo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expiration</span>
                        <span className="font-medium">
                          {coupon.expiresAt 
                            ? new Date(coupon.expiresAt).toLocaleDateString()
                            : "No expiration"
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Usage</span>
                        <span className="font-medium">
                          {coupon.usageCount} / {coupon.usageLimit || "∞"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        Copy Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upsells" className="space-y-6">
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Upsell
            </Button>
          </div>

          {upsellsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : upsellsError ? (
            <div className="text-center py-12 text-red-600">
              Error loading upsells
            </div>
          ) : upsells.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No upsells yet. Create your first upsell!
            </div>
          ) : (
            <div className="grid gap-4">
              {upsells.map((upsell) => (
                <Card key={upsell.id} className="border-border/60 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Target className="h-5 w-5 text-primary" />
                          <h3 className="text-xl font-semibold">{upsell.name}</h3>
                          {upsell.isActive && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <TrendingUp className="h-3 w-3" />
                              <span>Active</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                          <div className="flex items-center gap-1">
                            <Send className="h-4 w-4" />
                            <span>{upsell.trigger}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Gift className="h-4 w-4" />
                            <span>{upsell.discount}% off</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {upsell.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button
                          variant={upsell.isActive ? "destructive" : "default"}
                          size="sm"
                        >
                          {upsell.isActive ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

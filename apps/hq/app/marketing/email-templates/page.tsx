"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Save, Mail, Edit, Copy, Eye } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: string;
  status: "active" | "draft";
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = React.useState<EmailTemplate[]>([
    { id: "1", name: "Welcome Email", subject: "Welcome to {{channel_name}}!", type: "onboarding", status: "active" },
    { id: "2", name: "New Video Notification", subject: "New video: {{video_title}}", type: "notification", status: "active" },
    { id: "3", name: "Subscription Confirmation", subject: "Confirm your subscription", type: "subscription", status: "active" },
    { id: "4", name: "Password Reset", subject: "Reset your password", type: "security", status: "active" },
    { id: "5", name: "Payment Receipt", subject: "Payment confirmed", type: "billing", status: "draft" },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Templates"
        description="Manage your email templates for marketing campaigns"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/60 hover:bg-muted/50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{template.name}</p>
                        <Badge variant={template.status === "active" ? "default" : "secondary"}>
                          {template.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">Type: {template.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Templates</span>
                <span className="font-medium">{templates.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active</span>
                <span className="font-medium">{templates.filter(t => t.status === "active").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Drafts</span>
                <span className="font-medium">{templates.filter(t => t.status === "draft").length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle>Available Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <code className="block p-2 bg-muted rounded text-xs">{"{{user_name}}"}</code>
              <code className="block p-2 bg-muted rounded text-xs">{"{{channel_name}}"}</code>
              <code className="block p-2 bg-muted rounded text-xs">{"{{video_title}}"}</code>
              <code className="block p-2 bg-muted rounded text-xs">{"{{subscription_url}}"}</code>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

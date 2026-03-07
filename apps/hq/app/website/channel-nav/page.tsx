"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Save, Palette, Type, Layout } from "lucide-react";

interface AppearanceSettings {
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  layout: string;
}

export default function AppearanceSettingsPage() {
  const [settings, setSettings] = React.useState<AppearanceSettings>({
    theme: "dark",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#0a0b14",
    textColor: "#ffffff",
    fontFamily: "Inter",
    layout: "grid",
  });

  const handleSave = () => {
    console.log("Saving appearance settings:", settings);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Channel Nav" />

      <div className="grid gap-6 lg:grid-cols-3">

      </div>
    </div>
  );
}

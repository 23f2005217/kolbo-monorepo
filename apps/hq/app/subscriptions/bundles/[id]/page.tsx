"use client";

import { Shell } from "@/components/shell";
import BundleFormPage from "@/components/subscriptions/bundle-form-page";
import { useParams } from "next/navigation";

export default function EditBundlePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <Shell>
      <BundleFormPage bundleId={id} />
    </Shell>
  );
}

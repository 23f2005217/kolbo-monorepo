"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserAuthContext } from "@/components/user-auth-provider";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { WalkthroughModal } from "@/components/walkthrough-modal";
import {
  SignupStepper,
  StepAccountForm,
  StepChannelSelection,
  StepReviewOrder,
  SignupFooter,
  MONTHS,
  formatPrice,
} from "@/components/signup";
import type { Plan, Channel, Bundle, ChannelConfig } from "@/components/signup";

function SignupContent() {
  const router = useRouter();
  const { signup, userProfile } = useUserAuthContext();
  const {
    selectedStreams,
    setSelectedStreams,
    selectedExperience,
    setSelectedExperience,
    selectedChannels,
    setChannelConfig,
    removeChannelConfig,
    selectedBundles,
    setSelectedBundles,
    discountCode,
    setDiscountCode,
  } = useSubscriptionStore();

  const [step, setStep] = useState(1);

  // Account form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectingCountry, setDetectingCountry] = useState(true);

  // Data loading state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Walkthrough state
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughWatched, setWalkthroughWatched] = useState(false);

  useEffect(() => {
    const watched = localStorage.getItem("kolbo_walkthrough_watched");
    if (watched === "true") setWalkthroughWatched(true);
  }, []);

  useEffect(() => {
    if (step === 3 && !walkthroughWatched) setShowWalkthrough(true);
  }, [step, walkthroughWatched]);

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    setWalkthroughWatched(true);
    localStorage.setItem("kolbo_walkthrough_watched", "true");
  };

  // Skip to step 2 if already logged in
  useEffect(() => {
    if (userProfile && step === 1) setStep(2);
  }, [userProfile, step]);

  // Detect country
  useEffect(() => {
    const detect = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_code) setCountry(data.country_code);
      } catch (err) {
        console.error("[SignupPage] Country detection failed:", err);
      } finally {
        setDetectingCountry(false);
      }
    };
    detect();
  }, []);

  // Load plans, channels, bundles
  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, channelsRes, bundlesRes] = await Promise.all([
          fetch("/api/subscription-plans"),
          fetch("/api/subsites"),
          fetch("/api/bundles"),
        ]);
        if (plansRes.ok) setPlans(await plansRes.json());
        if (channelsRes.ok) {
          const all = await channelsRes.json();
          setChannels(all.filter((c: Channel) => c.slug !== "none"));
        }
        if (bundlesRes.ok) setBundles(await bundlesRes.json());
      } catch (err) {
        console.error("[SignupPage] Error loading data:", err);
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []);

  // Derived plan data
  const streamPlans = plans.filter((p) => p.planType === "streams");
  const experiencePlans = plans.filter((p) => p.planType === "experience");
  const selectedStreamPlan = plans.find((p) => p.id === selectedStreams?.id);
  const selectedExpPlan = plans.find((p) => p.id === selectedExperience?.id);

  // Auto-select standard tiers
  useEffect(() => {
    if (streamPlans.length > 0 && !selectedStreams) {
      const d = streamPlans.find((p) => p.tier === "standard");
      if (d) setSelectedStreams({ id: d.id, devices: d.maxDevices || 3 });
    }
    if (experiencePlans.length > 0 && !selectedExperience) {
      const d = experiencePlans.find((p) => p.tier === "standard");
      if (d) setSelectedExperience({ id: d.id, hasAds: d.hasAds || false });
    }
  }, [plans]);

  // Monthly total
  const monthlyTotal = useMemo(() => {
    let total = 0;
    if (selectedStreamPlan?.priceAmount) total += selectedStreamPlan.priceAmount;
    if (selectedExpPlan?.priceAmount) total += selectedExpPlan.priceAmount;

    const bundledChannelIds = new Set<string>();
    selectedBundles.forEach((b) => {
      const bundle = bundles.find((bundle) => bundle.id === b.id);
      if (bundle) {
        total += bundle.priceAmount || 0;
        bundle.bundleSubsites.forEach((bs) => bundledChannelIds.add(bs.subsite.id));
      }
    });

    selectedChannels.forEach((cfg: ChannelConfig) => {
      if (!bundledChannelIds.has(cfg.subsiteId)) {
        total += cfg.calculatedPriceCents || 0;
      }
    });

    return total;
  }, [selectedStreamPlan, selectedExpPlan, selectedChannels, selectedBundles, bundles, channels]);

  // Signup handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!dobDay || !dobMonth || !dobYear) {
      setError("Complete Date of Birth is required");
      return;
    }
    if (!country) {
      setError("Country is required");
      return;
    }

    const dateOfBirth = `${dobYear}-${(MONTHS.indexOf(dobMonth) + 1)
      .toString()
      .padStart(2, "0")}-${dobDay.padStart(2, "0")}`;

    setLoading(true);
    try {
      await signup(email, password, name, dateOfBirth, country);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-0.5 text-xl font-bold tracking-tight">
          KolB
          <span className="flex size-5 items-center justify-center rounded bg-white/90 text-[#0a0b14]">
            <svg viewBox="0 0 24 24" className="size-3" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </Link>
      </header>

      <SignupStepper step={step} />

      <div className="max-w-3xl mx-auto px-4 pb-32">
        {step === 1 && (
          <StepAccountForm
            name={name} setName={setName}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            dobDay={dobDay} setDobDay={setDobDay}
            dobMonth={dobMonth} setDobMonth={setDobMonth}
            dobYear={dobYear} setDobYear={setDobYear}
            country={country} setCountry={setCountry}
            detectingCountry={detectingCountry}
            error={error}
            loading={loading}
            onSubmit={handleSignup}
          />
        )}

        {step === 2 && (
          <StepChannelSelection
            dataLoading={dataLoading}
            streamPlans={streamPlans}
            experiencePlans={experiencePlans}
            channels={channels}
            bundles={bundles}
            selectedStreams={selectedStreams}
            setSelectedStreams={setSelectedStreams}
            selectedExperience={selectedExperience}
            setSelectedExperience={setSelectedExperience}
            selectedChannels={selectedChannels}
            setChannelConfig={setChannelConfig}
            removeChannelConfig={removeChannelConfig}
            selectedBundles={selectedBundles}
            setSelectedBundles={setSelectedBundles}
          />
        )}

        {step === 3 && (
          <StepReviewOrder
            selectedStreamPlan={selectedStreamPlan}
            selectedExpPlan={selectedExpPlan}
            selectedChannels={selectedChannels}
            selectedBundles={selectedBundles}
            bundles={bundles}
            channels={channels}
            discountCode={discountCode}
            setDiscountCode={setDiscountCode}
            monthlyTotal={monthlyTotal}
          />
        )}
      </div>

      <SignupFooter
        step={step}
        monthlyTotal={monthlyTotal}
        selectedStreamPlan={selectedStreamPlan}
        selectedExpPlan={selectedExpPlan}
        onBack={() => setStep(step - 1)}
        onNext={() => setStep(3)}
        onComplete={() => router.push("/checkout")}
      />

      <WalkthroughModal
        isOpen={showWalkthrough}
        onComplete={handleWalkthroughComplete}
      />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}

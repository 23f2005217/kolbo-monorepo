"use client";

import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kolbo/ui";
import { cn } from "@kolbo/ui";
import { COUNTRIES, MONTHS, DAYS, YEARS } from "./constants";

const inputClass =
  "flex h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90FF]";

const selectTriggerClass = cn(
  inputClass,
  "justify-between border-white/20 hover:border-white/40 transition-colors"
);

interface StepAccountFormProps {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  dobDay: string;
  setDobDay: (v: string) => void;
  dobMonth: string;
  setDobMonth: (v: string) => void;
  dobYear: string;
  setDobYear: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  detectingCountry: boolean;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function StepAccountForm({
  name, setName,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  dobDay, setDobDay,
  dobMonth, setDobMonth,
  dobYear, setDobYear,
  country, setCountry,
  detectingCountry,
  error,
  loading,
  onSubmit,
}: StepAccountFormProps) {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-white/50">Get started with KolBo</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-white">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className={inputClass}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Date of Birth</label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={dobMonth} onValueChange={setDobMonth}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0b14] border-white/20 text-white">
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dobDay} onValueChange={setDobDay}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0b14] border-white/20 text-white">
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dobYear} onValueChange={setDobYear}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0b14] border-white/20 text-white max-h-[200px]">
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium text-white">
              Country{" "}
              {detectingCountry && (
                <span className="text-[10px] text-blue-400 ml-2 animate-pulse">
                  Detecting...
                </span>
              )}
            </label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0b14] border-white/20 text-white max-h-[300px]">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              className={inputClass}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className={inputClass}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center w-full h-10 rounded-md bg-gradient-to-r from-[#4A90FF] to-[#6B5FFF] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Creating account..." : "Continue"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-white/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#4A90FF] hover:text-[#6B5FFF] font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

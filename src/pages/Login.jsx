import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { safeReturnTo } from "@/lib/authReturnTo";
import { ASSETS } from "@/lib/certUtils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      window.location.href = returnTo;
    } catch (err) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("invalid login credentials")) {
        setError("The email or password you entered is incorrect. Please try again.");
      } else if (msg.includes("email not confirmed")) {
        setError("Your email has not been confirmed yet. Please contact your administrator.");
      } else if (msg.includes("rate limit") || msg.includes("too many")) {
        setError("Too many login attempts. Please wait a moment and try again.");
      } else if (msg.includes("network") || msg.includes("fetch")) {
        setError("Could not connect to the server. Please check your internet connection and try again.");
      } else {
        setError(err.message || "Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* PPA XI Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={ASSETS.ppa} alt="PPA Seal" className="h-16 w-auto object-contain" />
            <img src={ASSETS.bagongPilipinas} alt="Bagong Pilipinas" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            Republic of the Philippines
          </p>
          <p className="text-sm font-bold text-slate-800">Department of Justice</p>
          <p className="text-base font-bold text-red-600">Parole and Probation Administration</p>
          <p className="text-sm font-bold text-blue-700">Regional Office No. XI</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-red-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Sign in to your account</h1>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Certificate of Appearance Generator
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-red-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 font-medium bg-red-600 text-white hover:bg-red-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Authorized personnel only. Contact your administrator for access.
        </p>
      </div>
    </div>
  );
}

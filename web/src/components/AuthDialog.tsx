"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, X, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";

type View = "login" | "register" | "forgot" | "code";

const UNVERIFIED_MSG = "Veuillez vérifier votre adresse email avant de vous connecter";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skipRedirect?: boolean;
}

export default function AuthDialog({ open, onOpenChange, skipRedirect = false }: AuthDialogProps) {
  const { login, verifyLoginCode, register } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const isDev = process.env.NODE_ENV === "development";
  const [email, setEmail] = useState(isDev ? "guilhem.rossi@gmail.com" : "");
  const [password, setPassword] = useState(isDev ? "changeme12345" : "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(() => {
    try {
      const until = parseInt(localStorage.getItem("resend_verify_until") || "0", 10);
      return Math.max(0, Math.ceil((until - Date.now()) / 1000));
    } catch { return 0; }
  });

  const reset = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setError("");
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await login(email, password);
      if (result.requireCode) {
        setView("code");
      } else {
        onOpenChange(false);
        reset();
        if (!skipRedirect) {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      const user = await verifyLoginCode(email, code);
      onOpenChange(false);
      reset();
      if (!skipRedirect) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      toast.success("Email de vérification renvoyé !");
      localStorage.setItem("resend_verify_until", String(Date.now() + 60_000));
      setResendCooldown(60);
    } catch {
      toast.error("Erreur lors du renvoi.");
    } finally {
      setResending(false);
    }
  };

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (view === "code" && code.length === 6 && !submittingRef.current) {
      handleCode();
    }
  }, [code, view]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await register(email, password);
      toast.success("Compte créé ! Vérifiez votre email pour activer votre compte.");
      setView("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Si cette adresse existe, un lien de réinitialisation a été envoyé.");
        setView("login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-md mx-4 shadow-2xl overflow-hidden rounded"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header band */}
        <div className="tricolor-band" />
        <div className="bg-[#000091] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/15 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-white font-heading font-bold text-sm">
                {view === "login" && "Connexion"}
                {view === "register" && "Créer un compte"}
                {view === "forgot" && "Mot de passe oublié"}
                {view === "code" && "Vérification"}
              </p>
              <p className="text-white/60 text-xs">declarerdefibrillateur.fr</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Login */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && error === UNVERIFIED_MSG ? (
                <div className="bg-[#F5F5FE] border-l-4 border-[#000091] px-4 py-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-[#000091] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[#3A3A3A] font-medium">{error}</p>
                      <p className="text-[#666] text-xs mt-1">
                        Consultez votre boîte email (et vos spams) pour le lien de vérification.
                      </p>
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resending || resendCooldown > 0}
                        className="mt-2 text-xs font-medium text-[#000091] hover:underline disabled:text-[#929292] disabled:no-underline"
                      >
                        {resending
                          ? "Envoi en cours..."
                          : resendCooldown > 0
                            ? `Renvoyer dans ${resendCooldown}s`
                            : "Renvoyer l'email de vérification"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-[#E1000F] px-4 py-3 text-sm text-[#E1000F]">
                  {error}
                </div>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-sm font-semibold text-[#3A3A3A]">
                  Adresse email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]"
                  placeholder="nom@exemple.fr"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-sm font-semibold text-[#3A3A3A]">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#3A3A3A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#000091] hover:bg-[#000070] text-white font-semibold"
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Se connecter
              </Button>
              <div className="flex justify-between text-sm pt-1">
                <button type="button" onClick={() => { reset(); setView("forgot"); }} className="text-[#000091] hover:underline font-medium">
                  Mot de passe oublié ?
                </button>
                <button type="button" onClick={() => { reset(); setView("register"); }} className="text-[#000091] hover:underline font-medium">
                  Créer un compte
                </button>
              </div>
            </form>
          )}

          {/* 2FA Code */}
          {view === "code" && (
            <form onSubmit={handleCode} className="space-y-4">
              <div className="bg-[#F6F6F6] rounded px-4 py-3 text-sm text-[#3A3A3A]">
                Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
              </div>
              {error && (
                <div className="bg-red-50 border-l-4 border-[#E1000F] px-4 py-3 text-sm text-[#E1000F]">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="code-input" className="text-sm font-semibold text-[#3A3A3A]">
                  Code de vérification
                </Label>
                <Input
                  id="code-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  className="text-center text-2xl tracking-[0.5em] font-mono border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#000091] hover:bg-[#000070] text-white font-semibold"
                disabled={submitting || code.length !== 6}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Vérifier
              </Button>
              <button type="button" onClick={() => { reset(); setView("login"); }} className="w-full text-sm text-[#000091] hover:underline font-medium">
                Retour à la connexion
              </button>
            </form>
          )}

          {/* Register */}
          {view === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-[#E1000F] px-4 py-3 text-sm text-[#E1000F]">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-sm font-semibold text-[#3A3A3A]">
                  Adresse email
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]"
                  placeholder="nom@exemple.fr"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-password" className="text-sm font-semibold text-[#3A3A3A]">
                  Mot de passe <span className="font-normal text-[#929292]">(12 caractères min.)</span>
                </Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={12}
                  autoComplete="new-password"
                  className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm" className="text-sm font-semibold text-[#3A3A3A]">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#000091] hover:bg-[#000070] text-white font-semibold"
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Créer mon compte
              </Button>
              <button type="button" onClick={() => { reset(); setView("login"); }} className="w-full text-sm text-[#000091] hover:underline font-medium">
                Déjà un compte ? Se connecter
              </button>
            </form>
          )}

          {/* Forgot password */}
          {view === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="bg-[#F6F6F6] rounded px-4 py-3 text-sm text-[#3A3A3A]">
                Saisissez votre adresse email pour recevoir un lien de réinitialisation.
              </div>
              {error && (
                <div className="bg-red-50 border-l-4 border-[#E1000F] px-4 py-3 text-sm text-[#E1000F]">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-sm font-semibold text-[#3A3A3A]">
                  Adresse email
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-[#CECECE] focus:border-[#000091] focus:ring-[#000091]"
                  placeholder="nom@exemple.fr"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#000091] hover:bg-[#000070] text-white font-semibold"
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Envoyer le lien
              </Button>
              <button type="button" onClick={() => { reset(); setView("login"); }} className="w-full text-sm text-[#000091] hover:underline font-medium">
                Retour à la connexion
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

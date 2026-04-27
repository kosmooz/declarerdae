"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { setAccessToken } from "@/lib/api";
import { toast } from "sonner";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(() => {
    try {
      const until = parseInt(localStorage.getItem("resend_verify_until") || "0", 10);
      return Math.max(0, Math.ceil((until - Date.now()) / 1000));
    } catch { return 0; }
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien de vérification invalide.");
      return;
    }

    const ctrl = new AbortController();
    fetch(`/api/auth/verify-email?token=${token}`, { signal: ctrl.signal })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
          // Auto-login with tokens from verification response
          if (data.accessToken) {
            setAccessToken(data.accessToken);
          }
          await refreshUser();
          setTimeout(() => router.push("/dashboard/mes-declarations"), 1500);
        } else {
          setStatus("error");
          setMessage(data.message || "Ce lien de vérification est invalide ou a expiré.");
        }
      })
      .catch((err: unknown) => {
        if ((err as Error).name === "AbortError") return;
        setStatus("error");
        setMessage("Erreur réseau. Veuillez réessayer.");
      });
    return () => ctrl.abort();
  }, [token, refreshUser, router]);

  const handleResend = async () => {
    if (resendCooldown > 0 || resending || !user?.email) return;
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 text-[#000091] mx-auto animate-spin" />
              <p className="text-[#666]">Vérification en cours...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-[#18753C] mx-auto" />
              <h2 className="text-xl font-bold text-[#161616] font-heading">Adresse email vérifiée !</h2>
              <p className="text-[#666] text-sm">{message}</p>
              <p className="text-sm text-[#929292]">Redirection vers vos déclarations...</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-[#E1000F]/10 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8 text-[#E1000F]" />
              </div>
              <h2 className="text-xl font-bold text-[#161616] font-heading">Lien expiré ou invalide</h2>
              <p className="text-[#666] text-sm whitespace-pre-line">{message}</p>
              {user && (
                <Button
                  onClick={handleResend}
                  disabled={resending || resendCooldown > 0}
                  className="w-full bg-[#000091] hover:bg-[#000091]/90 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {resending
                    ? "Envoi en cours..."
                    : resendCooldown > 0
                      ? `Renvoyer dans ${resendCooldown}s`
                      : "Recevoir un nouveau lien"}
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push("/")} className="w-full text-[#000091] border-[#000091] hover:bg-[#000091]/5">
                Retour à l{"'"}accueil
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000091]" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

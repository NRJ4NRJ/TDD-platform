"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicSent(true);
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.62)),url('/sun-sets-renewable-energy-futuristic-landscape-generated-by-ai.jpg')] bg-cover bg-center bg-no-repeat px-4">
      <div className="w-full max-w-md">
        <div className="space-y-6 rounded-2xl border border-white/40 bg-white/75 p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center space-y-1">
            <Link href="/" className="text-2xl font-bold text-slate-950">
              TDD Platform
            </Link>
            <p className="text-sm text-slate-700">Connexion à votre espace</p>
          </div>

          {magicSent ? (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">✉️</div>
              <p className="font-medium text-slate-900">Lien envoyé !</p>
              <p className="text-sm text-slate-700">
                Vérifiez votre boîte mail <strong>{email}</strong> et cliquez
                sur le lien de connexion.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              {mode === "password" ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-slate-900 mb-1">
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white/95 px-3 py-2.5 text-sm text-slate-950 caret-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-slate-900 mb-1">
                      Mot de passe
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white/95 px-3 py-2.5 text-sm text-slate-950 caret-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  >
                    {loading ? "Connexion…" : "Se connecter"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label htmlFor="magic-email" className="block text-sm font-medium text-slate-900 mb-1">
                      Email
                    </label>
                    <input
                      id="magic-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white/95 px-3 py-2.5 text-sm text-slate-950 caret-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  >
                    {loading ? "Envoi…" : "Recevoir un lien magique"}
                  </button>
                </form>
              )}

              <div className="text-center">
                <button
                  onClick={() =>
                    setMode(mode === "password" ? "magic" : "password")
                  }
                  className="text-xs text-slate-700 underline hover:text-slate-950"
                >
                  {mode === "password"
                    ? "Connexion par lien magique (sans mot de passe)"
                    : "Connexion avec mot de passe"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

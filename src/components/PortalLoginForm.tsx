"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const AUTH_EMAIL = "nicolas.clecoeur@gmail.com";

export default function PortalLoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState(AUTH_EMAIL);
  const [password, setPassword] = useState("@Freelance2026.");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (email !== AUTH_EMAIL) {
      setError("Seul l'identifiant autorisé peut se connecter pour le moment.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/85 backdrop-blur rounded-[2rem] border border-white/50 shadow-2xl p-10">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Accès réservé
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950">
            Connexion
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Identifiant unique pris en charge pour le moment.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Identifiant
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Votre mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [type, setType] = useState("wind");
  const [capacityMw, setCapacityMw] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("development");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: project, error: insertError } = await supabase
      .from("projects")
      .insert({
        name,
        type: type as "wind" | "solar" | "hydro" | "storage" | "other",
        capacity_mw: capacityMw ? parseFloat(capacityMw) : null,
        location: location || null,
        status: status as "development" | "construction" | "operation",
        user_id: user.id,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link
          href="/projects"
          className="text-sm text-slate-500 hover:text-blue-600"
        >
          ← Retour au portefeuille
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">
          Nouveau projet
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom du projet *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex. Parc éolien de la Montagne Noire"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type de technologie *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="wind">Éolien</option>
                <option value="solar">Solaire PV</option>
                <option value="hydro">Hydraulique</option>
                <option value="storage">Stockage (BESS)</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Puissance (MW)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={capacityMw}
                onChange={(e) => setCapacityMw(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex. 18"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Localisation
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex. Aude (11)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stade de développement *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="development">Développement</option>
                <option value="construction">Construction</option>
                <option value="operation">Exploitation</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/projects"
              className="flex-1 text-center border border-slate-300 text-slate-700 font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? "Création…" : "Créer le projet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

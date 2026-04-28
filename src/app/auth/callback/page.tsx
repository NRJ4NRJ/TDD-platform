"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Vérification de la connexion...");

  useEffect(() => {
    async function handleRedirect() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setMessage("La connexion a échoué. Redirection vers la page de connexion...");
        router.replace("/login?error=auth_callback_failed");
        return;
      }

      if (data?.session) {
        router.replace("/projects");
        return;
      }

      setMessage("Aucune session détectée. Redirection vers la page de connexion...");
      router.replace("/login?error=auth_callback_failed");
    }

    handleRedirect();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </main>
  );
}

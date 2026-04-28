import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/projects");

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/60" />
      <div className="relative z-10 text-center">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full bg-white/95 px-10 py-4 text-lg font-semibold text-slate-900 shadow-[0_25px_80px_rgba(15,23,42,0.55)] transition hover:bg-white"
        >
          Accéder à la plateforme
        </Link>
      </div>
    </main>
  );
}

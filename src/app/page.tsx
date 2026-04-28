import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortalLoginForm from "@/components/PortalLoginForm";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/projects");

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/65" />
      <div className="relative z-10 w-full px-4 py-10">
        <PortalLoginForm />
      </div>
    </main>
  );
}

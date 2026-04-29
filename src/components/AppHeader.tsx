import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function AppHeader({ email }: { email?: string | null }) {
  const navItems = [
    { href: "/dashboard", label: "Tableau de bord" },
    { href: "/projects", label: "Portefeuille" },
    { href: "/projects/new", label: "Nouveau projet" },
    { href: "/projects/import", label: "Importer" },
    { href: "/report", label: "Rapport" },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-lg font-bold text-slate-900 transition-colors hover:text-blue-600"
          >
            TDD Platform
          </Link>
          {email && (
            <div className="flex items-center gap-3 lg:hidden">
              <LogoutButton />
            </div>
          )}
        </div>

        <nav className="flex gap-2 overflow-x-auto text-sm" aria-label="Navigation principale">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {email && (
          <div className="hidden items-center gap-4 lg:flex">
            <span className="text-sm text-slate-500">{email}</span>
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}

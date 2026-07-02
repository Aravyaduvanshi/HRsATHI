import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

/**
 * Authenticated HR shell layout.
 * Provides the top navigation bar and sidebar for all /dashboard routes.
 * Clerk's middleware.ts ensures only signed-in users reach this layout.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh bg-[hsl(220_14%_8%)]">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 border-r border-[hsl(220_12%_18%)] bg-[hsl(220_12%_10%)] px-4 py-6 gap-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 px-2">
          <span className="text-xl font-bold text-white tracking-tight">
            HR<span className="text-[hsl(222_70%_60%)]">Sathi</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          <NavLink href="/dashboard">All Jobs</NavLink>
        </nav>

        {/* User profile */}
        <div className="flex items-center gap-3 px-2">
          <UserButton/>
          <span className="text-sm text-[hsl(220_14%_60%)]">Account</span>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                 text-[hsl(220_14%_70%)] hover:text-white hover:bg-[hsl(220_12%_18%)]
                 transition-colors duration-150"
    >
      {children}
    </Link>
  );
}

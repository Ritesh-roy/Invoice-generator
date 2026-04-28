import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, FileText, Users, Settings as SettingsIcon, Plus,
  Bell, Search, Moon, Sun, Menu, X,
} from "lucide-react";
import { actions, useStore, useTheme } from "@/lib/store";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

const AppLayout = () => {
  const theme = useTheme();
  const settings = useStore((s) => s.settings);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarBody = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        {settings.logo ? (
          <img src={settings.logo} alt="logo" className="h-9 w-9 rounded-lg object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-foreground text-sm font-bold text-primary-foreground">
            Q
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">{settings.companyName}</div>
          <div className="text-[11px] text-muted-foreground">Invoice Suite</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <button
          onClick={() => { navigate("/invoices/new"); setMobileOpen(false); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> New Invoice
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        {SidebarBody}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card lg:hidden animate-slide-in">
            {SidebarBody}
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search invoices, clients…"
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => actions.updateSettings({ theme: theme === "dark" ? "light" : "dark" })}
              className="rounded-xl p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <button className="relative rounded-xl p-2 text-muted-foreground hover:bg-secondary" aria-label="Notifications">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <Link to="/settings" className="ml-1 flex items-center gap-2 rounded-xl border border-border bg-background py-1.5 pl-1.5 pr-3 hover:bg-secondary">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-foreground text-[11px] font-bold text-primary-foreground">
                {settings.companyName.slice(0, 1)}
              </div>
              <span className="hidden text-xs font-semibold sm:inline">Admin</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

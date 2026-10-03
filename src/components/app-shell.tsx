import { Link, useRouterState } from "@tanstack/react-router";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role } from "@/data/workspace";
import { Bell, Menu, MessageSquareText, Search } from "lucide-react";

import nayeraMark from "@/assets/nayera-mark.png";
import { Icon } from "@/components/icon";
import { AssistantPanel } from "@/components/assistant-panel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { navGroups, roles } from "@/data/workspace";
import { DataSourceProvider, useDataSource } from "@/lib/data-source";

const RoleCtx = createContext<Role | null>(null);
export const useCurrentRole = () => useContext(RoleCtx) ?? roles[0]!;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <DataSourceProvider>
      <Shell>{children}</Shell>
    </DataSourceProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { source, setSource } = useDataSource();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [roleId, setRoleId] = useState(roles[0]!.id);
  const role = roles.find((r) => r.id === roleId) ?? roles[0]!;

  const navigation = (closeOnSelect = false) => (
    <nav className="flex-1 overflow-y-auto px-3 pb-8">
      {navGroups.map((group) => (
        <div key={group.label} className="mb-5">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const link = (
                <Link
                  to={item.to}
                  className={`flex min-w-0 items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors ${
                    active
                      ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
              return <li key={item.label}>{closeOnSelect ? <SheetClose asChild>{link}</SheetClose> : link}</li>;
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <RoleCtx.Provider value={role}>
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <img src={nayeraMark} alt="" width={36} height={36} className="h-9 w-9" />
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-sidebar-accent-foreground">Nayera AI</p>
            <p className="text-[11px] text-sidebar-foreground/60">People Intelligence ERP</p>
          </div>
        </div>

        {navigation()}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-card/90 px-3 py-2 backdrop-blur sm:px-4 lg:flex lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[min(88vw,320px)] flex-col gap-0 bg-sidebar p-0 text-sidebar-foreground sm:max-w-xs">
              <div className="flex shrink-0 items-center gap-3 px-5 py-5">
                <img src={nayeraMark} alt="" width={36} height={36} className="h-9 w-9" />
                <div className="min-w-0 leading-tight">
                  <p className="font-display text-sm font-semibold text-sidebar-accent-foreground">Nayera AI</p>
                  <p className="truncate text-[11px] text-sidebar-foreground/60">People Intelligence ERP</p>
                </div>
              </div>
              {navigation(true)}
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <img src={nayeraMark} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
            <span className="truncate font-display text-sm font-semibold">Nayera AI</span>
          </div>
          <div className="hidden items-center gap-2 rounded-md border border-border bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground md:flex">
            <Search className="h-3.5 w-3.5" />
            Ask anything about your workforce
          </div>
          <div className="col-span-3 row-start-2 grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 sm:col-span-1 sm:row-start-auto sm:ml-auto sm:flex">
            <div className="flex min-w-0 rounded-md border border-border p-0.5 text-xs">
              {(["seeded", "uploaded"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={`min-w-0 flex-1 rounded px-2 py-1.5 font-medium transition-colors sm:flex-none sm:px-2.5 ${source === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {s === "seeded" ? "Sample data" : "My data"}
                </button>
              ))}
            </div>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger className="h-9 min-w-0 w-full text-xs sm:w-[210px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    {r.title} — {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="hidden shrink-0 md:inline-flex" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" className="absolute right-3 top-2 shrink-0 sm:static sm:h-9 sm:w-auto sm:gap-2 sm:px-3" aria-label="Ask Nayera AI">
                  <MessageSquareText className="h-4 w-4" />
                  <span className="hidden sm:inline">Ask Nayera AI</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[460px]">
                <AssistantPanel key={source} role={role} context={pathname} dataSource={source} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden px-3 py-5 sm:px-4 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
    </RoleCtx.Provider>
  );
}

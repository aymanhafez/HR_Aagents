import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { MessageSquareText, Search, Bell } from "lucide-react";

import briteMark from "@/assets/brite-mark.png";
import { Icon } from "@/components/icon";
import { AssistantPanel } from "@/components/assistant-panel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { navGroups, roles } from "@/data/workspace";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [roleId, setRoleId] = useState(roles[0]!.id);
  const role = roles.find((r) => r.id === roleId) ?? roles[0]!;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <img src={briteMark} alt="" width={36} height={36} className="h-9 w-9" />
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-sidebar-accent-foreground">Brite AI</p>
            <p className="text-[11px] text-sidebar-foreground/60">People Intelligence ERP</p>
          </div>
        </div>

        <nav className="flex-1 px-3 pb-8">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        className={`flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <Icon name={item.icon} className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur lg:px-6">
          <div className="hidden items-center gap-2 rounded-md border border-border bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground md:flex">
            <Search className="h-3.5 w-3.5" />
            Ask anything about your workforce
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger className="h-9 w-[210px] text-xs">
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
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" className="gap-2">
                  <MessageSquareText className="h-4 w-4" />
                  Ask Brite AI
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[460px]">
                <AssistantPanel role={role} context={pathname} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import StatsCards from "../components/StatsCard";
import SubscriptionTable from "../components/SubscriptionTable";
import AddSubscriptionModal from "../components/AddSubscriptionModal";
import ConnectGmailButton from "../components/ConnectGmailButton";
import { useAuth } from "../components/AuthProvider";

const themes = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const { user, logout, refreshUser } = useAuth();
  const location = useLocation();
  // Persist theme in localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Always refresh user on dashboard load
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, []);

  /* Show a toast if redirected back after Gmail import */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("imported") === "1") {
      toast.success("Subscriptions imported from Gmail 🎉");
      refreshUser();
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* ───────────────── Header ───────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold grow">
          Welcome, {user?.name || "User"}
        </h1>

        <div className="flex gap-3 items-center">
          {/* DaisyUI Theme Switcher */}
          <select
            className="select select-bordered select-xs w-24"
            value={theme}
            onChange={e => setTheme(e.target.value)}
            aria-label="Theme switcher"
          >
            {themes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <Button onClick={handleLogout} variant="destructive">Logout</Button>
          <ConnectGmailButton />
          <Button onClick={() => setOpen(true)}>+ Add Subscription</Button>
        </div>
      </div>

      {/* ──────────────── KPI Cards ──────────────── */}
      <StatsCards />

      {/* ─────────────── Subscription Table ─────────────── */}
      <Card className="shadow-md">
        <CardContent className="p-0">
          <SubscriptionTable />
        </CardContent>
      </Card>

      {/* ─────────────── Add‑Subscription Modal ─────────────── */}
      <AddSubscriptionModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

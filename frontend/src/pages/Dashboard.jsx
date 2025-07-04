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
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold grow">
          Welcome, {user?.name || "User"}
        </h1>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-start sm:justify-end w-full sm:w-auto">
          <select
            className="select select-bordered select-xs w-20 sm:w-24"
            value={theme}
            onChange={e => setTheme(e.target.value)}
            aria-label="Theme switcher"
          >
            {themes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <Button className="w-auto text-[10px] px-3 py-2 sm:text-base sm:px-5 sm:py-2.5 font-medium" onClick={handleLogout} variant="destructive">Logout</Button>
          <ConnectGmailButton className="w-auto text-[10px] px-3 py-2 sm:text-base sm:px-5 sm:py-2.5 font-medium" />
          <Button className="w-auto text-[10px] px-3 py-2 sm:text-base sm:px-5 sm:py-2.5 font-medium" onClick={() => setOpen(true)}>+ Add Subscription</Button>
        </div>
      </div>
      {/* KPI Cards */}
      <StatsCards />
      {/* Subscription Table */}
      <Card className="shadow-md overflow-x-auto">
        <CardContent className="p-0 min-w-[340px] sm:p-0">
          <div className="w-full overflow-x-auto">
            <SubscriptionTable />
          </div>
        </CardContent>
      </Card>
      {/* Add-Subscription Modal */}
      <AddSubscriptionModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { getStats } from "@/api/subscriptions";
import { useQuery } from "@tanstack/react-query";

export default function StatsCards() {
  const { data = {} } = useQuery({ queryKey: ["stats"], queryFn: getStats });
  const stats = [
    { label: "Monthly Spend",     key: "monthly",  color: "bg-emerald-100 text-emerald-800" },
    { label: "Yearly Spend",      key: "yearly",   color: "bg-indigo-100 text-indigo-800" },
    { label: "Upcoming Renewals", key: "upcoming", color: "bg-orange-100 text-orange-800" },
  ];
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {stats.map(s => (
        <Card key={s.key} className={`${s.color}`}>
          <CardContent>
            <p className="text-sm font-medium">{s.label}</p>
            <p className="text-2xl font-bold mt-1">
              {s.key === "upcoming" ? data.upcoming ?? 0 : `₹${data[s.key] ?? 0}`}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

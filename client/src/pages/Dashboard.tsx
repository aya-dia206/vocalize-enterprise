import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAgency } from "@/contexts/AgencyContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Phone, DollarSign, Smile, Calendar, LogOut, Settings } from "lucide-react";

interface MetricsData {
  calls: number;
  spend: number;
  sentiment: number;
  bookings: number;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

const chartData = [
  { name: "Mon", value: 4000 },
  { name: "Tue", value: 3000 },
  { name: "Wed", value: 2000 },
  { name: "Thu", value: 2780 },
  { name: "Fri", value: 1890 },
  { name: "Sat", value: 2390 },
  { name: "Sun", value: 3490 },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { agencyId, token, agency, logout } = useAgency();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agencyId || !token) {
      setLocation("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [metricsData, activityData] = await Promise.all([
          api.getAgencyMetrics(agencyId, token),
          api.getActivityFeed(agencyId, token),
        ]);
        setMetrics(metricsData);
        setActivity(activityData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [agencyId, token, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-foreground/60 mt-1">
              {agency?.name || "Welcome back"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/settings")}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Calls Card */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Total Calls</p>
                <p className="text-3xl font-bold text-foreground">
                  {metrics?.calls || 0}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Phone className="h-6 w-6 text-accent" />
              </div>
            </div>
            <p className="text-xs text-foreground/40 mt-4">+12% from last week</p>
          </Card>

          {/* Spend Card */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Total Spend</p>
                <p className="text-3xl font-bold text-foreground">
                  ${metrics?.spend || 0}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
            </div>
            <p className="text-xs text-foreground/40 mt-4">+8% from last week</p>
          </Card>

          {/* Sentiment Card */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Sentiment Score</p>
                <p className="text-3xl font-bold text-foreground">
                  {metrics?.sentiment || 0}%
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Smile className="h-6 w-6 text-accent" />
              </div>
            </div>
            <p className="text-xs text-foreground/40 mt-4">Very positive trend</p>
          </Card>

          {/* Bookings Card */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">New Bookings</p>
                <p className="text-3xl font-bold text-foreground">
                  {metrics?.bookings || 0}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
            </div>
            <p className="text-xs text-foreground/40 mt-4">+25% from last week</p>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area Chart */}
          <Card className="lg:col-span-2 border border-border bg-card/50 backdrop-blur-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Weekly Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(0.6 0.25 280)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.6 0.25 280)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.08)"
                />
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(12, 12, 20, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "rgba(255, 255, 255, 0.9)" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="oklch(0.6 0.25 280)"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Activity Feed */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {activity.length > 0 ? (
                activity.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="pb-4 border-b border-border/50 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {item.type}
                    </p>
                    <p className="text-xs text-foreground/60 mt-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-foreground/40 mt-2">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-foreground/60 text-center py-8">
                  No recent activity
                </p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

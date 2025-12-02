import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { PhoneCall, ShieldCheck, ShieldOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLES } from "@/const";
import { fetchClinicCalls } from "@/services/supabaseProfiles";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabaseClient";
import type { CallRow, ClinicRow } from "@shared/supabase.types";
import { toast } from "sonner";

export default function ClinicDashboard() {
  const { profile, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [systemStatus, setSystemStatus] = useState<"active" | "paused">("active");
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [callsError, setCallsError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallRow | null>(null);
  const [settings, setSettings] = useState({
    name: "",
    forwardingNumber: "",
    voice: "warm",
  });
  const [clinicMeta, setClinicMeta] = useState<ClinicRow | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const isIndependent = profile?.role === ROLES.independentClinic;

  useEffect(() => {
    if (!profile?.clinicId || !supabaseClient) return;
    supabaseClient
      .from("clinics")
      .select("*")
      .eq("id", profile.clinicId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error;
        if (data) {
          setClinicMeta(data);
          setSystemStatus(data.system_status);
          setSettings({
            name: data.name,
            forwardingNumber: data.forwarding_number ?? "",
            voice: data.voice ?? "warm",
          });
        }
      })
      .catch(err => {
        console.error("[ClinicDashboard] Failed to load clinic", err);
        toast.error("Unable to load clinic settings");
      });
  }, [profile?.clinicId]);

  useEffect(() => {
    if (!profile?.clinicId) return;
    setCallsLoading(true);
    fetchClinicCalls(profile.clinicId)
      .then(setCalls)
      .catch(err => {
        console.error("[ClinicDashboard] Failed to load calls", err);
        setCallsError("Unable to load call logs");
      })
      .finally(() => setCallsLoading(false));
  }, [profile?.clinicId]);

  const handleStatusChange = async (next: "active" | "paused") => {
    if (!supabaseClient || !profile?.clinicId) return;
    try {
      setSystemStatus(next);
      await supabaseClient.from("clinics").update({ system_status: next }).eq("id", profile.clinicId);
      toast.success(`System ${next === "active" ? "resumed" : "stopped"}`);
    } catch (err) {
      console.error("[ClinicDashboard] Failed to update status", err);
      toast.error("Could not update system status");
    }
  };

  const saveClinicSettings = async () => {
    if (!supabaseClient || !profile?.clinicId) return;
    try {
      setSavingSettings(true);
      await supabaseClient
        .from("clinics")
        .update({
          name: settings.name,
          forwarding_number: settings.forwardingNumber,
          voice: settings.voice,
        })
        .eq("id", profile.clinicId);
      toast.success("Settings saved");
    } catch (err) {
      console.error("[ClinicDashboard] Failed to save settings", err);
      toast.error("Unable to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const statusBanner = useMemo(() => {
    if (systemStatus === "paused") {
      return {
        variant: "destructive" as const,
        icon: <ShieldOff className="h-4 w-4" />,
        title: "System paused",
        description: "Calls are not being handled until you resume.",
      };
    }
    return {
      variant: "default" as const,
      icon: <ShieldCheck className="h-4 w-4" />,
      title: "System active",
      description: "AI receptionist is answering around the clock.",
    };
  }, [systemStatus]);

  const volumeData = useMemo(() => {
    if (!calls.length) return [] as { day: string; calls: number }[];
    const accumulator = new Map<string, number>();
    calls.forEach(call => {
      const date = new Date(call.timestamp);
      const key = date.toLocaleDateString("en-US", { weekday: "short" });
      accumulator.set(key, (accumulator.get(key) ?? 0) + 1);
    });
    return Array.from(accumulator.entries()).map(([day, count]) => ({ day, calls: count }));
  }, [calls]);

  const appointmentsData = useMemo(() => {
    // TODO: Replace with real appointments aggregation when backend is ready.
    return volumeData.map(entry => ({ day: entry.day, appts: Math.max(1, Math.round(entry.calls / 3)) }));
  }, [volumeData]);

  const tableRows = useMemo(() => {
    if (!calls.length) return [];
    return calls.map(call => ({
      ...call,
      time: new Date(call.timestamp).toLocaleString(),
      duration: call.duration_seconds ? `${call.duration_seconds.toString()}s` : "-",
    }));
  }, [calls]);

  if (!profile?.clinicId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">No clinic assigned</p>
          <p className="text-muted-foreground">Sign in with a clinic account to view the dashboard.</p>
          <Button variant="outline" onClick={() => setLocation("/")}>Return home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Clinic Dashboard</p>
            <h1 className="text-2xl font-semibold">{settings.name || "Clinic"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation("/clinic")}>Overview</Button>
            {isIndependent && (
              <Button variant="ghost" onClick={() => setLocation("/clinic/billing")}>Billing</Button>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section className="grid md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-4 w-4 text-emerald-300" /> System Status
              </CardTitle>
              <CardDescription>Kill switch for your clinic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className={systemStatus === "active" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-50" : "bg-amber-500/10 border-amber-500/40 text-amber-50"}>
                {statusBanner.icon}
                <AlertTitle>{statusBanner.title}</AlertTitle>
                <AlertDescription>{statusBanner.description}</AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleStatusChange("paused")}
                  disabled={systemStatus === "paused"}
                >
                  Stop system
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleStatusChange("active")}
                  disabled={systemStatus === "active"}
                >
                  Resume
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle>Calls today</CardTitle>
              <CardDescription>Snapshot of call volume</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">86</p>
              <p className="text-sm text-muted-foreground">+8 vs yesterday</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>AI-booked slots</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">17</p>
              <p className="text-sm text-muted-foreground">Week-to-date</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PhoneCall className="h-4 w-4 text-emerald-300" /> Call Logs
              </CardTitle>
              <CardDescription>Click a row to see transcript and AI summary.</CardDescription>
            </CardHeader>
            <CardContent>
              {!isSupabaseConfigured && (
                <p className="text-sm text-amber-400 mb-2">Supabase not configured. Provide keys to load real call logs.</p>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caller</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {callsLoading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Loading call history...
                      </TableCell>
                    </TableRow>
                  )}
                  {!callsLoading && tableRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        {callsError || "No calls yet"}
                      </TableCell>
                    </TableRow>
                  )}
                  {!callsLoading &&
                    tableRows.map(call => (
                      <TableRow key={call.id} className="hover:bg-white/5 cursor-pointer" onClick={() => setSelectedCall(call)}>
                        <TableCell>{call.caller}</TableCell>
                        <TableCell>{call.time}</TableCell>
                        <TableCell>{call.duration}</TableCell>
                        <TableCell>
                          <Badge variant={call.status === "answered" ? "default" : "secondary"}>{call.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Business profile and voice selection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={settings.name}
                  onChange={e => setSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Clinic name"
                />
              </div>
              <div className="space-y-2">
                <Label>Forwarding number</Label>
                <Input
                  value={settings.forwardingNumber}
                  onChange={e => setSettings(prev => ({ ...prev, forwardingNumber: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Voice</Label>
                <Select
                  value={settings.voice}
                  onValueChange={value => setSettings(prev => ({ ...prev, voice: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warm">Warm & friendly</SelectItem>
                    <SelectItem value="confident">Confident & concise</SelectItem>
                    <SelectItem value="bilingual">Bilingual assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={saveClinicSettings} disabled={savingSettings}>
                {savingSettings ? "Saving..." : "Save settings"}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle>Call volume</CardTitle>
              <CardDescription>Daily calls handled by the AI receptionist.</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <ChartTooltip />
                  <Bar dataKey="calls" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>AI-booked appointments over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={appointmentsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="appts" stroke="#22c55e" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      </main>

      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Call details</DialogTitle>
            <DialogDescription>Transcript and AI summary.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{selectedCall?.caller}</span>
              <Badge variant="outline">{selectedCall?.status}</Badge>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold text-white">AI Summary</p>
              <p className="text-sm text-muted-foreground">{selectedCall?.summary}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold text-white">Transcript</p>
              <p className="text-sm text-muted-foreground">{selectedCall?.transcript}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

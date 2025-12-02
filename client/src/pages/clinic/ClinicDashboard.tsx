import { useMemo, useState } from "react";
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
import { Bar, BarChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis, LineChart, Line, CartesianGrid } from "recharts";
import { PhoneCall, ShieldCheck, ShieldOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLES } from "@/const";

const callLogs = [
  { id: "1", caller: "+1 (555) 918-2211", time: "Today 9:14am", duration: "03:12", status: "answered", summary: "Booked cleaning for Tuesday", transcript: "Caller asked for availability next week" },
  { id: "2", caller: "+1 (555) 992-4433", time: "Today 8:05am", duration: "00:45", status: "missed", summary: "Left voicemail requesting callback", transcript: "No answer" },
  { id: "3", caller: "+1 (555) 320-8899", time: "Yesterday 4:20pm", duration: "04:45", status: "answered", summary: "Rescheduled consultation", transcript: "Caller needed to move appointment" },
];

const volumeData = [
  { day: "Mon", calls: 22 },
  { day: "Tue", calls: 30 },
  { day: "Wed", calls: 26 },
  { day: "Thu", calls: 32 },
  { day: "Fri", calls: 40 },
  { day: "Sat", calls: 18 },
  { day: "Sun", calls: 12 },
];

const appointmentsData = [
  { day: "Mon", appts: 5 },
  { day: "Tue", appts: 8 },
  { day: "Wed", appts: 6 },
  { day: "Thu", appts: 7 },
  { day: "Fri", appts: 9 },
  { day: "Sat", appts: 2 },
  { day: "Sun", appts: 1 },
];

export default function ClinicDashboard() {
  const { profile, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [systemStatus, setSystemStatus] = useState<"active" | "paused">("active");
  const [selectedCall, setSelectedCall] = useState<typeof callLogs[number] | null>(null);
  const [settings, setSettings] = useState({
    name: "Bright Smile Dental",
    forwardingNumber: "(555) 202-3030",
    voice: "warm",
  });

  const isIndependent = profile?.role === ROLES.independentClinic;

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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Clinic Dashboard</p>
            <h1 className="text-2xl font-semibold">{settings.name}</h1>
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
                  onClick={() => setSystemStatus("paused")}
                  disabled={systemStatus === "paused"}
                >
                  Stop system
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setSystemStatus("active")}
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
                  {callLogs.map(call => (
                    <TableRow key={call.id} className="hover:bg-white/5 cursor-pointer" onClick={() => setSelectedCall(call)}>
                      <TableCell>{call.caller}</TableCell>
                      <TableCell>{call.time}</TableCell>
                      <TableCell>{call.duration}</TableCell>
                      <TableCell>
                        <Badge variant={call.status === "answered" ? "default" : "secondary"}>
                          {call.status}
                        </Badge>
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
              <Button className="w-full">Save settings</Button>
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

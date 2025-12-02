import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { ArrowLeftRight, BarChart3, Clipboard, Loader2, Plus, Shield, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAgencyClinics, provisionManagedClinicUser } from "@/services/supabaseProfiles";
import { toast } from "sonner";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabaseClient";
import type { ClinicRow } from "@shared/supabase.types";
import { ArrowLeftRight, BarChart3, Clipboard, Plus, Shield, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { nanoid } from "nanoid";

interface AgencyClinic {
  id: string;
  name: string;
  ghlLocationId: string;
  phoneNumber: string;
  status: "Active" | "Paused";
  username: string;
}

const defaultClinics: AgencyClinic[] = [
  {
    id: "clinic-1",
    name: "Northside Dental",
    ghlLocationId: "ghl_12345",
    phoneNumber: "(555) 201-1200",
    status: "Active",
    username: "northside-admin",
  },
  {
    id: "clinic-2",
    name: "Bright Vision Eye Care",
    ghlLocationId: "ghl_55678",
    phoneNumber: "(555) 882-4411",
    status: "Paused",
    username: "bright-vision",
  },
];

const chartData = [
  { month: "Jan", calls: 320 },
  { month: "Feb", calls: 410 },
  { month: "Mar", calls: 380 },
  { month: "Apr", calls: 460 },
  { month: "May", calls: 520 },
  { month: "Jun", calls: 610 },
];

export default function AgencyDashboard() {
  const { profile, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [clinics, setClinics] = useState<AgencyClinic[]>(defaultClinics);
  const [newClinic, setNewClinic] = useState({
    name: "",
    ghlLocationId: "",
    phoneNumber: "",
    username: "",
    password: nanoid(10),
  });
  const [selectedClinic, setSelectedClinic] = useState<AgencyClinic | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  const addClinic = () => {
    if (!newClinic.name || !newClinic.username) return;
    const clinic: AgencyClinic = {
      id: nanoid(),
      name: newClinic.name,
      ghlLocationId: newClinic.ghlLocationId,
      phoneNumber: newClinic.phoneNumber,
      status: "Active",
      username: newClinic.username,
    };
    setClinics(prev => [...prev, clinic]);
    setOpenAddModal(false);
  };

  const deleteClinic = () => {
    if (!selectedClinic) return;
    setClinics(prev => prev.filter(c => c.id !== selectedClinic.id));
    setSelectedClinic(null);
    setShowDelete(false);
  };

  const handleImpersonate = (clinic: AgencyClinic) => {
    setLocation(`/clinic?impersonated=${clinic.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/60 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Agency Dashboard</p>
            <h1 className="text-2xl font-semibold">Welcome back{profile?.email ? `, ${profile.email}` : ""}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation("/agency")}>Overview</Button>
            <Button variant="ghost" onClick={() => setLocation("/agency/billing")}>Billing</Button>
            <Button variant="ghost" onClick={() => setLocation("/agency/settings")}>Settings</Button>
            <Separator orientation="vertical" className="h-6 bg-white/20" />
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section className="grid md:grid-cols-3 gap-4">
          <MetricCard title="Total Clinics" value={clinics.length.toString()} description="Managed across your agency" />
          <MetricCard title="Monthly Call Volume" value="3,200" description="Aggregated across clinics" />
          <MetricCard title="Revenue" value="$24,480" description="Placeholder until Paddle webhooks" />
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-slate-900/60 border-white/10">
            <CardHeader className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5 text-emerald-300" /> Call volume over time
              </CardTitle>
              <CardDescription>Aggregated calls across all clinics (demo data).</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <ChartTooltip />
                  <Bar dataKey="calls" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">System status</CardTitle>
              <CardDescription>Update stop/resume or branding in settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-emerald-500/10 border-emerald-500/40 text-emerald-50">
                <Shield className="h-4 w-4" />
                <AlertTitle>Active</AlertTitle>
                <AlertDescription>Your receptionist network is running.</AlertDescription>
              </Alert>
              <Button variant="outline" onClick={() => setLocation("/agency/settings")}>Manage system controls</Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Clinics</h2>
              <p className="text-sm text-muted-foreground">Manage managed and independent clinics.</p>
            </div>
            <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Clinic
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create a new clinic</DialogTitle>
                  <DialogDescription>
                    Capture clinic details and generate credentials for managed clinic users. Independent clinics should
                    use the self-serve signup flow.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="details">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="details">Clinic Details</TabsTrigger>
                    <TabsTrigger value="credentials">Credentials</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-4 pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Clinic Name</Label>
                        <Input
                          value={newClinic.name}
                          onChange={e =>
                            setNewClinic(prev => ({ ...prev, name: e.target.value, username: e.target.value.replace(/\s+/g, "-").toLowerCase() }))
                          }
                          placeholder="Northside Dental"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GHL Location ID</Label>
                        <Input
                          value={newClinic.ghlLocationId}
                          onChange={e => setNewClinic(prev => ({ ...prev, ghlLocationId: e.target.value }))}
                          placeholder="ghl_12345"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone number</Label>
                        <Input
                          value={newClinic.phoneNumber}
                          onChange={e => setNewClinic(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          placeholder="(555) 201-1200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Input value="Active" disabled />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="credentials" className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                      Share these credentials with the managed clinic admin. They can log in via the managed clinic
                      portal and will not see billing.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <CredentialField
                        label="Username"
                        value={newClinic.username}
                        onChange={value => setNewClinic(prev => ({ ...prev, username: value }))}
                      />
                      <CredentialField
                        label="Password"
                        value={newClinic.password}
                        onChange={value => setNewClinic(prev => ({ ...prev, password: value }))}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <Button onClick={addClinic} disabled={!newClinic.name || !newClinic.username}>
                    Save clinic & credentials
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-slate-900/60 border-white/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic Name</TableHead>
                  <TableHead>GHL Location ID</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinics.map(clinic => (
                  <TableRow key={clinic.id} className="hover:bg-white/5">
                    <TableCell>
                      <button className="text-left text-emerald-200 hover:underline" onClick={() => handleImpersonate(clinic)}>
                        {clinic.name}
                      </button>
                    </TableCell>
                    <TableCell>{clinic.ghlLocationId}</TableCell>
                    <TableCell>{clinic.phoneNumber}</TableCell>
                    <TableCell>
                      <Badge variant={clinic.status === "Active" ? "default" : "secondary"}>{clinic.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleImpersonate(clinic)}>
                        <ArrowLeftRight className="h-4 w-4 mr-1" /> View Dashboard
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          setSelectedClinic(clinic);
                          setShowDelete(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      </main>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete clinic?</DialogTitle>
            <DialogDescription>
              Are you sure? This will delete the clinic and revoke managed clinic access.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTitle>Destructive action</AlertTitle>
            <AlertDescription>
              This operation removes {selectedClinic?.name ?? "the clinic"} and all associated managed clinic logins.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteClinic}>
              Delete clinic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CredentialField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input value={value} onChange={e => onChange(e.target.value)} />
        <Button type="button" variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(value)}>
          <Clipboard className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="bg-slate-900/60 border-white/10">
      <CardHeader className="space-y-1">
        <CardDescription className="uppercase text-xs tracking-[0.2em] text-slate-400">{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
    </Card>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { useAgency } from "@/contexts/AgencyContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Check } from "lucide-react";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { agencyId, token, logout } = useAgency();
  const [vapiAssistantId, setVapiAssistantId] = useState("");
  const [ghlToken, setGhlToken] = useState("");
  const [customField, setCustomField] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!agencyId || !token) {
    setLocation("/login");
    return null;
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await api.saveSettings({
        agencyId,
        vapiAssistantId,
        ghlToken,
        customField,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.message || "Failed to save settings");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Settings Form */}
        <Card className="border border-border bg-card/50 backdrop-blur-sm p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Agency Configuration
            </h2>
            <p className="text-sm text-foreground/60">
              Update your Vapi and GHL integration settings
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Vapi Assistant ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Vapi Assistant ID
              </label>
              <Input
                type="text"
                placeholder="Enter your Vapi Assistant ID"
                value={vapiAssistantId}
                onChange={(e) => setVapiAssistantId(e.target.value)}
                disabled={loading}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="text-xs text-foreground/40">
                Found in your Vapi dashboard under integrations
              </p>
            </div>

            {/* GHL Token */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                GHL API Token
              </label>
              <Input
                type="password"
                placeholder="Enter your GHL API token"
                value={ghlToken}
                onChange={(e) => setGhlToken(e.target.value)}
                disabled={loading}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="text-xs text-foreground/40">
                Keep this secure. Never share your API token.
              </p>
            </div>

            {/* Custom Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Custom Configuration Field
              </label>
              <Input
                type="text"
                placeholder="Enter custom configuration"
                value={customField}
                onChange={(e) => setCustomField(e.target.value)}
                disabled={loading}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="text-xs text-foreground/40">
                Optional field for additional configuration
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                <p className="text-sm text-green-400">Settings saved successfully!</p>
              </div>
            )}

            {/* Save Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold h-11 rounded-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </form>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vapi Info */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              About Vapi Integration
            </h3>
            <p className="text-sm text-foreground/60 mb-4">
              Vapi enables AI-powered voice conversations for your agency. Connect your Vapi Assistant to power intelligent call handling.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-accent hover:text-accent"
            >
              Learn More
            </Button>
          </Card>

          {/* GHL Info */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              About GHL Integration
            </h3>
            <p className="text-sm text-foreground/60 mb-4">
              Go High Level (GHL) is a comprehensive CRM platform. Integrate with GHL to sync your contacts and manage campaigns.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-accent hover:text-accent"
            >
              Learn More
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}

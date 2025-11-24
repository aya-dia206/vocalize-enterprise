/**
 * API Layer for n8n webhook communication
 * Handles authentication, settings, and agency data
 */

const API_BASE = "https://primary-production-29a21.up.railway.app/webhook";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  agencyId: string;
  token: string;
  email: string;
  name?: string;
}

export interface SettingsData {
  agencyId: string;
  vapiAssistantId?: string;
  ghlToken?: string;
  customField?: string;
}

export interface SettingsResponse {
  success: boolean;
  message?: string;
}

export const api = {
  /**
   * Login with email and password
   * Returns agency ID and authentication token
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(`Login failed: ${res.statusText}`);
      }

      return res.json();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  /**
   * Save agency settings
   * Updates Vapi Assistant ID, GHL Token, and other configuration
   */
  saveSettings: async (data: SettingsData): Promise<SettingsResponse> => {
    try {
      const res = await fetch(`${API_BASE}/settings/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`Settings save failed: ${res.statusText}`);
      }

      return res.json();
    } catch (error) {
      console.error("Settings save error:", error);
      throw error;
    }
  },

  /**
   * Fetch agency data and metrics
   */
  getAgencyMetrics: async (
    agencyId: string,
    token: string
  ): Promise<{
    calls: number;
    spend: number;
    sentiment: number;
    bookings: number;
  }> => {
    try {
      const res = await fetch(`${API_BASE}/agency/${agencyId}/metrics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch metrics: ${res.statusText}`);
      }

      return res.json();
    } catch (error) {
      console.error("Metrics fetch error:", error);
      throw error;
    }
  },

  /**
   * Fetch activity feed data
   */
  getActivityFeed: async (
    agencyId: string,
    token: string
  ): Promise<
    Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
    }>
  > => {
    try {
      const res = await fetch(`${API_BASE}/agency/${agencyId}/activity`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch activity: ${res.statusText}`);
      }

      return res.json();
    } catch (error) {
      console.error("Activity fetch error:", error);
      throw error;
    }
  },
};

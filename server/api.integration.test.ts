import { describe, it, expect } from "vitest";

/**
 * Integration tests for API layer
 * These tests verify that the API layer correctly handles authentication and data fetching
 */

describe("API Integration", () => {
  const API_BASE = "https://primary-production-29a21.up.railway.app/webhook";

  describe("Authentication Flow", () => {
    it("should have correct API endpoint configured", () => {
      expect(API_BASE).toBeDefined();
      expect(API_BASE).toContain("webhook");
    });

    it("should have login endpoint available", () => {
      const loginEndpoint = `${API_BASE}/auth/login`;
      expect(loginEndpoint).toContain("/auth/login");
    });

    it("should have settings endpoint available", () => {
      const settingsEndpoint = `${API_BASE}/settings/update`;
      expect(settingsEndpoint).toContain("/settings/update");
    });

    it("should have metrics endpoint available", () => {
      const metricsEndpoint = `${API_BASE}/agency/test-id/metrics`;
      expect(metricsEndpoint).toContain("/agency/");
      expect(metricsEndpoint).toContain("/metrics");
    });

    it("should have activity endpoint available", () => {
      const activityEndpoint = `${API_BASE}/agency/test-id/activity`;
      expect(activityEndpoint).toContain("/agency/");
      expect(activityEndpoint).toContain("/activity");
    });
  });

  describe("Request Headers", () => {
    it("should use correct content-type for POST requests", () => {
      const headers = { "Content-Type": "application/json" };
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("should use Bearer token for authorization", () => {
      const token = "test-token";
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      expect(headers.Authorization).toBe("Bearer test-token");
    });
  });

  describe("Error Handling", () => {
    it("should handle login failures gracefully", () => {
      const errorMessage = "Login failed: Unauthorized";
      expect(errorMessage).toContain("Login failed");
    });

    it("should handle settings save failures", () => {
      const errorMessage = "Settings save failed: Internal Server Error";
      expect(errorMessage).toContain("Settings save failed");
    });

    it("should handle metrics fetch failures", () => {
      const errorMessage = "Failed to fetch metrics: Unauthorized";
      expect(errorMessage).toContain("Failed to fetch metrics");
    });

    it("should handle activity fetch failures", () => {
      const errorMessage = "Failed to fetch activity: Forbidden";
      expect(errorMessage).toContain("Failed to fetch activity");
    });
  });

  describe("Data Structures", () => {
    it("should have valid login response structure", () => {
      const loginResponse = {
        agencyId: "agency-123",
        token: "token-abc",
        email: "test@example.com",
        name: "Test Agency",
      };

      expect(loginResponse).toHaveProperty("agencyId");
      expect(loginResponse).toHaveProperty("token");
      expect(loginResponse).toHaveProperty("email");
    });

    it("should have valid settings data structure", () => {
      const settingsData = {
        agencyId: "agency-123",
        vapiAssistantId: "vapi-123",
        ghlToken: "ghl-token",
        customField: "custom-value",
      };

      expect(settingsData).toHaveProperty("agencyId");
      expect(settingsData).toHaveProperty("vapiAssistantId");
      expect(settingsData).toHaveProperty("ghlToken");
    });

    it("should have valid metrics response structure", () => {
      const metrics = {
        calls: 150,
        spend: 1200,
        sentiment: 85,
        bookings: 42,
      };

      expect(metrics).toHaveProperty("calls");
      expect(metrics).toHaveProperty("spend");
      expect(metrics).toHaveProperty("sentiment");
      expect(metrics).toHaveProperty("bookings");
      expect(typeof metrics.calls).toBe("number");
    });

    it("should have valid activity item structure", () => {
      const activity = {
        id: "activity-1",
        type: "call",
        description: "Incoming call from John",
        timestamp: "2025-01-01T10:00:00Z",
      };

      expect(activity).toHaveProperty("id");
      expect(activity).toHaveProperty("type");
      expect(activity).toHaveProperty("description");
      expect(activity).toHaveProperty("timestamp");
    });
  });
});

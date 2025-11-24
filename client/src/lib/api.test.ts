import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./api";

// Mock fetch globally
global.fetch = vi.fn();

describe("API Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("api.login", () => {
    it("should successfully login with valid credentials", async () => {
      const mockResponse = {
        agencyId: "agency-123",
        token: "token-abc",
        email: "test@example.com",
        name: "Test Agency",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.login("test@example.com", "password");

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("should throw error on login failure", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      });

      await expect(api.login("test@example.com", "wrong")).rejects.toThrow(
        "Login failed"
      );
    });
  });

  describe("api.saveSettings", () => {
    it("should successfully save settings", async () => {
      const mockResponse = {
        success: true,
        message: "Settings saved",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.saveSettings({
        agencyId: "agency-123",
        vapiAssistantId: "vapi-123",
        ghlToken: "ghl-token",
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/settings/update"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("should throw error on settings save failure", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(
        api.saveSettings({
          agencyId: "agency-123",
        })
      ).rejects.toThrow("Settings save failed");
    });
  });

  describe("api.getAgencyMetrics", () => {
    it("should fetch agency metrics with valid token", async () => {
      const mockMetrics = {
        calls: 150,
        spend: 1200,
        sentiment: 85,
        bookings: 42,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetrics,
      });

      const result = await api.getAgencyMetrics("agency-123", "token-abc");

      expect(result).toEqual(mockMetrics);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/agency/agency-123/metrics"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer token-abc",
          }),
        })
      );
    });

    it("should throw error on metrics fetch failure", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      });

      await expect(
        api.getAgencyMetrics("agency-123", "invalid-token")
      ).rejects.toThrow("Failed to fetch metrics");
    });
  });

  describe("api.getActivityFeed", () => {
    it("should fetch activity feed with valid token", async () => {
      const mockActivity = [
        {
          id: "activity-1",
          type: "call",
          description: "Incoming call from John",
          timestamp: "2025-01-01T10:00:00Z",
        },
        {
          id: "activity-2",
          type: "booking",
          description: "New appointment booked",
          timestamp: "2025-01-01T09:30:00Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivity,
      });

      const result = await api.getActivityFeed("agency-123", "token-abc");

      expect(result).toEqual(mockActivity);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/agency/agency-123/activity"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer token-abc",
          }),
        })
      );
    });

    it("should throw error on activity fetch failure", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: "Forbidden",
      });

      await expect(
        api.getActivityFeed("agency-123", "invalid-token")
      ).rejects.toThrow("Failed to fetch activity");
    });
  });
});

import { describe, expect, it } from "vitest";
import { ROLES } from "@/const";
import { canAccessClinicBilling, guardAgencyRoute, guardClinicRoute } from "@/lib/access";

describe("access guards", () => {
  it("blocks clinic billing for managed clinics", () => {
    const result = guardClinicRoute("/clinic/billing", ROLES.managedClinic);
    expect(result.allowed).toBe(false);
    expect(result.redirect).toBe("/clinic");
  });

  it("allows independent clinics to billing", () => {
    const result = guardClinicRoute("/clinic/billing", ROLES.independentClinic);
    expect(result.allowed).toBe(true);
  });

  it("blocks agency users from clinic space", () => {
    const result = guardClinicRoute("/clinic", ROLES.agencyAdmin);
    expect(result.allowed).toBe(false);
    expect(result.redirect).toBe("/");
  });

  it("protects agency routes", () => {
    const anon = guardAgencyRoute(null);
    expect(anon.allowed).toBe(false);
    expect(anon.redirect).toBe("/auth/agency-login");

    const clinic = guardAgencyRoute(ROLES.independentClinic);
    expect(clinic.allowed).toBe(false);
  });

  it("supports the billing convenience helper", () => {
    expect(canAccessClinicBilling(ROLES.independentClinic)).toBe(true);
    expect(canAccessClinicBilling(ROLES.managedClinic)).toBe(false);
  });
});

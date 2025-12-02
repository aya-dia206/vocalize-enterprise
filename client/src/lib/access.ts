import { ROLES, type UserRole } from "@/const";

export function canAccessClinicBilling(role: UserRole | null) {
  return role === ROLES.independentClinic;
}

export function canAccessAgency(path: string, role: UserRole | null) {
  if (!role) return false;
  if (path.startsWith("/agency")) {
    return role === ROLES.agencyAdmin;
  }
  return true;
}

export function guardClinicRoute(path: string, role: UserRole | null) {
  if (!role) return { allowed: false, redirect: "/auth/clinic-login" } as const;
  if (path.startsWith("/clinic/billing") && role !== ROLES.independentClinic) {
    return { allowed: false, redirect: "/clinic" } as const;
  }
  if (path.startsWith("/clinic") && ![ROLES.independentClinic, ROLES.managedClinic].includes(role)) {
    return { allowed: false, redirect: "/" } as const;
  }
  return { allowed: true } as const;
}

export function guardAgencyRoute(role: UserRole | null) {
  if (!role || role !== ROLES.agencyAdmin) {
    return { allowed: false, redirect: "/auth/agency-login" } as const;
  }
  return { allowed: true } as const;
}

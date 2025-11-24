import { useState, useCallback } from "react";

export interface Clinic {
  id: string;
  name: string;
  email?: string;
}

/**
 * Hook for managing clinic/agency selection
 * Simulates fetching available clinics from the backend
 */
export const useClinicSwitcher = () => {
  const [clinics] = useState<Clinic[]>([
    { id: "clinic-1", name: "Downtown Clinic", email: "downtown@clinic.com" },
    { id: "clinic-2", name: "Uptown Clinic", email: "uptown@clinic.com" },
    { id: "clinic-3", name: "Westside Clinic", email: "westside@clinic.com" },
  ]);

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(
    clinics[0] || null
  );

  const switchClinic = useCallback((clinicId: string) => {
    const clinic = clinics.find((c) => c.id === clinicId);
    if (clinic) {
      setSelectedClinic(clinic);
    }
  }, [clinics]);

  return {
    clinics,
    selectedClinic,
    switchClinic,
  };
};

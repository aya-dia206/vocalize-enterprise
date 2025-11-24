import React, { createContext, useContext, useState, useCallback } from "react";

export interface Agency {
  id: string;
  name?: string;
  email?: string;
}

export interface AgencyContextType {
  agencyId: string | null;
  token: string | null;
  agency: Agency | null;
  login: (agencyId: string, token: string, agency: Agency) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export const AgencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [agencyId, setAgencyId] = useState<string | null>(() => {
    return localStorage.getItem("agencyId");
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [agency, setAgency] = useState<Agency | null>(() => {
    const stored = localStorage.getItem("agency");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(
    (newAgencyId: string, newToken: string, newAgency: Agency) => {
      setAgencyId(newAgencyId);
      setToken(newToken);
      setAgency(newAgency);

      localStorage.setItem("agencyId", newAgencyId);
      localStorage.setItem("token", newToken);
      localStorage.setItem("agency", JSON.stringify(newAgency));
    },
    []
  );

  const logout = useCallback(() => {
    setAgencyId(null);
    setToken(null);
    setAgency(null);

    localStorage.removeItem("agencyId");
    localStorage.removeItem("token");
    localStorage.removeItem("agency");
  }, []);

  const value: AgencyContextType = {
    agencyId,
    token,
    agency,
    login,
    logout,
    isAuthenticated: !!agencyId && !!token,
  };

  return (
    <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>
  );
};

export const useAgency = (): AgencyContextType => {
  const context = useContext(AgencyContext);
  if (context === undefined) {
    throw new Error("useAgency must be used within an AgencyProvider");
  }
  return context;
};

import { useState } from "react";
import { useLocation } from "wouter";
import { useClinicSwitcher } from "@/hooks/useClinicSwitcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const [, setLocation] = useLocation();
  const { clinics, selectedClinic, switchClinic } = useClinicSwitcher();
  const [open, setOpen] = useState(false);

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Vocalize</h1>
        </div>

        {/* Clinic Switcher */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10"
            >
              <span className="truncate text-sm">
                {selectedClinic?.name || "Select clinic..."}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search clinics..." />
              <CommandEmpty>No clinic found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {clinics.map((clinic) => (
                    <CommandItem
                      key={clinic.id}
                      value={clinic.id}
                      onSelect={(currentValue) => {
                        switchClinic(currentValue);
                        setOpen(false);
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{clinic.name}</span>
                        {clinic.email && (
                          <span className="text-xs text-foreground/60">
                            {clinic.email}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;

          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-foreground/70 hover:text-foreground hover:bg-white/10",
                isActive && "bg-accent/10 text-accent hover:bg-accent/20"
              )}
              onClick={() => setLocation(item.href)}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-foreground/70 hover:text-foreground"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}

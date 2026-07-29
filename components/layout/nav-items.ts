import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Gauge,
  Home,
  NotebookPen,
  Settings,
  ShieldCheck,
  Zap
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/check-in", label: "Check-in", icon: ClipboardCheck },
  { href: "/erp", label: "ERP", icon: ShieldCheck },
  { href: "/episodes", label: "Episodes", icon: Gauge },
  { href: "/triggers", label: "Triggers", icon: Zap },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/settings", label: "Settings", icon: Settings }
] as const;

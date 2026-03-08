import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  ClipboardCheck,
  BarChart3,
  FileText,
  DollarSign,
  PieChart,
  Library,
  Bus,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Calendar,
  FileSpreadsheet,
  Heart,
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import LockedFeatureModal from "@/components/layout/LockedFeatureModal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const allMenuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", plans: ["starter", "pro", "enterprise"] },
  { label: "Students", icon: Users, href: "/students", plans: ["starter", "pro", "enterprise"] },
  { label: "Teachers", icon: GraduationCap, href: "/teachers", plans: ["starter", "pro", "enterprise"] },
  { label: "Classes", icon: Layers, href: "/classes", plans: ["starter", "pro", "enterprise"] },
  { label: "Subjects", icon: BookOpen, href: "/subjects", plans: ["starter", "pro", "enterprise"] },
  { label: "Announcements", icon: Bell, href: "/announcements", plans: ["starter", "pro", "enterprise"] },
  { label: "Timetable", icon: Calendar, href: "/timetable", plans: ["pro", "enterprise"] },
  { label: "Attendance", icon: ClipboardCheck, href: "/attendance", plans: ["pro", "enterprise"] },
  { label: "Grades", icon: BarChart3, href: "/grades", plans: ["pro", "enterprise"] },
  { label: "Exams", icon: FileSpreadsheet, href: "/exams", plans: ["pro", "enterprise"] },
  { label: "Report Cards", icon: FileText, href: "/report-cards", plans: ["pro", "enterprise"] },
  { label: "Fees", icon: DollarSign, href: "/fees", plans: ["pro", "enterprise"] },
  { label: "Finance", icon: PieChart, href: "/finance-dashboard", plans: ["pro", "enterprise"] },
  { label: "Parent Portal", icon: Heart, href: "/parent-portal", plans: ["pro", "enterprise"] },
  { label: "Library", icon: Library, href: "/library", plans: ["enterprise"] },
  { label: "Transport", icon: Bus, href: "/transport", plans: ["enterprise"] },
  { label: "Settings", icon: Settings, href: "/settings", plans: ["starter", "pro", "enterprise"] },
];

const planLabel: Record<string, string> = {
  starter: "Pro",
  pro: "Enterprise",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lockedModal, setLockedModal] = useState<{ name: string; plan: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, roles, signOut, subscriptionPlan } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const schoolName = profile?.full_name ? `${profile.full_name}'s School` : "My School";
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";
  const primaryRole = roles[0] ?? "user";
  const displayRole = primaryRole.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const isLocked = (item: typeof allMenuItems[0]) =>
    subscriptionPlan ? !item.plans.includes(subscriptionPlan) : false;

  const upgradeTo = subscriptionPlan ? planLabel[subscriptionPlan] : null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen flex bg-background">
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        <aside
          className={cn(
            "fixed top-0 left-0 h-full z-50 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col",
            collapsed ? "w-[68px]" : "w-64",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="ml-3 font-display font-bold text-lg text-sidebar-primary-foreground">EduERP</span>
            )}
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {allMenuItems.map((item) => {
              const locked = isLocked(item);
              const isActive = !locked && location.pathname === item.href;

              if (locked) {
                const requiredPlan = item.plans[0] === "pro" ? "Pro" : "Enterprise";
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setLockedModal({ name: item.label, plan: requiredPlan })}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium opacity-50 hover:opacity-70 transition-opacity w-full text-left",
                          "text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          </>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs">Upgrade to <span className="font-semibold">{requiredPlan}</span> to unlock</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-sidebar-border space-y-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border items-center justify-center shadow-sm hover:bg-muted transition-colors"
          >
            <ChevronLeft className={cn("w-3 h-3 text-muted-foreground transition-transform", collapsed && "rotate-180")} />
          </button>
        </aside>

        <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "lg:ml-[68px]" : "lg:ml-64")}>
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden">
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h2 className="font-display font-semibold text-sm">{profile?.full_name ?? "Loading…"}</h2>
                <p className="text-xs text-muted-foreground">{displayRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                {initials}
              </div>
            </div>
          </header>

          {/* Upgrade Banner */}
          {upgradeTo && (
            <div className="mx-6 mt-4">
              <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 px-5 py-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Unlock more with {upgradeTo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {upgradeTo === "Pro"
                      ? "Get timetable, attendance, grades, exams, fees & parent portal."
                      : "Get library management, transport tracking & everything in Pro."}
                  </p>
                </div>
                <Link
                  to="/#pricing"
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline flex-shrink-0"
                >
                  Upgrade <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardLayout;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import PageLoader from "@/components/ui/page-loader";

// Eagerly loaded (landing, auth - first paint)
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";

// Lazy loaded (dashboard pages)
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SignupSchool = lazy(() => import("./pages/SignupSchool"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Students = lazy(() => import("./pages/Students"));
const Teachers = lazy(() => import("./pages/Teachers"));
const Classes = lazy(() => import("./pages/Classes"));
const Subjects = lazy(() => import("./pages/Subjects"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Grades = lazy(() => import("./pages/Grades"));
const ReportCards = lazy(() => import("./pages/ReportCards"));
const Fees = lazy(() => import("./pages/Fees"));
const FinanceDashboard = lazy(() => import("./pages/FinanceDashboard"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const Transport = lazy(() => import("./pages/Transport"));
const Announcements = lazy(() => import("./pages/Announcements"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const ParentPortal = lazy(() => import("./pages/ParentPortal"));
const Timetable = lazy(() => import("./pages/Timetable"));
const ExamManagement = lazy(() => import("./pages/ExamManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UpgradePlan = lazy(() => import("./pages/UpgradePlan"));
const InviteUsers = lazy(() => import("./pages/InviteUsers"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const Messages = lazy(() => import("./pages/Messages"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/signup-school" element={<SignupSchool />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
              <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
              <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
              <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
              <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
              <Route path="/report-cards" element={<ProtectedRoute><ReportCards /></ProtectedRoute>} />
              <Route path="/fees" element={<ProtectedRoute allowedRoles={["school_admin", "accountant"]}><Fees /></ProtectedRoute>} />
              <Route path="/finance-dashboard" element={<ProtectedRoute allowedRoles={["school_admin", "accountant"]}><FinanceDashboard /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
              <Route path="/transport" element={<ProtectedRoute><Transport /></ProtectedRoute>} />
              <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/parent-portal" element={<ProtectedRoute allowedRoles={["school_admin", "parent"]}><ParentPortal /></ProtectedRoute>} />
              <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
              <Route path="/exams" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
              <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={["super_admin"]}><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/upgrade" element={<ProtectedRoute><UpgradePlan /></ProtectedRoute>} />
              <Route path="/invite-users" element={<ProtectedRoute allowedRoles={["school_admin"]}><InviteUsers /></ProtectedRoute>} />
              <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={["school_admin"]}><AuditLogs /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

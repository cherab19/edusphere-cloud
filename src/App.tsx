import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SignupSchool from "./pages/SignupSchool";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";
import ReportCards from "./pages/ReportCards";
import Fees from "./pages/Fees";
import FinanceDashboard from "./pages/FinanceDashboard";
import LibraryPage from "./pages/LibraryPage";
import Transport from "./pages/Transport";
import Announcements from "./pages/Announcements";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Settings from "./pages/Settings";
import ParentPortal from "./pages/ParentPortal";
import Timetable from "./pages/Timetable";
import ExamManagement from "./pages/ExamManagement";
import NotFound from "./pages/NotFound";
import UpgradePlan from "./pages/UpgradePlan";

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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/signup-school" element={<SignupSchool />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
            <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
            <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
            <Route path="/report-cards" element={<ProtectedRoute><ReportCards /></ProtectedRoute>} />
            <Route path="/fees" element={<ProtectedRoute><Fees /></ProtectedRoute>} />
            <Route path="/finance-dashboard" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
            <Route path="/transport" element={<ProtectedRoute><Transport /></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/parent-portal" element={<ProtectedRoute><ParentPortal /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
            <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={["super_admin"]}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/upgrade" element={<ProtectedRoute><UpgradePlan /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

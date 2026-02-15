import { GraduationCap, School, User, Mail, Lock, ArrowRight, ArrowLeft, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const plans = [
  { id: "starter", name: "Starter", price: "2,500 ETB/mo", features: ["Up to 200 students", "Basic modules"] },
  { id: "pro", name: "Pro", price: "5,000 ETB/mo", features: ["Up to 1,000 students", "Full ERP"] },
  { id: "enterprise", name: "Enterprise", price: "12,000 ETB/mo", features: ["Unlimited students", "Analytics"] },
];

const SignupSchool = () => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [schoolName, setSchoolName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const { toast } = useToast();

  // Already fully onboarded
  if (session && profile) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Step 3: Create account + school + profile + role + subscription
    setLoading(true);
    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password,
        options: { emailRedirectTo: window.location.origin },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed");

      const userId = authData.user.id;

      // 2. Create school
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .insert({ name: schoolName, email: schoolEmail || adminEmail, phone: schoolPhone })
        .select("id")
        .single();

      if (schoolError) throw schoolError;

      const schoolId = schoolData.id;

      // 3. Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ user_id: userId, school_id: schoolId, full_name: adminName });

      if (profileError) throw profileError;

      // 4. Assign school_admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "school_admin" });

      if (roleError) throw roleError;

      // 5. Create subscription
      const { error: subError } = await supabase
        .from("subscriptions")
        .insert({ school_id: schoolId, plan: selectedPlan as any, status: "trialing" });

      if (subError) throw subError;

      toast({
        title: "School registered!",
        description: "Please check your email to verify your account before signing in.",
      });

      // Sign out since email verification is required
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl text-primary-foreground">
              EduERP<span className="text-primary">Cloud</span>
            </span>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  s <= step ? "bg-primary text-primary-foreground" : "bg-primary-foreground/20 text-primary-foreground/40"
                }`}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-primary" : "bg-primary-foreground/20"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-center mb-1">Choose a Plan</h2>
                <p className="text-muted-foreground text-center text-sm mb-6">Select the plan that fits your school</p>
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        selectedPlan === plan.id
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">{plan.features.join(" • ")}</p>
                        </div>
                        <p className="font-display font-bold text-primary">{plan.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-center mb-1">School & Admin Details</h2>
                <p className="text-muted-foreground text-center text-sm mb-6">Tell us about your institution</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>School Name</Label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Addis Ababa Academy" className="pl-10 h-11 rounded-xl" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>School Phone (optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="+251 911 234 567" className="pl-10 h-11 rounded-xl" value={schoolPhone} onChange={(e) => setSchoolPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="John Doe" className="pl-10 h-11 rounded-xl" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="email" placeholder="admin@school.com" className="pl-10 h-11 rounded-xl" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10 h-11 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-5 text-center">
                <h2 className="font-display text-xl font-bold mb-1">Confirm & Register</h2>
                <p className="text-muted-foreground text-sm mb-6">Review your details and create your account</p>
                <div className="p-6 rounded-xl bg-muted space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Plan</p>
                    <p className="font-display text-2xl font-bold text-primary capitalize">{selectedPlan}</p>
                    <p className="text-sm text-muted-foreground">{plans.find(p => p.id === selectedPlan)?.price}</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground">School</p>
                    <p className="font-semibold">{schoolName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Admin</p>
                    <p className="font-semibold">{adminName} ({adminEmail})</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              <Button type="submit" className="flex-1 h-11 rounded-xl" disabled={loading}>
                {step === 3 ? (loading ? "Creating…" : "Create Account") : "Continue"} {step < 3 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupSchool;

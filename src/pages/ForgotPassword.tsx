import { GraduationCap, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl text-primary-foreground">
              EduERP<span className="text-primary">Cloud</span>
            </span>
          </Link>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold">Check your email</h1>
              <p className="text-muted-foreground text-sm">
                We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
              </p>
              <Link to="/login">
                <Button variant="outline" className="mt-4 rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-center mb-2">Forgot password?</h1>
              <p className="text-muted-foreground text-center text-sm mb-8">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@school.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl text-base" disabled={loading}>
                  {loading ? "Sending…" : "Send Reset Link"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

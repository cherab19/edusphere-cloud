import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange the token fragment for a session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          navigate("/login", { replace: true });
          return;
        }

        if (session) {
          // Accept invitation if applicable
          const meta = session.user.user_metadata;
          if (meta?.invited_school_id && meta?.invited_role) {
            await supabase.rpc("accept_invitation", {
              _user_id: session.user.id,
              _email: session.user.email!,
            });
          }
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Callback processing error:", err);
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

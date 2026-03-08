import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = "super_admin" | "school_admin" | "teacher" | "student" | "parent" | "accountant" | "staff";
type SubscriptionPlan = "starter" | "pro" | "enterprise";

interface Profile {
  id: string;
  user_id: string;
  school_id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  schoolId: string | null;
  subscriptionPlan: SubscriptionPlan | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  roles: [],
  schoolId: null,
  subscriptionPlan: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      if (profileRes.data) {
        const p = profileRes.data as unknown as Profile;
        setProfile(p);

        // Fetch subscription for the school
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("plan")
          .eq("school_id", p.school_id)
          .single();

        if (subData) {
          setSubscriptionPlan(subData.plan as SubscriptionPlan);
        }
      }
      if (rolesRes.data) {
        setRoles(rolesRes.data.map((r: any) => r.role as AppRole));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setProfile(null);
          setRoles([]);
          setSubscriptionPlan(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
    setSubscriptionPlan(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        roles,
        schoolId: profile?.school_id ?? null,
        subscriptionPlan,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

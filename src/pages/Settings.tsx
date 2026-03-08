import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { School, Phone, Mail, MapPin, Save, Check, Crown, Upload, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SchoolData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
}

const plans = [
  { id: "starter", name: "Starter", price: "2,500 ETB/mo", features: ["Up to 200 students", "Basic modules", "Email support"] },
  { id: "pro", name: "Pro", price: "5,000 ETB/mo", features: ["Up to 1,000 students", "Full ERP modules", "Priority support"] },
  { id: "enterprise", name: "Enterprise", price: "12,000 ETB/mo", features: ["Unlimited students", "Advanced analytics", "Dedicated support"] },
];

const Settings = () => {
  const { schoolId } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: school, isLoading: schoolLoading } = useQuery({
    queryKey: ["school_settings", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      const { data, error } = await supabase.from("schools").select("*").eq("id", schoolId).single();
      if (error) throw error;
      return data as SchoolData;
    },
    enabled: !!schoolId,
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      const { data, error } = await supabase.from("subscriptions").select("*").eq("school_id", schoolId).single();
      if (error) throw error;
      return data as Subscription;
    },
    enabled: !!schoolId,
  });

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (school) {
      setForm({
        name: school.name,
        email: school.email,
        phone: school.phone ?? "",
        address: school.address ?? "",
      });
    }
  }, [school]);

  const updateSchool = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("schools")
        .update({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          address: form.address || null,
        })
        .eq("id", schoolId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["school_settings"] });
      toast({ title: "Settings saved", description: "School information updated successfully." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !schoolId) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${schoolId}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("school-logos")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("school-logos")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("schools")
        .update({ logo_url: publicUrl })
        .eq("id", schoolId);
      if (updateError) throw updateError;

      qc.invalidateQueries({ queryKey: ["school_settings"] });
      toast({ title: "Logo uploaded", description: "Your school logo has been updated." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const updatePlan = useMutation({
    mutationFn: async (plan: string) => {
      if (!subscription) return;
      const { error } = await supabase
        .from("subscriptions")
        .update({ plan: plan as any })
        .eq("id", subscription.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
      toast({ title: "Plan updated", description: "Your subscription plan has been changed." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "trialing": return "bg-amber-500/10 text-amber-600 border-amber-200";
      default: return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your school information and subscription</p>
        </div>

        <Tabs defaultValue="school">
          <TabsList className="rounded-xl">
            <TabsTrigger value="school" className="rounded-lg">School Info</TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-lg">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="school" className="mt-6 space-y-6">
            {/* Logo Upload */}
            <Card className="p-6 rounded-xl shadow-card">
              <h3 className="font-display font-semibold text-lg mb-4">School Logo</h3>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                  {school?.logo_url ? (
                    <img src={school.logo_url} alt="School logo" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Button
                    variant="outline"
                    className="rounded-xl gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading…" : "Upload Logo"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">PNG, JPG, or SVG. Max 2MB.</p>
                </div>
              </div>
            </Card>

            {/* School Info Form */}
            <Card className="p-6 rounded-xl shadow-card">
              <h3 className="font-display font-semibold text-lg mb-6">School Information</h3>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 h-11 rounded-xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" className="pl-10 h-11 rounded-xl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 h-11 rounded-xl" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea className="pl-10 rounded-xl min-h-[80px]" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                </div>
                <Button className="rounded-xl gap-2" onClick={() => updateSchool.mutate()} disabled={updateSchool.isPending || !form.name}>
                  {updateSchool.isPending ? "Saving…" : <><Save className="w-4 h-4" /> Save Changes</>}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="mt-6 space-y-6">
            {subscription && (
              <Card className="p-6 rounded-xl shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg">Current Plan</h3>
                  <Badge className={`${statusColor(subscription.status)} capitalize`}>{subscription.status}</Badge>
                </div>
                <p className="text-2xl font-display font-bold text-primary capitalize mb-1">{subscription.plan}</p>
                <p className="text-sm text-muted-foreground">
                  Period: {new Date(subscription.current_period_start).toLocaleDateString()} – {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isCurrent = subscription?.plan === plan.id;
                return (
                  <Card key={plan.id} className={`p-5 rounded-xl shadow-card transition-all ${isCurrent ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40"}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="w-4 h-4 text-primary" />
                      <h4 className="font-display font-semibold">{plan.name}</h4>
                    </div>
                    <p className="font-display text-xl font-bold text-primary mb-3">{plan.price}</p>
                    <ul className="space-y-1.5 mb-5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={isCurrent ? "outline" : "default"}
                      className="w-full rounded-xl"
                      disabled={isCurrent || updatePlan.isPending}
                      onClick={() => updatePlan.mutate(plan.id)}
                    >
                      {isCurrent ? "Current Plan" : "Switch Plan"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

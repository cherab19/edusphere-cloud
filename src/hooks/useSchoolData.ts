import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function useSchoolQuery<T>(
  key: string,
  table: string,
  options?: { select?: string; orderBy?: string }
) {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: [key, schoolId],
    queryFn: async () => {
      if (!schoolId) return [] as T[];
      const { data, error } = await (supabase as any)
        .from(table)
        .select(options?.select ?? "*")
        .eq("school_id", schoolId)
        .order(options?.orderBy ?? "created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
    enabled: !!schoolId,
  });
}

export function useSchoolMutation(table: string, key: string) {
  const qc = useQueryClient();
  const { schoolId } = useAuth();

  const insert = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const { error } = await (supabase as any).from(table).insert({ ...values, school_id: schoolId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      toast({ title: "Created successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...values }: Record<string, any>) => {
      const { error } = await (supabase as any).from(table).update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      toast({ title: "Updated successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      toast({ title: "Deleted successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return { insert, update, remove };
}

import { supabase } from "@/integrations/supabase/client";

export async function logAudit(params: {
  schoolId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
}) {
  await (supabase as any).from("audit_logs").insert({
    school_id: params.schoolId,
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    details: params.details ?? {},
  });
}

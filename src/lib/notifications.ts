import { supabase } from "@/integrations/supabase/client";

interface SendNotificationParams {
  schoolId: string;
  title: string;
  message: string;
  type: "announcement" | "fee_reminder" | "attendance" | "grade" | "general";
  link?: string;
  targetUserIds?: string[];
}

/**
 * Send in-app notifications to users.
 * If targetUserIds is provided, sends to those specific users.
 * Otherwise, sends to all users in the school (via profiles table).
 */
export async function sendNotification({ schoolId, title, message, type, link, targetUserIds }: SendNotificationParams) {
  let userIds = targetUserIds;

  if (!userIds || userIds.length === 0) {
    // Get all users in the school
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("school_id", schoolId);
    userIds = profiles?.map((p) => p.user_id) ?? [];
  }

  if (userIds.length === 0) return;

  const notifications = userIds.map((userId) => ({
    school_id: schoolId,
    user_id: userId,
    title,
    message,
    type,
    link: link ?? null,
  }));

  const { error } = await supabase.from("notifications").insert(notifications);
  if (error) {
    console.error("Failed to send notifications:", error);
    throw error;
  }
}

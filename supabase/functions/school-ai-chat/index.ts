import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Authenticate user
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Get school ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("user_id", user.id)
      .single();
    if (!profile) throw new Error("No school profile found");
    const schoolId = profile.school_id;

    const { messages } = await req.json();

    // Fetch school context data in parallel
    const [studentsRes, teachersRes, attendanceRes, feesRes, gradesRes, classesRes] = await Promise.all([
      supabase.from("students").select("id, full_name, gender, grade_class").eq("school_id", schoolId),
      supabase.from("teachers").select("id, full_name, subject_specialty").eq("school_id", schoolId),
      supabase.from("attendance").select("id, student_id, status, date").eq("school_id", schoolId).gte("date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]),
      supabase.from("fees").select("id, student_id, total_due, paid_amount, status").eq("school_id", schoolId),
      supabase.from("grades").select("id, student_id, score, exam_type, subject_id").eq("school_id", schoolId),
      supabase.from("classes").select("id, name, grade_level").eq("school_id", schoolId),
    ]);

    const students = studentsRes.data ?? [];
    const teachers = teachersRes.data ?? [];
    const attendance = attendanceRes.data ?? [];
    const fees = feesRes.data ?? [];
    const grades = gradesRes.data ?? [];
    const classes = classesRes.data ?? [];

    // Build attendance summary per student (last 30 days)
    const attendanceSummary: Record<string, { present: number; absent: number; total: number }> = {};
    for (const a of attendance) {
      if (!attendanceSummary[a.student_id]) attendanceSummary[a.student_id] = { present: 0, absent: 0, total: 0 };
      attendanceSummary[a.student_id].total++;
      if (a.status === "present") attendanceSummary[a.student_id].present++;
      else attendanceSummary[a.student_id].absent++;
    }

    const lowAttendanceStudents = students
      .filter((s) => {
        const summary = attendanceSummary[s.id];
        return summary && summary.total > 0 && (summary.present / summary.total) < 0.75;
      })
      .map((s) => {
        const summary = attendanceSummary[s.id];
        return `${s.full_name} (${s.grade_class || "N/A"}) - ${Math.round((summary.present / summary.total) * 100)}% attendance`;
      });

    // Grade averages per student
    const gradeMap: Record<string, number[]> = {};
    for (const g of grades) {
      if (!gradeMap[g.student_id]) gradeMap[g.student_id] = [];
      gradeMap[g.student_id].push(g.score);
    }

    const topPerformers = students
      .map((s) => {
        const scores = gradeMap[s.id];
        if (!scores || scores.length === 0) return null;
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return { name: s.full_name, grade_class: s.grade_class, avg };
      })
      .filter(Boolean)
      .sort((a, b) => b!.avg - a!.avg)
      .slice(0, 10)
      .map((s) => `${s!.name} (${s!.grade_class || "N/A"}) - Avg: ${s!.avg.toFixed(1)}`);

    const unpaidFees = fees.filter((f) => f.status === "unpaid" || f.status === "partial");
    const totalOwed = unpaidFees.reduce((a, f) => a + (Number(f.total_due) - Number(f.paid_amount)), 0);

    const systemPrompt = `You are Timhrtboost AI Assistant, an intelligent school management assistant. You help school administrators understand their school data and make informed decisions.

Here is the current school data context:

**Overview:**
- Total Students: ${students.length}
- Total Teachers: ${teachers.length}
- Total Classes: ${classes.length}
- Classes: ${classes.map((c) => `${c.name} (${c.grade_level})`).join(", ") || "None"}

**Attendance (Last 30 days):**
- Total records: ${attendance.length}
- Students with low attendance (<75%): ${lowAttendanceStudents.length > 0 ? "\n" + lowAttendanceStudents.join("\n") : "None"}

**Academics:**
- Total grade entries: ${grades.length}
- Top performers: ${topPerformers.length > 0 ? "\n" + topPerformers.join("\n") : "No grade data"}

**Finances:**
- Outstanding fees: ETB ${totalOwed.toLocaleString()} across ${unpaidFees.length} records
- Paid fees: ${fees.filter((f) => f.status === "paid").length} records
- Partial payments: ${fees.filter((f) => f.status === "partial").length} records

**Gender Distribution:**
- Male: ${students.filter((s) => s.gender === "male" || s.gender === "Male").length}
- Female: ${students.filter((s) => s.gender === "female" || s.gender === "Female").length}

Answer questions about this school's data clearly and helpfully. Use markdown formatting. When you don't have enough data, say so honestly. Provide actionable insights when possible.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("school-ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

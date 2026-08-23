import { supabase } from "@/lib/supabase";
import RepsManager from "@/components/reps/RepsManager";

export const dynamic = "force-dynamic";

export default async function RepsPage() {
  const { data: reps } = await supabase.from("reps").select("*").order("name");

  return <RepsManager initialReps={reps ?? []} />;
}

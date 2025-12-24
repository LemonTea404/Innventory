import { supabase } from "./supabaseClient";

export async function getOrgNameById(orgId) {
  if (!orgId) {
    console.warn("[getOrgNameById] called without orgId");
    return null;
  }

  // console.log("[getOrgNameById] fetching for orgId:", orgId);

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .single();

  // console.log("[getOrgNameById] Supabase response:", { data, error });

  if (error) {
    console.error("Error fetching organization name:", error);
    return null;
  }

  return data?.name ?? null;
}

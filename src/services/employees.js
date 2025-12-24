import { supabase } from "./supabaseClient";

/**
 * Returns an array of all manager emails for the given organization.
 * Uses the employees table: organization_id + role.
 */
export async function getManagerEmailsForOrg(orgId) {
  if (!orgId) return [];

  const { data, error } = await supabase
    .from("employees")
    .select("email")
    .eq("organization_id", orgId)
    // handle both 'manager' and 'Manager' just in case
    .in("role", ["manager", "Manager"]);

  if (error) {
    console.error("Error fetching manager emails:", error);
    return [];
  }

  return (data ?? [])
    .map((row) => row.email)
    .filter((email) => typeof email === "string" && email.trim());
}

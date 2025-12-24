import { supabase } from "./supabaseClient";

export async function fetchInventoryForOrg(orgId) {
  return supabase
    .from("inventory")
    .select("id,item_name,item_quantity,low_threshold,created_at")
    .eq("organization_id", orgId)
    .order("id", { ascending: false });
}

export async function insertInventoryItem(orgId, { name, quantity }) {
  return supabase
    .from("inventory")
    .insert([
      {
        item_name: name,
        item_quantity: quantity,
        organization_id: orgId,
        low_threshold: 0,
      },
    ])
    .select("id,item_name,item_quantity,low_threshold,created_at")
    .single();
}

export async function updateInventoryItem(orgId, id, updates) {
  return supabase
    .from("inventory")
    .update(updates)
    .eq("id", id)
    .eq("organization_id", orgId)
    .select("id,item_name,item_quantity,low_threshold,created_at")
    .single();
}

export async function deleteInventoryItem(orgId, id) {
  return supabase
    .from("inventory")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);
}

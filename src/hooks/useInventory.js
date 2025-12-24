import { useEffect, useState } from "react";
import { getManagerEmailsForOrg } from "../services/employees";
import {
  deleteInventoryItem,
  fetchInventoryForOrg,
  insertInventoryItem,
  updateInventoryItem,
} from "../services/inventory";
import { sendLowStockEmail } from "../services/notifications";

/**
 * Handles all inventory data concerns for a given organization:
 * - loading inventory from Supabase
 * - inserting new items
 * - deleting items (with manager check)
 * - persisted updates (including low_threshold)
 *
 * Returns:
 * - items, loading, saving, error
 * - addItem({ name, quantity })
 * - updateItem(id, patch)
 * - deleteItem(id)
 * - setError (if caller wants to override/clear)
 */
export default function useInventory(orgId, isManager, orgName) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // READ: load rows for this organization (newest first)
  useEffect(() => {
    if (!orgId) {
      setItems([]);
      setLoading(false);
      return;
    }

    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supaError } = await fetchInventoryForOrg(orgId);

        if (supaError) throw supaError;

        if (!alive) return;

        const uiItems = (data ?? []).map((r) => ({
          id: r.id,
          name: r.item_name,
          quantity: r.item_quantity,
          lowThreshold: r.low_threshold ?? 0,
          createdAt: r.created_at ?? null,
        }));

        setItems(uiItems);
      } catch (err) {
        console.error(err);
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [orgId]);

  // CREATE: insert then prepend to list
  const addItem = async ({ name, quantity }) => {
    const trimmed = String(name ?? "").trim();
    const qtyNum = Number(quantity);

    if (!trimmed || Number.isNaN(qtyNum)) return;

    if (!orgId) {
      setError("Missing organization. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { data, error: supaError } = await insertInventoryItem(orgId, {
        name,
        quantity,
      });

      if (supaError) throw supaError;

      const inserted = {
        id: data.id,
        name: data.item_name,
        quantity: data.item_quantity,
        lowThreshold: data.low_threshold ?? 0,
        createdAt: data.created_at ?? null,
      };

      setItems((prev) => [inserted, ...prev]);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // UPDATE: persist to Supabase and then update local state
  const updateItem = async (id, patch) => {
    if (!orgId) {
      setError("Missing organization. Please log in again.");
      return;
    }

    // Map UI patch -> DB columns
    const updates = {};
    if (patch.name !== undefined) {
      const trimmedName = String(patch.name ?? "").trim();
      if (!trimmedName) {
        setError("Item name cannot be empty.");
        return;
      }
      updates.item_name = trimmedName;
    }

    if (patch.quantity !== undefined) {
      const qtyNum = Number(patch.quantity);
      if (Number.isNaN(qtyNum)) {
        setError("Quantity must be a number.");
        return;
      }
      updates.item_quantity = qtyNum;
    }

    // only managers can update low_threshold
    if (patch.lowThreshold !== undefined && isManager) {
      const thresholdNum = Number(patch.lowThreshold);
      if (Number.isNaN(thresholdNum) || thresholdNum < 0) {
        setError("Low threshold must be a non-negative number.");
        return;
      }
      updates.low_threshold = thresholdNum;
    }

    // Nothing to update
    if (Object.keys(updates).length === 0) return;

    try {
      setSaving(true);
      setError(null);

      // Snapshot the current item before we change anything
      const prevItem = items.find((item) => item.id === id) || null;
      const prevQuantity = prevItem?.quantity ?? null;
      const prevLowThreshold = prevItem?.lowThreshold ?? null;

      const { data, error: supaError } = await updateInventoryItem(
        orgId,
        id,
        updates
      );

      if (supaError) throw supaError;

      const updated = {
        id: data.id,
        name: data.item_name,
        quantity: data.item_quantity,
        lowThreshold: data.low_threshold ?? 0,
        createdAt: data.created_at ?? null,
      };

      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));

      // ---- LOW-STOCK EMAIL LOGIC ----
      try {
        const lowThreshold = updated.lowThreshold ?? 0;
        const effectivePrevThreshold = prevLowThreshold ?? lowThreshold;

        const crossedBelow =
          prevQuantity != null &&
          prevQuantity > effectivePrevThreshold &&
          updated.quantity <= lowThreshold;

        if (crossedBelow) {
          const managerEmails = await getManagerEmailsForOrg(orgId);

          if (managerEmails.length === 0) {
            console.warn(
              "Low-stock alert not sent: no manager emails found for org",
              orgId
            );
          } else {
            // in case you need to debug ;)
            // console.log("Sending low-stock email to:", managerEmails);
            // console.log("Low-stock email orgName:", orgName);
            await sendLowStockEmail({
              itemName: updated.name,
              quantity: updated.quantity,
              lowThreshold,
              toEmails: managerEmails,
              orgName,
            });
          }
        }
      } catch (notifyErr) {
        console.error("Failed to send low-stock notification", notifyErr);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // DELETE: only managers, and also delete in Supabase
  const deleteItem = async (id) => {
    if (!isManager) {
      setError("You do not have permission to delete items.");
      return;
    }

    if (!orgId) {
      setError("Missing organization. Please log in again.");
      return;
    }

    try {
      setError(null);

      const { error: supaError } = await deleteInventoryItem(orgId, id);

      if (supaError) throw supaError;

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return {
    items,
    loading,
    saving,
    error,
    addItem,
    updateItem,
    deleteItem,
    setError,
  };
}

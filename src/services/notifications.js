// TODO get rid of debugging logs
import { supabase } from "./supabaseClient";

/**
 * Sends a low-stock email by calling the Edge Function.
 *
 * Requires:
 *  - toEmails: array of recipient emails (non-empty)
 */
export async function sendLowStockEmail({
  itemName,
  quantity,
  lowThreshold,
  toEmails,
  orgName,
}) {
  try {
    if (!Array.isArray(toEmails) || toEmails.length === 0) {
      console.error(
        "sendLowStockEmail called without any recipient emails.",
        toEmails
      );
      return {
        success: false,
        error: new Error("toEmails must be a non-empty array"),
      };
    }

    const { data, error } = await supabase.functions.invoke("low-stock-email", {
      body: {
        itemName,
        quantity,
        lowThreshold,
        toEmails,
        orgName,
      },
    });

    if (error) {
      console.error("Error sending low-stock email:", error);
      console.error("Function response data:", data);
      return { success: false, error, data };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Error calling low-stock-email function:", err);
    return { success: false, error: err };
  }
}

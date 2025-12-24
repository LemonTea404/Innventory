// @ts-nocheck
export {};

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const handler = async (request) => {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST is allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { itemName, quantity, lowThreshold, toEmails, orgName } = body;

  // Require non-empty array of emails
  if (!itemName || !Array.isArray(toEmails) || toEmails.length === 0) {
    return new Response(
      JSON.stringify({
        error: "Missing itemName or toEmails (non-empty array required)",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const recipients = toEmails
    .filter((e) => typeof e === "string" && e.trim())
    .map((e) => e.trim());

  if (recipients.length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid recipient emails supplied" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const orgLabel = orgName ? ` for ${orgName}` : "";
  const subject = `Low stock alert${orgLabel}: ${itemName}`;
  const html = `
    <h2>Low stock alert${orgLabel}</h2>
    <p>The following item is at or below its configured low threshold:</p>
    <ul>
      <li><strong>Item:</strong> ${itemName}</li>
      <li><strong>Quantity:</strong> ${quantity}</li>
      <li><strong>Low threshold:</strong> ${lowThreshold}</li>
    </ul>
    <p>Please review and restock if necessary.</p>
  `;

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Innventory Alerts <onboarding@resend.dev>",
        to: recipients,
        subject,
        html,
      }),
    });

    const data = await resendRes.json().catch(() => null);

    if (!resendRes.ok) {
      console.error("Resend error:", data);
      return new Response(
        JSON.stringify({ error: "Failed to send email", data }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error calling Resend:", err);
    return new Response(
      JSON.stringify({
        error: "Exception while calling Resend",
        details: String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

Deno.serve(handler);

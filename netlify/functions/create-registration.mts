import { randomUUID } from "node:crypto";

const allowedCategories = new Set([
  "Vocalist / Singer", "Gospel rapper", "Afro-gospel artist",
  "Instrumentalist", "Spoken-word artist", "Gospel dance group",
  "Gospel drama / theatre", "Drama / Theatre", "Choir / vocal group",
  "Other gospel talent"
]);

// Netlify.env.get() is the preferred API for modern Netlify Functions.
// process.env is a compatible fallback for Node runtimes where the global
// Netlify environment accessor is not available or does not return a value.
function readEnv(name: string): string | undefined {
  try {
    const value = typeof Netlify !== "undefined" ? Netlify.env.get(name) : undefined;
    if (value) return value;
  } catch {
    // Fall through to Node's runtime environment.
  }
  return process.env[name];
}

export default async (request, context) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
  }

  const supabaseUrl = readEnv("SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    // Log presence only; never log the secret values.
    console.error("Registration configuration missing", {
      supabaseUrlPresent: Boolean(supabaseUrl),
      serviceRoleKeyPresent: Boolean(serviceRoleKey)
    });
    return Response.json({ error: "Registration is temporarily unavailable. Please contact the event team on WhatsApp." }, { status: 503 });
  }

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Please submit a valid registration form." }, { status: 400 }); }

  const entryType = body.entryType === "Group" ? "group" : body.entryType === "Individual" ? "individual" : null;
  const fullName = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 1000) : "";

  if (!entryType) {
    return Response.json({ error: "Please choose Individual or Group registration." }, { status: 400 });
  }
  if (fullName.length < 2 || fullName.length > 120) {
    return Response.json({ error: "Please enter a name between 2 and 120 characters." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (phone.length < 7 || phone.length > 30) {
    return Response.json({ error: "Please enter a valid phone number, including the country code if applicable." }, { status: 400 });
  }
  if (!allowedCategories.has(category)) {
    return Response.json({ error: "Please select a valid talent category from the list." }, { status: 400 });
  }

  const reference = "EGTH-" + randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
  const record = {
    registration_reference: reference,
    entry_type: entryType,
    full_name: fullName,
    email,
    phone,
    category,
    notes: notes || null,
    fee_amount: entryType === "group" ? 10000 : 3000,
    payment_status: "pending_payment"
  };

  try {
    const response = await fetch(new URL("/rest/v1/registrations", supabaseUrl), {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: "Bearer " + serviceRoleKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(record)
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("Registration insert failed", response.status, detail.slice(0, 500));
      let code = "unknown";
      try { code = JSON.parse(detail).code || "unknown"; } catch {}
      return Response.json({
        error: "The registration database rejected the submission (HTTP " + response.status + ", code " + code + "). No registration was saved. Please try again later."
      }, { status: 502 });
    }
    return Response.json({
      reference,
      status: "pending_payment",
      feeAmount: record.fee_amount,
      message: "Registration saved. Pay the fee by bank transfer, then send your receipt and registration reference to the organizers on WhatsApp."
    }, { status: 201 });
  } catch (error) {
    console.error("Registration endpoint error", error);
    return Response.json({ error: "A temporary connection problem occurred. Please try again later." }, { status: 502 });
  }
};

export const config = {
  rateLimit: {
    action: "rate_limit",
    aggregateBy: ["ip"],
    windowSize: 60,
    windowLimit: 8
  }
};

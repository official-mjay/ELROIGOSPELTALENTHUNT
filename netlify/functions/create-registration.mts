import { randomUUID } from "node:crypto";

const allowedCategories = new Set([
  "Vocalist / Singer", "Gospel rapper", "Afro-gospel artist",
  "Instrumentalist", "Spoken-word artist", "Gospel dance group",
  "Gospel drama / theatre", "Drama / Theatre", "Choir / vocal group",
  "Other gospel talent"
]);

export default async (request, context) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
  }

  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const serviceRoleKey = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
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

  if (!entryType || fullName.length < 2 || fullName.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      phone.length < 7 || phone.length > 30 || !allowedCategories.has(category)) {
    return Response.json({ error: "Check your name, email, phone number, entry type and talent category, then try again." }, { status: 400 });
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
      console.error("Registration insert failed", response.status, detail.slice(0, 300));
      return Response.json({ error: "We could not save your registration right now. Please try again later." }, { status: 502 });
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

// Netlify Function: submit-enquiry
// Receives form data from the landing page and writes it to Airtable.
// The Airtable token lives only here, on the server — never in the page's HTML/JS.

exports.handler = async function (event) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Leads";

  // TEMPORARY DIAGNOSTIC — safe to leave in briefly, logs no secret values.
  console.log("Diagnostic:", {
    tokenPresent: !!AIRTABLE_TOKEN,
    tokenLength: AIRTABLE_TOKEN ? AIRTABLE_TOKEN.length : 0,
    tokenPrefix: AIRTABLE_TOKEN ? AIRTABLE_TOKEN.slice(0, 3) : null,
    baseIdPresent: !!AIRTABLE_BASE_ID,
    baseIdPrefix: AIRTABLE_BASE_ID ? AIRTABLE_BASE_ID.slice(0, 3) : null,
    tableName: AIRTABLE_TABLE_NAME,
  });

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server is missing Airtable configuration." }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid form data." }) };
  }

  // Basic honeypot spam check (see hidden field in the form)
  if (data.company_website) {
    // Bots fill hidden fields; pretend success but don't write anything.
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
    AIRTABLE_TABLE_NAME
  )}`;

  const fields = {
    Name: data.fname || "",
    Company: data.company || "",
    Email: data.email || "",
    Phone: data.phone || "",
    "Team Size": data.teamsize || "",
    Package: data.package || "",
    "Booking Type": data.bookingtype || "",
    Message: data.message || "",
    "Submitted At": new Date().toISOString(),
  };

  try {
    const response = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ fields }] }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Airtable error:", errText);
      return { statusCode: 502, body: JSON.stringify({ error: "Airtable rejected the submission." }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Something went wrong." }) };
  }
};

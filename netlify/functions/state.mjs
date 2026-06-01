// Shared state for Sam + Zain dashboard via Netlify Blobs.
//
// GET  /.netlify/functions/state           -> { record, modified }
// PUT  /.netlify/functions/state {body}    -> { modified }
//
// No auth — security via URL obscurity. Acceptable for personal use; upgrade
// to Netlify Identity if this ever holds sensitive data.

import { getStore } from "@netlify/blobs";

const STORE_NAME = "shared-dashboard";
const KEY = "state-v1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Netlify-CDN-Cache-Control": "no-store",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const store = getStore(STORE_NAME);

  if (req.method === "GET") {
    const data = await store.get(KEY, { type: "json" });
    return new Response(
      JSON.stringify({ record: data || null, modified: (data && data._modified) || 0 }),
      { headers: { "Content-Type": "application/json", ...CORS } }
    );
  }

  if (req.method === "PUT") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "invalid json" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }
    body._modified = Date.now();
    await store.setJSON(KEY, body);
    return new Response(
      JSON.stringify({ modified: body._modified }),
      { headers: { "Content-Type": "application/json", ...CORS } }
    );
  }

  return new Response("Method not allowed", { status: 405, headers: CORS });
};

export const config = { path: "/api/state" };

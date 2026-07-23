// Vercel serverless function — keeps GEMINI_API_KEY server-side only.
// The browser calls POST /api/chat; this function calls Gemini and returns text.
// Never expose GEMINI_API_KEY to the client or commit it to the repo — it is
// configured as a Vercel environment variable (see vercel env ls).

const SYSTEM_PROMPT = [
  "Sos el asistente virtual de Fuego RESTO, una parrilla de barrio en Esquina Indart,",
  "Av. Juan Florio 3392, San Justo, La Matanza, Provincia de Buenos Aires.",
  "Datos reales del local (no inventes otros):",
  "- Teléfono/WhatsApp: 03756 15-49-8460",
  "- Horarios: Lunes, Miércoles, Jueves y Domingo 8:00 a 00:00. Viernes y Sábado 9:00 a 1:00. Martes cerrado.",
  "- Rango de precio: $20.000 a $60.000 por persona. Valor del cubierto: $2.000 por persona.",
  "- Rating: 4.5/5 en Google con 205 opiniones.",
  "- Servicios: consumo en el lugar, para llevar, pedidos online por WhatsApp (sin delivery propio).",
  "- Ambiente familiar, con patio y vereda, apto para grupos, amigable con LGBTQ+, liderado por una mujer empresaria.",
  "- Carta: entradas (papas fritas doble cocción, langostinos, tacos, tabla de charcutería), burgers (Fuego, Wagyu, Tasty),",
  "  menú kids, platos principales (entraña rellena, ribs de cerdo, milanesas, salmón, pastas, bife de chorizo, ensaladas),",
  "  bebidas sin alcohol, limonadas, cervezas, vinos y espumantes, tragos de autor con promo 2x1, postres, café y pastelería.",
  "- La carta completa con precios está en la página /carta.html del sitio.",
  "- Para reservar hay un formulario en la sección #reservar de la home que arma un mensaje de WhatsApp automáticamente.",
  "",
  "Respondé siempre en español rioplatense, tono cercano de bodegón de barrio (sin pretensión gourmet), breve (2-4 oraciones).",
  "Si te preguntan algo puntual que no sabés con certeza (un plato exacto, disponibilidad de una fecha, alergias específicas),",
  "decí que consulten por WhatsApp al 03756 15-49-8460 y NO inventes datos que no están en esta info."
].join("\n");

// Se prueban en orden — si un modelo no está disponible o falla, se intenta el siguiente.
const MODELS = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash", "gemini-2.5-pro"];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Falta configurar GEMINI_API_KEY en el servidor." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  body = body || {};

  const message = String(body.message || "").slice(0, 800).trim();
  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];

  if (!message) {
    res.status(400).json({ error: "Falta el mensaje." });
    return;
  }

  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Entendido, estoy listo para ayudar a los clientes de Fuego RESTO." }] },
    ...history.map((h) => ({
      role: h && h.role === "bot" ? "model" : "user",
      parts: [{ text: String((h && h.text) || "").slice(0, 800) }]
    })),
    { role: "user", parts: [{ text: message }] }
  ];

  let lastError = "";
  for (const model of MODELS) {
    try {
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            // maxOutputTokens alto a propósito: los modelos "thinking" (2.5/3.x)
            // consumen buena parte del presupuesto en razonamiento interno antes
            // de escribir la respuesta visible — con un límite bajo la respuesta
            // sale cortada a mitad de frase (finishReason MAX_TOKENS).
            generationConfig: { maxOutputTokens: 1024, temperature: 0.6 }
          })
        }
      );
      const data = await r.json();
      if (r.ok) {
        const candidate = data && data.candidates && data.candidates[0];
        const parts = candidate && candidate.content && candidate.content.parts;
        const text = Array.isArray(parts) ? parts.map((p) => p.text || "").join("").trim() : "";
        if (text && candidate.finishReason !== "MAX_TOKENS") {
          res.status(200).json({ reply: text, model });
          return;
        }
        lastError = text
          ? "Respuesta cortada (MAX_TOKENS) en " + model
          : "Respuesta vacía de " + model;
      } else {
        lastError = (data && data.error && data.error.message) || ("HTTP " + r.status + " en " + model);
      }
    } catch (e) {
      lastError = e && e.message ? e.message : String(e);
    }
  }

  res.status(502).json({ error: "No se pudo generar respuesta. " + lastError });
};

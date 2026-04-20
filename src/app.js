import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "martinez-hidalgo-web", ts: new Date().toISOString() });
});

// Ruta de API para el chatbot simple (flow dialog)
app.post("/api/chatbot", (req, res) => {
  const { message } = req.body;
  const lowerMessage = message?.toLowerCase() || "";

  // Flujo básico (flow dialog)
  let response = "Lo siento, no entiendo tu consulta. Puedes contactarnos directamente en la sección de contacto.";

  if (lowerMessage.includes("hola") || lowerMessage.includes("buenos días")) {
    response = "¡Hola! Bienvenido a Martínez e Hidalgo. Soy tu asistente legal. ¿En qué puedo ayudarte? (Servicios, Socios, Contacto)";
  } else if (lowerMessage.includes("servicios") || lowerMessage.includes("áreas")) {
    response = "Nos especializamos en Derecho Corporativo, Tributario, Auditoría y Derecho Civil. ¿Te interesa alguna área en particular?";
  } else if (lowerMessage.includes("socios") || lowerMessage.includes("quiénes") || lowerMessage.includes("quienes")) {
    response = "La firma es liderada por Abel B. Hidalgo Vega, Marcela Martínez Castillo y Gonzalo Martínez Castillo, junto a un equipo de asociados expertos.";
  } else if (lowerMessage.includes("costos") || lowerMessage.includes("precio")) {
    response = "Nuestros honorarios se ajustan a la complejidad de cada caso. Te invitamos a completar el formulario de contacto para una evaluación inicial.";
  } else if (lowerMessage.includes("contacto")) {
    response = "Puedes escribirnos directamente en la sección de contacto de esta web o al correo contacto@martinezhidalgo.cl.";
  }

  res.json({ response });
});

export default app;

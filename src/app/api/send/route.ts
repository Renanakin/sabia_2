import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

// Validación de variables de entorno (Fail Fast)
if (!process.env.RESEND_API_KEY) {
  console.warn("ADVERTENCIA: RESEND_API_KEY no está configurada.");
}

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

// --- 1. In-Memory Rate Limiting ---
// Para producción en entornos Serverless, lo ideal es Redis, pero un Map global mitiga ataques básicos.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true; // Rate limited
  }

  record.count += 1;
  return false;
}

// --- 2. Zod Schema Validation ---
// Limitar tamaño de strings para prevenir inyecciones y desbordamientos (XSS)
const contactSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto").max(100, "El nombre es muy largo").trim(),
  email: z.string().email("Formato de correo inválido").max(100, "El correo es muy largo").trim().toLowerCase(),
  servicio: z.string().max(100).trim().optional().or(z.literal("")),
  telefono: z.string().max(20).regex(/^[+\d\s-]*$/, "El teléfono contiene caracteres no permitidos").trim().optional().or(z.literal("")),
  mensaje: z.string().min(10, "El mensaje es muy corto").max(1500, "El mensaje excede el límite de 1500 caracteres").trim(),
  recaptchaToken: z.string().min(10, "Token reCAPTCHA inválido"),
});

export async function POST(request: Request) {
  try {
    // 1. Obtener la IP para el Rate Limiter (en Next.js a veces viene en 'x-forwarded-for')
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown_ip";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Por favor, inténtalo de nuevo en 15 minutos." },
        { status: 429 }
      );
    }

    // 2. Parseo y validación de payload con Zod
    const rawBody = await request.json();
    const parsed = contactSchema.safeParse(rawBody);

    if (!parsed.success) {
      // Devuelve el primer error de validación
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { nombre, email, servicio, telefono, mensaje, recaptchaToken } = parsed.data;

    // 3. Validación de reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret || recaptchaSecret === "tu_clave_secreta_aqui") {
      return NextResponse.json(
        { error: "Error de configuración de seguridad en el servidor." },
        { status: 500 }
      );
    }

    const bodyParams = new URLSearchParams({
      secret: recaptchaSecret.trim(),
      response: recaptchaToken.trim()
    });

    const verifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams.toString(),
    });

    const recaptchaData = await verifyResponse.json();
    console.log("reCAPTCHA verificado:", recaptchaData.success);

    if (!recaptchaData.success) {
      return NextResponse.json(
        { error: "Sistema anti-spam activado", details: recaptchaData },
        { status: 403 }
      );
    }

    if (recaptchaData.score < 0.5) {
      return NextResponse.json(
        { error: "Score reCAPTCHA bajo. Actividad sospechosa detectada.", details: recaptchaData },
        { status: 403 }
      );
    }

    // 4. Enviar el correo usando el SDK de Resend
    // Se han limpiado y validado todas las variables gracias a Zod
    const correosDestino = process.env.CONTACT_TO_EMAIL 
      ? process.env.CONTACT_TO_EMAIL.split(',').map(email => email.trim())
      : ["contacto@sabiacontable.cl"];

    const { data, error } = await resend.emails.send({
      from: "Sabia Contable Web <correos@sabiacontable.com>",
      to: correosDestino,
      subject: `Nueva Consulta Web: ${servicio} - ${nombre}`,
      html: `
        <h2>Nueva solicitud de asesoría recibida</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Servicio:</strong> ${servicio}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      `,
    });

    if (error) {
      console.error("Error al enviar con Resend:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Correo enviado exitosamente! ID de Resend: ${data?.id}`);
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


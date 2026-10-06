import { NextResponse } from "next/server";
import { DOCS_CONFIG, generateOtp, sendOtpEmail } from "@/lib/docs-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Debe proporcionar el correo." }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (normalizedEmail !== DOCS_CONFIG.allowedEmail) {
      return NextResponse.json({ error: "Correo no autorizado." }, { status: 401 });
    }

    const newCode = generateOtp(normalizedEmail);
    await sendOtpEmail(normalizedEmail, newCode);

    return NextResponse.json({
      success: true,
      message: "Nuevo código de verificación enviado al correo.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al reenviar el código de seguridad." },
      { status: 500 }
    );
  }
}

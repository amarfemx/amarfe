import { NextResponse } from "next/server";
import { DOCS_CONFIG, verifyOtp, createSession } from "@/lib/docs-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Debe proporcionar el correo y el código de verificación." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const inputCode = String(code).trim();

    // Verify OTP code
    const verification = verifyOtp(normalizedEmail, inputCode);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || "Código de verificación inválido." },
        { status: 400 }
      );
    }

    // Create session
    const session = createSession(normalizedEmail);

    const response = NextResponse.json({
      success: true,
      authenticated: true,
      email: normalizedEmail,
      message: "Acceso autorizado a la documentación confidencial.",
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: DOCS_CONFIG.cookieName,
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
    });

    return response;
  } catch (error: any) {
    console.error("[Docs Verify OTP Error]", error);
    return NextResponse.json(
      { error: "Ocurrió un error al verificar el código de seguridad." },
      { status: 500 }
    );
  }
}

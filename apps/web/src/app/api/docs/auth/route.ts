import { NextResponse } from "next/server";
import { DOCS_CONFIG, generateOtp, sendOtpEmail } from "@/lib/docs-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Debe ingresar correo electrónico y contraseña." },
        { status: 400 }
      );
    }

    const normalizedInputEmail = String(email).toLowerCase().trim();
    const inputPassword = String(password);

    // Validate against authorized administrator/investor credentials securely
    if (
      normalizedInputEmail !== DOCS_CONFIG.allowedEmail ||
      inputPassword !== DOCS_CONFIG.allowedPassword
    ) {
      // Delay response slightly to prevent timing attacks and brute-force
      await new Promise((resolve) => setTimeout(resolve, 600));
      return NextResponse.json(
        { error: "Credenciales inválidas o sin autorización para acceder a la documentación confidencial." },
        { status: 401 }
      );
    }

    // Credentials valid -> Generate 6-digit OTP code
    const otpCode = generateOtp(normalizedInputEmail);

    // Dispatch email notification with OTP
    await sendOtpEmail(normalizedInputEmail, otpCode);

    return NextResponse.json({
      success: true,
      step: "otp_required",
      message: "Se ha enviado un código de verificación de 6 dígitos a su correo electrónico.",
    });
  } catch (error: any) {
    console.error("[Docs Auth Error]", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar la solicitud de autenticación." },
      { status: 500 }
    );
  }
}

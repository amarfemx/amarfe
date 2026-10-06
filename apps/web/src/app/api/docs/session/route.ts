import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DOCS_CONFIG, validateSession, revokeSession } from "@/lib/docs-auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DOCS_CONFIG.cookieName)?.value;

    const session = validateSession(token);

    return NextResponse.json({
      authenticated: session.authenticated,
      email: session.email,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DOCS_CONFIG.cookieName)?.value;

    revokeSession(token);

    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente.",
    });

    response.cookies.delete(DOCS_CONFIG.cookieName);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

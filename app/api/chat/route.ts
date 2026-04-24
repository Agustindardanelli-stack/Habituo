import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: any) { cookieStore.set(name, value, options); },
          remove(name: string, options: any) { cookieStore.set(name, "", options); },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.length > 2000) {
      return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    return NextResponse.json({ response: response.text });
  } catch (error) {
    return NextResponse.json({ error: "Error con Gemini" }, { status: 500 });
  }
}

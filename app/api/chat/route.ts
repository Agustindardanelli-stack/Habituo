// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `Sos un asistente financiero personal inteligente llamado "FinBot". 
Tu objetivo es ayudar al usuario con:
- Análisis de sus gastos y finanzas
- Consejos de ahorro personalizados
- Seguimiento de hábitos financieros
- Motivación y apoyo en sus metas económicas

Reglas:
- Respondé siempre en español argentino (usá "vos" en lugar de "tú")
- Sé amigable, empático y motivador
- Dá respuestas concisas pero útiles
- Usá emojis ocasionalmente para hacer la conversación más amena
- Si te preguntan algo fuera de finanzas personales, podés responder pero tratá de relacionarlo con bienestar financiero cuando sea posible`;

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key no configurada" },
        { status: 500 }
      );
    }

    // ✅ Modelo actualizado a Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Construir el historial de chat para Gemini
    const chatHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Último mensaje del usuario
    const lastMessage = messages[messages.length - 1];

    // Agregar contexto financiero si existe
    let userMessage = lastMessage.content;
    if (context) {
      userMessage = `[Contexto del usuario: ${JSON.stringify(context)}]\n\nPregunta: ${userMessage}`;
    }

    // Iniciar chat con historial
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Instrucciones del sistema: " + SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "¡Entendido! Soy FinBot, tu asistente financiero personal. Estoy listo para ayudarte con tus finanzas. 💰" }],
        },
        ...chatHistory,
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Enviar mensaje y obtener respuesta
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      message: text,
      tokensUsed: response.usageMetadata?.totalTokenCount || 0,
    });
  } catch (error: any) {
    console.error("Error en chat API:", error);
    
    // Manejar errores específicos de Gemini
    if (error.message?.includes("API_KEY")) {
      return NextResponse.json(
        { error: "API key inválida" },
        { status: 401 }
      );
    }
    
    if (error.message?.includes("RATE_LIMIT")) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Esperá un momento." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Error al procesar tu mensaje. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
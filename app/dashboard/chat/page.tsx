"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User, Loader2, Lightbulb } from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const suggestedQuestions = [
  "¿Cuánto gasté este mes?",
  "¿Cómo viene mi racha de hábitos?",
  "Dame un resumen de mi semana",
  "¿En qué puedo ahorrar?",
  "¿Cuál es mi hábito más consistente?",
  "Analiza mis patrones de gasto",
];

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "¡Hola! 👋 Soy tu asistente personal de LifeSync. Puedo ayudarte a entender tus finanzas, hábitos, y darte insights personalizados. ¿En qué puedo ayudarte hoy?",
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simular respuesta de IA (aquí conectarías con OpenAI/Claude)
    setTimeout(() => {
      const responses: Record<string, string> = {
        "¿Cuánto gasté este mes?":
          "📊 Este mes llevas gastados **$85,420**.\n\nDesglose por categoría:\n- 🍽️ Alimentación: $32,150 (38%)\n- 🚗 Transporte: $18,200 (21%)\n- ⚡ Servicios: $15,800 (18%)\n- 🎬 Entretenimiento: $12,490 (15%)\n- 🏥 Salud: $6,780 (8%)\n\nEstás un 12% por debajo del mes pasado. ¡Excelente control! 🎉",
        "¿Cómo viene mi racha de hábitos?":
          "🎯 Tu progreso de hábitos está muy bien:\n\n- 🏃 Ejercicio: **12 días** de racha ¡Increíble!\n- 💧 Tomar agua: **8 días** seguidos\n- 📚 Leer: **5 días** de racha\n- 😴 Dormir 8h: **4 días**\n\nTu hábito más consistente es **Ejercicio** con 85% de cumplimiento este mes. Seguí así! 💪",
        "Dame un resumen de mi semana":
          "📅 **Resumen de tu semana:**\n\n**Finanzas:**\n- Gastaste $23,450 (15% menos que la semana pasada)\n- Mayor gasto: Supermercado ($8,500)\n\n**Hábitos:**\n- Completaste el 78% de tus hábitos\n- Mejor día: Miércoles (6/7 hábitos)\n\n**Diario:**\n- Escribiste 5 entradas\n- Sentimiento promedio: Positivo 😊\n\n**Insight:** Tus mejores días son a mitad de semana. Los fines de semana tendés a gastar más en entretenimiento.",
        default:
          "Entendido! Déjame analizar eso por vos... 🤔\n\nBasándome en tus datos, puedo ver algunos patrones interesantes. ¿Querés que profundice en algún área específica como finanzas, hábitos o productividad?",
      };

      const aiResponse: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: responses[input] || responses.default,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Chat con IA
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tu asistente personal inteligente
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-700 dark:text-green-400">
            En línea
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                message.role === "user"
                  ? "bg-brand-500"
                  : "bg-gradient-to-br from-brand-500 to-purple-600"
              }`}
            >
              {message.role === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Sparkles className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-brand-500 text-white rounded-tr-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-2 ${
                  message.role === "user"
                    ? "text-brand-200"
                    : "text-gray-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                <span className="text-gray-500 dark:text-gray-400">
                  Pensando...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
            <Lightbulb className="w-4 h-4" />
            <span>Sugerencias</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(question)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-gray-700 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-400 rounded-xl text-sm transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="pt-4 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Preguntame lo que quieras..."
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          LifeSync AI analiza tus datos para darte respuestas personalizadas
        </p>
      </form>
    </div>
  );
}

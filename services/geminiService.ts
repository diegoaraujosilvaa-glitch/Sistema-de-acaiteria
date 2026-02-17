
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, PaymentMethod, DeliveryType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const processAICommand = async (prompt: string, state: AppState) => {
  const systemInstruction = `
    Você é o "Açaí Manager AI". Sua função é interpretar pedidos em linguagem natural e sugerir ações de gestão.
    O estado atual da loja é:
    Produtos: ${JSON.stringify(state.products)}
    Taxas: ${JSON.stringify(state.deliveryFees)}
    Vendas Hoje: ${state.sales.length}

    Responda em formato JSON estruturado para que eu possa executar ações.
    Ações possíveis: "ADD_TO_CART", "REGISTER_PRODUCT", "REGISTER_FEE", "SHOW_REPORT", "CHAT_ONLY".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: "Ação a ser tomada" },
            message: { type: Type.STRING, description: "Feedback em Português (Markdown)" },
            data: { type: Type.OBJECT, description: "Dados adicionais para a ação" }
          },
          required: ["action", "message"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return { action: "CHAT_ONLY", message: "Desculpe, tive um problema ao processar isso." };
  }
};

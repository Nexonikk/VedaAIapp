import { zodToJsonSchema } from "zod-to-json-schema";
import { aiGeneratedPaperSchema, type AIGeneratedPaper } from "./schemas";
import { buildAssessmentPrompt } from "./prompt";
import { env } from "../config/env";

function removeAdditionalProperties(schema: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === "additionalProperties") continue;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = removeAdditionalProperties(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item && typeof item === "object"
          ? removeAdditionalProperties(item as Record<string, unknown>)
          : item
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

interface GenerateInput {
  title: string;
  questionTypes: Array<{ type: string; noOfQuestions: number; marksPerQuestion: number }>;
  additionalInfo?: string;
}

export async function callGeminiAPI(input: GenerateInput): Promise<AIGeneratedPaper> {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set.");

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`;
  const prompt = buildAssessmentPrompt(input);

  // Build responseSchema from Zod
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fullJsonSchema = (zodToJsonSchema as any)(aiGeneratedPaperSchema, "aiGeneratedPaperSchema") as Record<string, unknown>;
  const defs = fullJsonSchema["definitions"] as Record<string, unknown> | undefined;
  const unwrapped = defs?.["aiGeneratedPaperSchema"] as Record<string, unknown> | undefined;

  if (!unwrapped || !("properties" in unwrapped)) {
    throw new Error("Failed to build Gemini responseSchema from Zod.");
  }

  const cleanedSchema = removeAdditionalProperties(unwrapped);

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: cleanedSchema["properties"],
        required: cleanedSchema["required"],
      },
      temperature: 0.7,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
    const errMsg = (errorBody["error"] as Record<string,string> | undefined)?.["message"];
    throw new Error(`Gemini API failed (${response.status}): ${errMsg || "Unknown error"}`);
  }

  const apiResponse = await response.json() as Record<string, unknown>;
  const candidates = apiResponse["candidates"] as Array<Record<string, unknown>> | undefined;
  const content = candidates?.[0]?.["content"] as Record<string, unknown> | undefined;
  const parts = content?.["parts"] as Array<Record<string, unknown>> | undefined;
  const generatedText = parts?.[0]?.["text"] as string | undefined;

  if (!generatedText) throw new Error("Empty response from Gemini API.");

  const rawData = JSON.parse(generatedText);
  const parsed = aiGeneratedPaperSchema.safeParse(rawData);
  if (!parsed.success) {
    console.error("[Gemini] Schema mismatch:", parsed.error.issues);
    throw new Error("Gemini response did not match expected schema.");
  }
  return parsed.data;
}

export async function callMistralAPI(input: GenerateInput): Promise<AIGeneratedPaper> {
  if (!env.MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY not set.");

  const prompt = buildAssessmentPrompt(input);

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content: "You are an expert educational assessment creator. Respond ONLY with valid JSON matching the exact schema requested, no markdown, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(`Mistral API failed (${response.status}): ${(errorBody["message"] as string) || "Unknown"}`);
  }

  const apiResponse = await response.json() as Record<string, unknown>;
  const choices = apiResponse["choices"] as Array<Record<string, unknown>> | undefined;
  const msgContent = (choices?.[0]?.["message"] as Record<string, unknown> | undefined)?.["content"] as string | undefined;
  if (!msgContent) throw new Error("Empty response from Mistral API.");

  const rawData = JSON.parse(msgContent);
  const parsed = aiGeneratedPaperSchema.safeParse(rawData);
  if (!parsed.success) {
    console.error("[Mistral] Schema mismatch:", parsed.error.issues);
    throw new Error("Mistral response did not match expected schema.");
  }
  return parsed.data;
}

// Primary: Gemini → Fallback: Mistral
export async function generateAssessment(input: GenerateInput): Promise<AIGeneratedPaper> {
  if (env.GEMINI_API_KEY) {
    try {
      console.log("[AI] Trying Gemini...");
      const result = await callGeminiAPI(input);
      console.log("[AI] ✅ Gemini success");
      return result;
    } catch (err) {
      console.warn("[AI] Gemini failed:", (err as Error).message);
    }
  }

  if (env.MISTRAL_API_KEY) {
    try {
      console.log("[AI] Trying Mistral fallback...");
      const result = await callMistralAPI(input);
      console.log("[AI] ✅ Mistral success");
      return result;
    } catch (err) {
      console.warn("[AI] Mistral failed:", (err as Error).message);
      throw new Error("All AI providers failed. Please check your API keys and try again.");
    }
  }

  throw new Error("No AI API keys configured. Set GEMINI_API_KEY or MISTRAL_API_KEY in .env");
}

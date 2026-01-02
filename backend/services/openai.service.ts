export class OpenAIService {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.OPENAI_API_KEY;
    if (!this.apiKey) {
      console.warn("OPENAI_API_KEY not set; OpenAI calls will return a mock result.");
    }
  }

  async analyzePatient(patient: any, language?: string, imageUri?: string) {
    if (!patient || typeof patient !== "object") {
      throw new Error("Invalid patient data");
    }

    // Return mock response if no API key is configured (useful for local dev / tests)
    if (!this.apiKey) {
      return {
        summary: "Mock analysis (OPENAI_API_KEY not set)",
        patientId: (patient as any).id ?? null,
        recommendations: [],
        notes: "Set OPENAI_API_KEY to enable real analysis",
      };
    }

    const systemPrompt = `You are a clinical assistant. Provide a concise, non-judgmental analysis and suggested next steps. Use ${language ?? "English"}.`;
    const userContent = `Patient data:\n${JSON.stringify(patient, null, 2)}${imageUri ? `\nImage URI: ${imageUri}` : ""}`;

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: 800,
      temperature: 0.2,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${text}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? json.choices?.[0]?.text ?? "";

    return {
      summary: content,
    };
  }
}
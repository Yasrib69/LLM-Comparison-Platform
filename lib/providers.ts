
export const modelA = process.env.MODEL_A || "llama-3.3-70b-versatile";
export const modelB = process.env.MODEL_B || "gpt-oss-120b";

type ChatResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
  error?: {
    message?: string;
  };
};

async function requestModel(
  url: string,
  apiKey: string | undefined,
  model: string,
  prompt: string,
  provider: string
): Promise<string> {
  if (!apiKey || apiKey.startsWith("your_")) {
    throw new Error(`${provider} API key is missing.`);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_completion_tokens: 800,
    }),
    signal: AbortSignal.timeout(45000),
    cache: "no-store",
  });

  const data: ChatResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      `${provider}: ${data.error?.message || `HTTP ${response.status}`}`
    );
  }

  const answer = data.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error(`${provider} returned an empty response.`);
  }

  return answer;
}

export async function generateGroq(prompt: string): Promise<string> {
  return requestModel(
    "https://api.groq.com/openai/v1/chat/completions",
    process.env.GROQ_API_KEY,
    modelA,
    prompt,
    "Groq"
  );
}

export async function generateCerebras(prompt: string): Promise<string> {
  return requestModel(
    "https://api.cerebras.ai/v1/chat/completions",
    process.env.CEREBRAS_API_KEY,
    modelB,
    prompt,
    "Cerebras"
  );
}

/**
 * Pluggable AI provider layer.
 *
 * Configure with environment variables (never hard-code keys):
 *   AI_PROVIDER = openai | anthropic | none   (default: none → deterministic rules only)
 *   AI_API_KEY  = provider key
 *   AI_MODEL    = model id (optional)
 *   AI_BASE_URL = override for OpenAI-compatible gateways (optional)
 *
 * Every AI feature in Mentiq has a deterministic fallback, so the product keeps
 * working when no provider is configured or a call fails.
 */

const providers = {
  async openai({ system, prompt, maxTokens, signal }) {
    const base = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        max_tokens: maxTokens,
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`openai ${res.status}`);
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? null;
  },

  async anthropic({ system, prompt, maxTokens, signal }) {
    const base = process.env.AI_BASE_URL || "https://api.anthropic.com/v1";
    const res = await fetch(`${base}/messages`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.AI_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-3-5-haiku-latest",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const json = await res.json();
    return json.content?.[0]?.text ?? null;
  },
};

export function aiProviderName() {
  const name = (process.env.AI_PROVIDER || "none").toLowerCase();
  return providers[name] && process.env.AI_API_KEY ? name : "none";
}

export const aiEnabled = () => aiProviderName() !== "none";

/** Returns generated text, or null when AI is disabled / slow / failing. */
export async function generateText({ system, prompt, maxTokens = 500, timeoutMs = 9000 }) {
  const name = aiProviderName();
  if (name === "none") return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const text = await providers[name]({ system, prompt, maxTokens, signal: controller.signal });
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch (error) {
    console.warn("[ai] generation failed:", error.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

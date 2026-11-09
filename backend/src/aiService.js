// OpenAI aur Gemini dono yahan se guzarte hain. Baaki app ko pata nahi kaun sa use hua.
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function buildPrompt({ resumeText, jobText, score, matched, missing }) {
  return `You are a career coach reviewing a resume against a job description.
Keyword match score: ${score}%. Matched skills: ${matched.join(', ') || 'none'}. Missing skills: ${missing.join(', ') || 'none'}.

Return ONLY a JSON object with exactly these keys:
{
  "summary": "2-3 sentences on how well the resume fits this job",
  "strengths": ["up to 3 short strengths relevant to this job"],
  "gaps": [{"skill": "name", "why": "why this job needs it", "how": "one practical way to learn or show it"}],
  "suggestions": ["up to 5 specific improvements to the resume"],
  "rewrites": [{"before": "a weak bullet copied from the resume", "after": "a stronger version"}]
}
Rules: never invent experience the resume does not show. Rewrites must come from real bullets in the resume (max 3). Keep every item short and plain.

RESUME:
${resumeText.slice(0, 6000)}

JOB DESCRIPTION:
${jobText.slice(0, 4000)}`;
}

async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OpenAI: ${data.error?.message || res.status}`);
  return data.choices[0].message.content;
}

async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`Gemini: ${data.error?.message || res.status}`);
  return data.candidates[0].content.parts[0].text;
}

const providers = {
  openai: { key: () => process.env.OPENAI_API_KEY, call: callOpenAI },
  gemini: { key: () => process.env.GEMINI_API_KEY, call: callGemini },
};

const parseJson = (raw) => JSON.parse(raw.replace(/```json|```/g, '').trim());

export async function analyzeWithAI(input) {
  const first = (process.env.AI_PROVIDER || 'openai').toLowerCase();
  const order = [first, ...Object.keys(providers).filter((p) => p !== first)]
    .filter((p) => providers[p] && providers[p].key());
  if (!order.length) throw new Error('Koi AI API key .env mein nahi mili.');

  const prompt = buildPrompt(input);
  let lastError;
  for (const name of order) {            // pehla fail ho to doosra try hota hai (fallback)
    for (let attempt = 1; attempt <= 3; attempt++) {   // "high demand" jaisi temporary errors par 3 koshish
      try {
        const ai = parseJson(await providers[name].call(prompt));
        return { provider: name, ...ai };
      } catch (err) {
        lastError = err;
        console.error(`[AI] ${name} koshish ${attempt} fail:`, err.message);
        const temporary = /demand|overload|unavailable|try again|rate|quota/i.test(err.message);
        if (!temporary) break;
        await new Promise((r) => setTimeout(r, attempt * 3000));
      }
    }
  }
  throw lastError;
}

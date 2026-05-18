import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
})

export async function POST(request: Request) {
  try {
    const { companyName, segment, scores, overall, maturity } = await request.json()

    const scoresText = Object.entries(scores as Record<string, number>)
      .map(([area, score]) => `- ${area}: ${score}/100`)
      .join('\n')

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: 'Você é um consultor de negócios especializado em MEIs e PMEs brasileiros. Seja direto, prático e específico.',
        },
        {
          role: 'user',
          content: `Empresa: "${companyName}" (${segment})
Score geral: ${overall}/100 — Nível: ${maturity}

Scores por área:
${scoresText}

Gere uma análise consultiva com exatamente estas 4 seções:

**PONTOS CRÍTICOS (score < 50):**
Liste as áreas críticas e por que são urgentes.

**PONTOS FORTES (score > 70):**
Liste os pontos positivos e como aproveitar.

**PLANO 30/60/90 DIAS PERSONALIZADO:**
- 30 dias: ações específicas para as áreas mais críticas desta empresa
- 60 dias: consolidação e ajustes
- 90 dias: meta de score-alvo e próximos passos

**RECOMENDAÇÃO PRINCIPAL:**
Uma ação concreta para implementar esta semana.

Seja específico para o segmento "${segment}". Máximo 400 palavras.`,
        },
      ],
    })

    const analysis = response.choices[0]?.message?.content || ''
    return Response.json({ analysis })
  } catch (error) {
    console.error('AI route error:', error)
    return Response.json({ error: 'Erro ao chamar a API de IA.' }, { status: 500 })
  }
}

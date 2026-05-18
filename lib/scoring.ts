import { categories } from './categories'

export type Answers = Record<string, number>

export type Score = {
  slug: string
  name: string
  score: number
}

export function scoreCategory(slug: string, answers: Answers): number {
  const category = categories.find(c => c.slug === slug)
  if (!category) return 0
  const total = category.questions.reduce((sum, _, i) => sum + Number(answers[`${slug}-${i}`] ?? 0), 0)
  return Math.round((total / (category.questions.length * 4)) * 100)
}

export function getScores(answers: Answers): Score[] {
  return categories.map(c => ({ slug: c.slug, name: c.name, score: scoreCategory(c.slug, answers) }))
}

export function getOverallScore(answers: Answers): number {
  const scores = getScores(answers)
  return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
}

export function getMaturity(score: number): string {
  if (score <= 25) return 'Crítico'
  if (score <= 50) return 'Básico'
  if (score <= 75) return 'Em estruturação'
  if (score <= 90) return 'Avançado'
  return 'Referência'
}

export function getPriority(answers: Answers): Score | null {
  if (!Object.values(answers).some(v => Number(v) > 0)) return null
  return [...getScores(answers)].sort((a, b) => a.score - b.score)[0]
}

export function generateTasks(
  answers: Answers,
  diagnosticoId: string,
  empresaId: string,
  userId: string,
) {
  const scores = getScores(answers)
  const weakest = [...scores].sort((a, b) => a.score - b.score).slice(0, 3)

  return weakest.flatMap(area => {
    const category = categories.find(c => c.slug === area.slug)!
    return category.actions.map((description, index) => ({
      key: `${area.slug}-${index}`,
      area: area.name,
      title: index === 0 ? `Organizar ${area.name}` : `Evoluir ${area.name}`,
      description,
      priority: area.score < 40 ? 'Alta' : 'Média',
      impact: index === 0 ? 'Alto' : 'Médio',
      difficulty: index === 0 ? 'Média' : 'Baixa',
      done: false,
      diagnostico_id: diagnosticoId,
      empresa_id: empresaId,
      user_id: userId,
    }))
  })
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Toast, { showToast } from '@/components/Toast'
import { createClient } from '@/lib/supabase-browser'
import { categories } from '@/lib/categories'
import { getOverallScore, getMaturity, generateTasks, type Answers } from '@/lib/scoring'

type Empresa = { id: string; name: string }

export default function DiagnosticoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [note, setNote] = useState('')
  const [answers, setAnswers] = useState<Answers>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('empresas').select('id, name').order('created_at', { ascending: false })
      const list = data || []
      setEmpresas(list)
      if (list.length > 0) setSelectedId(list[0].id)
    }
    load()
  }, [])

  function setAnswer(key: string, value: number) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  function fillExample() {
    const example: Answers = {}
    categories.forEach((cat, ci) => {
      cat.questions.forEach((_, qi) => {
        const base = [3, 1, 2, 3, 2, 3][ci]
        example[`${cat.slug}-${qi}`] = Math.max(0, Math.min(4, base + (qi % 2 === 0 ? 0 : -1)))
      })
    })
    setAnswers(example)
    showToast('Exemplo preenchido.')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) { showToast('Selecione uma empresa.'); return }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const overall = getOverallScore(answers)
    const maturity = getMaturity(overall)
    const scores: Record<string, number> = {}
    categories.forEach(c => {
      const total = c.questions.reduce((s, _, i) => s + Number(answers[`${c.slug}-${i}`] ?? 0), 0)
      scores[c.slug] = Math.round((total / (c.questions.length * 4)) * 100)
    })

    const { data: diag, error } = await supabase
      .from('diagnosticos')
      .insert({
        user_id: user.id,
        empresa_id: selectedId,
        answers,
        scores,
        overall_score: overall,
        maturity,
        note,
      })
      .select()
      .single()

    if (error || !diag) {
      showToast('Erro ao salvar diagnóstico.')
      setSaving(false)
      return
    }

    // Delete old tasks for this company, then insert new ones
    await supabase.from('tarefas').delete().eq('empresa_id', selectedId)
    const tasks = generateTasks(answers, diag.id, selectedId, user.id)
    await supabase.from('tarefas').insert(tasks)

    showToast('Diagnóstico salvo e plano de ação gerado!')
    setSaving(false)
    router.push('/plano')
  }

  return (
    <DashboardLayout
      eyebrow="Diagnóstico profissional"
      title="Avaliação de maturidade 4R"
      actions={
        <button
          type="button"
          onClick={fillExample}
          className="h-10 px-4 rounded-xl font-semibold text-sm border cursor-pointer"
          style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'white' }}
        >
          Usar exemplo
        </button>
      }
    >
      {empresas.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <p className="font-semibold" style={{ color: 'var(--ink)' }}>Nenhuma empresa cadastrada.</p>
          <a href="/empresas" className="text-sm mt-2 inline-block font-bold" style={{ color: 'var(--green)' }}>
            Cadastrar empresa →
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Company + note */}
          <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                Empresa avaliada
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className="border rounded-xl px-4 h-12 text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
                >
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                Observação geral
                <input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ex: diagnóstico inicial de acompanhamento"
                  className="border rounded-xl px-4 h-12 text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
                />
              </label>
            </div>
          </div>

          {/* Categories */}
          {categories.map(cat => (
            <div
              key={cat.slug}
              className="rounded-2xl p-6"
              style={{ background: 'white', border: '1px solid var(--border)' }}
            >
              <h3 className="font-bold text-base mb-5" style={{ color: 'var(--ink)' }}>{cat.name}</h3>
              <div className="flex flex-col gap-5">
                {cat.questions.map((q, i) => {
                  const key = `${cat.slug}-${i}`
                  const val = Number(answers[key] ?? 0)
                  return (
                    <div key={key} className="grid items-center gap-3" style={{ gridTemplateColumns: '1fr 200px 44px' }}>
                      <span className="text-sm" style={{ color: 'var(--ink)' }}>{q}</span>
                      <input
                        type="range"
                        min={0}
                        max={4}
                        value={val}
                        onChange={e => setAnswer(key, Number(e.target.value))}
                        aria-label={q}
                      />
                      <div
                        className="h-9 rounded-xl grid place-items-center text-sm font-black"
                        style={{ background: 'var(--surface-soft)', color: 'var(--green-dark)' }}
                      >
                        {val}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="h-12 rounded-xl font-bold text-white cursor-pointer disabled:opacity-60"
            style={{ background: 'var(--green)' }}
          >
            {saving ? 'Gerando...' : 'Gerar score e plano de ação'}
          </button>
        </form>
      )}
      <Toast />
    </DashboardLayout>
  )
}

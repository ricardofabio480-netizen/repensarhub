'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import ScoreBar from '@/components/ScoreBar'
import ScoreRing from '@/components/ScoreRing'
import Toast, { showToast } from '@/components/Toast'
import { createClient } from '@/lib/supabase-browser'
import { getScores, getMaturity, getPriority, type Answers } from '@/lib/scoring'

type Empresa = { id: string; name: string; segment: string; size: string }
type Diagnostico = { id: string; empresa_id: string; overall_score: number; maturity: string; answers: Answers; ai_analysis: string | null; created_at: string; note: string | null }
type Tarefa = { id: string; area: string; title: string; description: string; priority: string; done: boolean; diagnostico_id: string }

export default function RelatoriosPage() {
  const supabase = createClient()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([])
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('')
  const [selectedDiagId, setSelectedDiagId] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: emp }, { data: diag }, { data: tar }] = await Promise.all([
        supabase.from('empresas').select('id, name, segment, size').order('created_at', { ascending: false }),
        supabase.from('diagnosticos').select('id, empresa_id, overall_score, maturity, answers, ai_analysis, created_at, note').order('created_at', { ascending: false }),
        supabase.from('tarefas').select('id, area, title, description, priority, done, diagnostico_id').order('created_at', { ascending: false }),
      ])
      setEmpresas(emp || [])
      setDiagnosticos(diag || [])
      setTarefas(tar || [])
      if (emp?.[0]) {
        setSelectedEmpresaId(emp[0].id)
        const firstDiag = diag?.find(d => d.empresa_id === emp[0].id)
        if (firstDiag) setSelectedDiagId(firstDiag.id)
      }
      setLoading(false)
    }
    load()
  }, [])

  const empresa = empresas.find(e => e.id === selectedEmpresaId)
  const diagsForEmpresa = diagnosticos.filter(d => d.empresa_id === selectedEmpresaId)
  const diag = diagsForEmpresa.find(d => d.id === selectedDiagId) || diagsForEmpresa[0]
  const answers: Answers = diag?.answers || {}
  const scores = getScores(answers)
  const priority = getPriority(answers)
  const diagTasks = tarefas.filter(t => t.diagnostico_id === diag?.id)

  async function generateAI() {
    if (!diag || !empresa) return
    setLoadingAI(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: empresa.name,
          segment: empresa.segment,
          scores: Object.fromEntries(scores.map(s => [s.name, s.score])),
          overall: diag.overall_score,
          maturity: diag.maturity,
        }),
      })

      const { analysis } = await res.json()

      await supabase.from('diagnosticos').update({ ai_analysis: analysis }).eq('id', diag.id)
      setDiagnosticos(prev => prev.map(d => d.id === diag.id ? { ...d, ai_analysis: analysis } : d))
      showToast('Análise gerada com sucesso!')
    } catch {
      showToast('Erro ao gerar análise. Verifique a chave da API.')
    }
    setLoadingAI(false)
  }

  return (
    <DashboardLayout
      eyebrow="Relatório consultivo"
      title="Relatórios"
      actions={
        <button
          onClick={() => window.print()}
          className="h-10 px-5 rounded-xl font-bold text-white text-sm cursor-pointer no-print"
          style={{ background: 'var(--green)' }}
        >
          Imprimir / PDF
        </button>
      }
    >
      {loading ? (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Carregando...</p>
      ) : !empresa || !diag ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <p className="font-semibold" style={{ color: 'var(--ink)' }}>Nenhum diagnóstico encontrado.</p>
          <a href="/diagnostico" className="text-sm mt-2 inline-block font-bold" style={{ color: 'var(--green)' }}>
            Gerar diagnóstico →
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Selectors */}
          <div className="flex gap-4 no-print">
            <select
              value={selectedEmpresaId}
              onChange={e => {
                setSelectedEmpresaId(e.target.value)
                const firstDiag = diagnosticos.find(d => d.empresa_id === e.target.value)
                setSelectedDiagId(firstDiag?.id || '')
              }}
              className="border rounded-xl px-4 h-10 text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            >
              {empresas.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            {diagsForEmpresa.length > 1 && (
              <select
                value={selectedDiagId}
                onChange={e => setSelectedDiagId(e.target.value)}
                className="border rounded-xl px-4 h-10 text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                {diagsForEmpresa.map(d => (
                  <option key={d.id} value={d.id}>
                    {new Date(d.created_at).toLocaleDateString('pt-BR')} — Score {d.overall_score}/100
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Header */}
          <div
            className="rounded-3xl p-7 flex items-center gap-6 relative overflow-hidden"
            style={{ background: 'white', border: '1px solid var(--border)' }}
          >
            <div
              className="absolute inset-y-0 left-0 w-2 rounded-l-3xl"
              style={{ background: 'linear-gradient(to bottom, var(--green), var(--gold), var(--blue))' }}
            />
            <div className="flex-1 pl-2">
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--green-dark)' }}>
                Relatório Repens4R Pro
              </p>
              <h2 className="text-2xl font-black" style={{ color: 'var(--ink)' }}>{empresa.name}</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {empresa.size} · Segmento: {empresa.segment} · Score geral: {diag.overall_score}/100 ·{' '}
                Nível: <strong>{diag.maturity}</strong> · Prioridade: <strong>{priority?.name || '—'}</strong>
              </p>
            </div>
            <ScoreRing score={diag.overall_score} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Scores */}
            <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--green-dark)' }}>
                Pontuação por área
              </p>
              <div className="flex flex-col gap-4">
                {scores.map(s => <ScoreBar key={s.slug} name={s.name} score={s.score} />)}
              </div>
            </div>

            {/* 30/60/90 */}
            <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--green-dark)' }}>
                Plano 30/60/90 dias
              </p>
              <div className="flex flex-col gap-3 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                <p><strong style={{ color: 'var(--ink)' }}>30 dias:</strong> corrigir pontos críticos (score abaixo de 40), organizar dados e executar ações de maior urgência em {priority?.name}.</p>
                <p><strong style={{ color: 'var(--ink)' }}>60 dias:</strong> acompanhar indicadores, validar melhorias e ajustar processos internos nas áreas intermediárias.</p>
                <p><strong style={{ color: 'var(--ink)' }}>90 dias:</strong> refazer diagnóstico, comparar evolução e definir nova rodada de prioridades com score-alvo de {Math.min(100, diag.overall_score + 20)}/100.</p>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--green-dark)' }}>
                Análise consultiva por IA
              </p>
              <button
                onClick={generateAI}
                disabled={loadingAI}
                className="h-9 px-4 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60 no-print"
                style={{ background: 'var(--green)' }}
              >
                {loadingAI ? 'Gerando...' : diag.ai_analysis ? 'Regenerar análise' : 'Gerar análise com IA'}
              </button>
            </div>
            {diag.ai_analysis ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>
                {diag.ai_analysis}
              </div>
            ) : (
              <p className="text-sm p-4 rounded-xl border border-dashed" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
                Clique em "Gerar análise com IA" para criar uma análise consultiva personalizada com Claude AI.
              </p>
            )}
          </div>

          {/* Tasks */}
          <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--green-dark)' }}>
              Ações recomendadas
            </p>
            {diagTasks.length > 0 ? (
              <div className="flex flex-col gap-3">
                {diagTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-2xl border"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                  >
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>
                        {task.area}: {task.title}
                      </p>
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>{task.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#fff4d8', color: '#8a5c00' }}>
                        {task.priority}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={task.done
                          ? { background: 'var(--surface-soft)', color: 'var(--muted)' }
                          : { background: '#fff0ee', color: 'var(--red)' }
                        }
                      >
                        {task.done ? 'Concluída' : 'Aberta'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm p-4 rounded-xl border border-dashed" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
                Nenhuma ação recomendada para este diagnóstico.
              </p>
            )}
          </div>
        </div>
      )}
      <Toast />
    </DashboardLayout>
  )
}

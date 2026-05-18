'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import ScoreBar from '@/components/ScoreBar'
import ScoreRing from '@/components/ScoreRing'
import Toast, { showToast } from '@/components/Toast'
import { createClient } from '@/lib/supabase-browser'
import { getScores, getOverallScore, getMaturity, getPriority, type Answers } from '@/lib/scoring'

type Empresa = { id: string; name: string; segment: string; size: string }
type Diagnostico = { id: string; empresa_id: string; overall_score: number; maturity: string; answers: Answers; created_at: string }
type Tarefa = { id: string; area: string; title: string; description: string; done: boolean; diagnostico_id: string }

export default function DashboardPage() {
  const supabase = createClient()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([])
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: emp } = await supabase.from('empresas').select('id, name, segment, size').order('created_at', { ascending: false })
      const { data: diag } = await supabase.from('diagnosticos').select('id, empresa_id, overall_score, maturity, answers, created_at').order('created_at', { ascending: false })
      const { data: tar } = await supabase.from('tarefas').select('id, area, title, description, done, diagnostico_id').order('created_at', { ascending: false })

      setEmpresas(emp || [])
      setDiagnosticos(diag || [])
      setTarefas(tar || [])
      setSelectedEmpresa(emp?.[0] || null)
      setLoading(false)
    }
    load()
  }, [])

  async function toggleTask(id: string, done: boolean) {
    await supabase.from('tarefas').update({ done: !done }).eq('id', id)
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, done: !done } : t))
    showToast(done ? 'Tarefa reaberta.' : 'Tarefa concluída!')
  }

  const latestDiag = diagnosticos.find(d => d.empresa_id === selectedEmpresa?.id)
  const answers: Answers = latestDiag?.answers || {}
  const scores = getScores(answers)
  const overall = getOverallScore(answers)
  const priority = getPriority(answers)
  const openTasks = tarefas.filter(t => !t.done)
  const nextTasks = openTasks.slice(0, 4)

  const metrics = [
    { label: 'Empresas', value: empresas.length, desc: 'Clientes na carteira' },
    { label: 'Diagnósticos', value: diagnosticos.length, desc: 'Avaliações realizadas' },
    { label: 'Tarefas abertas', value: openTasks.length, desc: 'Ações pendentes' },
    { label: 'Prioridade', value: priority?.name || '—', desc: priority ? `Score ${priority.score}/100` : 'Sem dados' },
  ]

  return (
    <DashboardLayout
      eyebrow="Inteligência estratégica para MEIs e PMEs"
      title="Dashboard"
      actions={
        <Link
          href="/diagnostico"
          className="h-10 px-5 rounded-xl font-bold text-white text-sm flex items-center"
          style={{ background: 'var(--green)' }}
        >
          Novo diagnóstico
        </Link>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'var(--muted)' }}>
          Carregando...
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Hero panel */}
          <div
            className="rounded-3xl p-7 flex items-center gap-6 relative overflow-hidden"
            style={{ background: 'white', border: '1px solid var(--border)' }}
          >
            <div
              className="absolute inset-y-0 left-0 w-2 rounded-l-3xl"
              style={{ background: 'linear-gradient(to bottom, var(--green), var(--gold), var(--blue))' }}
            />
            <div className="flex-1 pl-2">
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--green-dark)' }}>
                Resumo da carteira
              </p>
              <h2 className="text-2xl font-black" style={{ color: 'var(--ink)' }}>
                {selectedEmpresa ? selectedEmpresa.name : 'Nenhuma empresa selecionada'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {selectedEmpresa
                  ? `Score atual: ${overall}/100, nível ${getMaturity(overall)}. ${latestDiag ? `Diagnóstico em ${new Date(latestDiag.created_at).toLocaleDateString('pt-BR')}.` : 'Nenhum diagnóstico ainda.'}`
                  : 'Cadastre uma empresa para iniciar o diagnóstico e gerar plano de ação.'}
              </p>
              {empresas.length > 1 && (
                <select
                  className="mt-3 border rounded-xl px-3 h-9 text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
                  value={selectedEmpresa?.id || ''}
                  onChange={e => setSelectedEmpresa(empresas.find(emp => emp.id === e.target.value) || null)}
                >
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              )}
            </div>
            <ScoreRing score={overall} />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            {metrics.map(m => (
              <div
                key={m.label}
                className="rounded-2xl p-5"
                style={{ background: 'white', border: '1px solid var(--border)' }}
              >
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{m.label}</p>
                <p className="text-3xl font-black mt-2" style={{ color: 'var(--ink)' }}>{m.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Score + Tasks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--green-dark)' }}>Maturidade</p>
              <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--ink)' }}>Score por área</h3>
              {scores.some(s => s.score > 0) ? (
                <div className="flex flex-col gap-4">
                  {scores.map(s => <ScoreBar key={s.slug} name={s.name} score={s.score} />)}
                </div>
              ) : (
                <p className="text-sm p-4 rounded-xl border border-dashed" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
                  Gere um diagnóstico para ver os scores por área.
                </p>
              )}
            </div>

            <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--green-dark)' }}>Execução</p>
              <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--ink)' }}>Próximas ações</h3>
              {nextTasks.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {nextTasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id, task.done)}
                        className="mt-0.5 w-5 h-5 shrink-0 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{task.title}</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted)' }}>{task.description}</p>
                      </div>
                      <span
                        className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: 'var(--surface-soft)', color: 'var(--green-dark)' }}
                      >
                        {task.area}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm p-4 rounded-xl border border-dashed" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
                  {tarefas.length > 0 ? 'Todas as tarefas concluídas!' : 'Gere um diagnóstico para criar ações.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <Toast />
    </DashboardLayout>
  )
}

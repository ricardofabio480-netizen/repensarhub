'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Toast, { showToast } from '@/components/Toast'
import { createClient } from '@/lib/supabase-browser'

type Tarefa = {
  id: string
  area: string
  title: string
  description: string
  priority: string
  impact: string
  difficulty: string
  done: boolean
}

type Filter = 'all' | 'open' | 'done'

const priorityStyle: Record<string, React.CSSProperties> = {
  Alta: { background: '#fff0ee', color: 'var(--red)' },
  Média: { background: '#fff4d8', color: '#8a5c00' },
}

export default function PlanoPage() {
  const supabase = createClient()
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase
      .from('tarefas')
      .select('id, area, title, description, priority, impact, difficulty, done')
      .order('created_at', { ascending: false })
    setTarefas(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleTask(id: string, done: boolean) {
    await supabase.from('tarefas').update({ done: !done }).eq('id', id)
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, done: !done } : t))
    showToast(done ? 'Tarefa reaberta.' : 'Tarefa concluída!')
  }

  const filtered = tarefas.filter(t => {
    if (filter === 'open') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'open', label: 'Abertas' },
    { key: 'done', label: 'Concluídas' },
  ]

  return (
    <DashboardLayout
      eyebrow="Execução"
      title="Plano de Ação"
      actions={
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="h-9 px-4 rounded-xl text-sm font-semibold cursor-pointer border transition"
              style={{
                borderColor: filter === f.key ? 'var(--green)' : 'var(--border)',
                background: filter === f.key ? 'var(--surface-soft)' : 'white',
                color: filter === f.key ? 'var(--green-dark)' : 'var(--ink)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="p-5 rounded-xl border border-dashed text-sm text-center" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
            {tarefas.length === 0
              ? 'Gere um diagnóstico para criar o plano de ação.'
              : 'Nenhuma tarefa neste filtro.'}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(task => (
              <div
                key={task.id}
                className="flex items-start gap-4 p-4 rounded-2xl border"
                style={{
                  borderColor: 'var(--border)',
                  background: task.done ? 'var(--surface)' : '#fbfdfb',
                  opacity: task.done ? 0.65 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id, task.done)}
                  className="w-5 h-5 mt-1 shrink-0 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'var(--surface-soft)', color: 'var(--green-dark)' }}
                    >
                      {task.area}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={priorityStyle[task.priority] || priorityStyle['Média']}
                    >
                      Prioridade {task.priority}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: '#eaf4f8', color: 'var(--blue)' }}
                    >
                      Impacto {task.impact}
                    </span>
                  </div>
                  <p className="font-bold text-sm" style={{ color: 'var(--ink)', textDecoration: task.done ? 'line-through' : 'none' }}>
                    {task.title}
                  </p>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {task.description}
                  </p>
                </div>
                <span
                  className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={task.done
                    ? { background: 'var(--surface-soft)', color: 'var(--muted)' }
                    : { background: '#fff4d8', color: '#8a5c00' }
                  }
                >
                  {task.done ? 'Concluída' : 'Aberta'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Toast />
    </DashboardLayout>
  )
}

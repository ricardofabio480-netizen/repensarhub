'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Toast, { showToast } from '@/components/Toast'
import { createClient } from '@/lib/supabase-browser'

type Empresa = {
  id: string
  name: string
  cnpj: string
  segment: string
  size: string
  responsible: string
  email: string
  created_at: string
}

const SIZES = ['MEI', 'Microempresa', 'Pequena empresa']

export default function EmpresasPage() {
  const supabase = createClient()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', cnpj: '', segment: '', size: 'MEI', responsible: '', email: '' })

  async function load() {
    const { data } = await supabase.from('empresas').select('*').order('created_at', { ascending: false })
    setEmpresas(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('empresas').insert({ ...form, user_id: user.id })

    if (error) {
      showToast('Erro ao salvar empresa.')
    } else {
      setForm({ name: '', cnpj: '', segment: '', size: 'MEI', responsible: '', email: '' })
      showToast('Empresa cadastrada com sucesso.')
      load()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir empresa e todos os dados relacionados?')) return
    await supabase.from('empresas').delete().eq('id', id)
    showToast('Empresa excluída.')
    load()
  }

  const inputCls = 'w-full border rounded-xl px-4 h-12 text-sm focus:outline-none transition'
  const inputStyle = { borderColor: 'var(--border)', color: 'var(--ink)' }

  return (
    <DashboardLayout eyebrow="Carteira" title="Empresas">
      <div className="grid grid-cols-2 gap-5">
        {/* Form */}
        <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--green-dark)' }}>Cadastro</p>
          <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--ink)' }}>Nova empresa</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                Nome da empresa *
                <input required value={form.name} onChange={field('name')} placeholder="Ex: Padaria Sol Nascente" className={inputCls} style={inputStyle} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                CNPJ
                <input value={form.cnpj} onChange={field('cnpj')} placeholder="00.000.000/0001-00" className={inputCls} style={inputStyle} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                Segmento *
                <input required value={form.segment} onChange={field('segment')} placeholder="Alimentação, beleza, varejo..." className={inputCls} style={inputStyle} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                Porte
                <select value={form.size} onChange={field('size')} className={inputCls} style={inputStyle}>
                  {SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                Responsável
                <input value={form.responsible} onChange={field('responsible')} placeholder="Nome do responsável" className={inputCls} style={inputStyle} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                E-mail
                <input type="email" value={form.email} onChange={field('email')} placeholder="cliente@email.com" className={inputCls} style={inputStyle} />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="h-12 rounded-xl font-bold text-white cursor-pointer disabled:opacity-60 mt-1"
              style={{ background: 'var(--green)' }}
            >
              {saving ? 'Salvando...' : 'Salvar empresa'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--green-dark)' }}>Carteira</p>
          <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--ink)' }}>Empresas cadastradas</h2>

          {loading ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Carregando...</p>
          ) : empresas.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed text-sm text-center" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
              Nenhuma empresa cadastrada ainda.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {empresas.map(emp => (
                <div
                  key={emp.id}
                  className="rounded-2xl p-4 flex items-start justify-between gap-3"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--ink)' }}>{emp.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{emp.size} · {emp.segment}</p>
                    {emp.responsible && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Resp: {emp.responsible}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'var(--surface-soft)', color: 'var(--green-dark)' }}
                    >
                      {emp.cnpj || 'Sem CNPJ'}
                    </span>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-xs px-2 py-1 rounded-lg font-semibold"
                      style={{ background: '#fff0ee', color: 'var(--red)' }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toast />
    </DashboardLayout>
  )
}

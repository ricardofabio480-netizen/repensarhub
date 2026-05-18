'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Toast, { showToast } from '@/components/Toast'
import { createClient } from '@/lib/supabase-browser'

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({
    name: '',
    organization_name: '',
    organization_color: '#1f8a55',
    role: 'Consultor',
  })
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setEmail(user.email || '')

      const { data } = await supabase.from('profiles').select('name, organization_name, organization_color, role').eq('id', user.id).single()
      if (data) {
        setForm({
          name: data.name || '',
          organization_name: data.organization_name || '',
          organization_color: data.organization_color || '#1f8a55',
          role: data.role || 'Consultor',
        })
      }
    }
    load()
  }, [])

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...form })
    if (error) {
      showToast('Erro ao salvar.')
    } else {
      document.documentElement.style.setProperty('--green', form.organization_color)
      showToast('Configurações salvas.')
    }
    setSaving(false)
  }

  const inputCls = 'w-full border rounded-xl px-4 h-12 text-sm focus:outline-none'
  const inputStyle = { borderColor: 'var(--border)', color: 'var(--ink)' }

  return (
    <DashboardLayout eyebrow="Conta" title="Configurações">
      <div className="grid grid-cols-2 gap-5">
        {/* Profile form */}
        <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--green-dark)' }}>Perfil</p>
          <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--ink)' }}>Dados da conta</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                Seu nome
                <input value={form.name} onChange={field('name')} placeholder="Nome completo" className={inputCls} style={inputStyle} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                Tipo de conta
                <select value={form.role} onChange={field('role')} className={inputCls} style={inputStyle}>
                  <option>Consultor</option>
                  <option>Contador</option>
                  <option>Instituição</option>
                  <option>Empresa</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold col-span-2" style={{ color: 'var(--muted)' }}>
                E-mail (somente leitura)
                <input value={email} readOnly className={inputCls} style={{ ...inputStyle, background: 'var(--surface)' }} />
              </label>
            </div>

            <div className="border-t pt-4 mt-2" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--green-dark)' }}>Marca branca</p>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                  Nome da consultoria
                  <input value={form.organization_name} onChange={field('organization_name')} placeholder="Ex: Repens4R Consultoria" className={inputCls} style={inputStyle} />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
                  Cor principal
                  <input type="color" value={form.organization_color} onChange={field('organization_color')} className="h-12 w-full rounded-xl border cursor-pointer" style={inputStyle} />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="h-12 rounded-xl font-bold text-white cursor-pointer disabled:opacity-60"
              style={{ background: 'var(--green)' }}
            >
              {saving ? 'Salvando...' : 'Salvar configurações'}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--green-dark)' }}>Segurança</p>
            <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--ink)' }}>Senha</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Para alterar sua senha, utilize a opção "Esqueci minha senha" na tela de login.
            </p>
          </div>

          <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--green-dark)' }}>Banco de dados</p>
            <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--ink)' }}>Schema Supabase</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              Este SaaS usa as tabelas: <code className="px-1 rounded font-mono text-xs" style={{ background: 'var(--surface-soft)' }}>profiles</code>, <code className="px-1 rounded font-mono text-xs" style={{ background: 'var(--surface-soft)' }}>empresas</code>, <code className="px-1 rounded font-mono text-xs" style={{ background: 'var(--surface-soft)' }}>diagnosticos</code> e <code className="px-1 rounded font-mono text-xs" style={{ background: 'var(--surface-soft)' }}>tarefas</code>.
            </p>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
              Veja o arquivo <code className="px-1 rounded font-mono text-xs" style={{ background: 'var(--surface-soft)' }}>schema.sql</code> na raiz do projeto para criar as tabelas.
            </p>
          </div>
        </div>
      </div>
      <Toast />
    </DashboardLayout>
  )
}

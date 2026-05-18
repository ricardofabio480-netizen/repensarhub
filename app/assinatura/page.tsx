'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Toast, { showToast } from '@/components/Toast'
import { createClient } from '@/lib/supabase-browser'

const plans = [
  {
    key: 'Gratuito',
    label: 'Teste',
    price: 'R$ 0',
    tag: 'Gratuito',
    tagStyle: { background: 'var(--surface-soft)', color: 'var(--green-dark)' },
    features: ['1 empresa', '1 diagnóstico', 'Relatório simples'],
    featured: false,
  },
  {
    key: 'Starter',
    label: 'Consultor iniciante',
    price: 'R$ 49',
    tag: 'Starter',
    tagStyle: { background: '#eaf4f8', color: 'var(--blue)' },
    features: ['5 empresas', 'Diagnósticos ilimitados', 'Relatório com PDF'],
    featured: false,
  },
  {
    key: 'Pro',
    label: 'Mais vendido',
    price: 'R$ 149',
    tag: 'Pro',
    tagStyle: { background: 'var(--surface-soft)', color: 'var(--green-dark)' },
    features: ['30 empresas', 'IA consultiva (Claude AI)', 'Relatório profissional', 'Logo do consultor'],
    featured: true,
  },
  {
    key: 'Agência',
    label: 'Equipe',
    price: 'R$ 399',
    tag: 'Agência',
    tagStyle: { background: '#fff4d8', color: '#8a5c00' },
    features: ['150 empresas', 'Marca branca', 'Múltiplos usuários', 'Dashboard institucional'],
    featured: false,
  },
]

export default function AssinaturaPage() {
  const supabase = createClient()
  const [currentPlan, setCurrentPlan] = useState('Gratuito')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      if (data?.plan) setCurrentPlan(data.plan)
    }
    load()
  }, [])

  async function selectPlan(plan: string) {
    if (!userId) return
    await supabase.from('profiles').update({ plan }).eq('id', userId)
    setCurrentPlan(plan)
    showToast(`Plano ${plan} ativado.`)
  }

  return (
    <DashboardLayout eyebrow="Monetização" title="Assinatura">
      <div className="grid grid-cols-4 gap-4">
        {plans.map(plan => (
          <div
            key={plan.key}
            className="rounded-3xl p-6 flex flex-col gap-4"
            style={{
              background: 'white',
              border: plan.featured
                ? '2px solid var(--green)'
                : '1px solid var(--border)',
              outline: plan.featured ? '4px solid rgba(31,138,85,0.1)' : 'none',
            }}
          >
            <div>
              <span
                className="inline-block px-3 py-0.5 rounded-full text-xs font-bold"
                style={plan.tagStyle}
              >
                {plan.tag}
              </span>
              <h3 className="font-bold mt-3 text-base" style={{ color: 'var(--ink)' }}>{plan.label}</h3>
            </div>

            <p className="text-3xl font-black" style={{ color: 'var(--ink)' }}>
              {plan.price}
              {plan.key !== 'Gratuito' && <span className="text-sm font-normal" style={{ color: 'var(--muted)' }}>/mês</span>}
            </p>

            <ul className="flex flex-col gap-2">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                  <span style={{ color: 'var(--green)' }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => selectPlan(plan.key)}
              disabled={currentPlan === plan.key}
              className="mt-auto h-11 rounded-xl font-bold text-sm cursor-pointer disabled:opacity-50 transition"
              style={
                currentPlan === plan.key
                  ? { background: 'var(--surface-soft)', color: 'var(--green-dark)' }
                  : plan.featured
                  ? { background: 'var(--green)', color: 'white' }
                  : { background: 'white', color: 'var(--ink)', border: '1px solid var(--border)' }
              }
            >
              {currentPlan === plan.key ? 'Plano atual' : 'Selecionar'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl p-5 text-sm" style={{ background: 'var(--surface-soft)', color: 'var(--muted)' }}>
        <strong style={{ color: 'var(--ink)' }}>Nota:</strong> Esta é uma demo do sistema de assinatura. Em produção, integre com Stripe ou Pagar.me para cobranças reais. Os planos aqui mudam apenas o registro no banco de dados.
      </div>
      <Toast />
    </DashboardLayout>
  )
}

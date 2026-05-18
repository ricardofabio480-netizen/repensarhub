'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const features = [
  { title: 'Diagnóstico inteligente', desc: 'Avalie estratégia, financeiro, regularização, ESG, energia e mercado.' },
  { title: 'Plano automático com IA', desc: 'Claude AI gera análise consultiva personalizada com base nos scores reais.' },
  { title: 'Relatório profissional', desc: 'Entrega com aparência de consultoria premium para apresentar ao cliente.' },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen grid"
      style={{
        gridTemplateColumns: '1fr 460px',
        background: 'radial-gradient(circle at top left, rgba(31,138,85,0.14), transparent 40%), linear-gradient(135deg, #f5f7f5, #fff)',
      }}
    >
      {/* Hero */}
      <div className="flex flex-col justify-center p-16 gap-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl grid place-items-center text-white font-black shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--green), var(--gold))' }}
          >
            4R
          </div>
          <div>
            <p className="font-bold text-lg">Repens4R Pro</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>SaaS para consultores de pequenos negócios</p>
          </div>
        </div>

        <div>
          <span
            className="inline-block px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide mb-5"
            style={{ background: '#dff3e7', color: 'var(--green-dark)' }}
          >
            Diagnóstico · Plano de ação · Relatório
          </span>
          <h1
            className="font-black tracking-tighter leading-none max-w-xl"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', color: 'var(--ink)' }}
          >
            Transforme diagnósticos em consultorias profissionais.
          </h1>
          <p className="mt-5 text-lg leading-relaxed max-w-lg" style={{ color: 'var(--muted)' }}>
            Plataforma para consultores, contadores e instituições avaliarem MEIs e PMEs e gerarem planos de ação com aparência premium.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-2xl">
          {features.map(f => (
            <div
              key={f.title}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border)' }}
            >
              <p className="font-bold text-sm mb-2" style={{ color: 'var(--ink)' }}>{f.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div
        className="flex items-center justify-center p-8"
        style={{ background: 'var(--sidebar)' }}
      >
        <form
          onSubmit={handleLogin}
          className="w-full bg-white rounded-3xl p-8 flex flex-col gap-5 shadow-2xl"
        >
          <div>
            <h2 className="text-2xl font-black" style={{ color: 'var(--ink)' }}>Entrar</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Acesse sua conta Repens4R Pro</p>
          </div>

          {error && (
            <div className="text-sm px-4 py-3 rounded-xl font-semibold" style={{ background: '#fff0ee', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
              E-mail
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border rounded-xl px-4 h-12 text-sm focus:outline-none focus:ring-2 transition"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
              Senha
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-xl px-4 h-12 text-sm focus:outline-none focus:ring-2 transition"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-xl font-bold text-white transition-opacity disabled:opacity-60 cursor-pointer"
            style={{ background: 'var(--green)' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
            Não tem conta?{' '}
            <Link href="/register" className="font-bold" style={{ color: 'var(--green)' }}>
              Criar conta grátis
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

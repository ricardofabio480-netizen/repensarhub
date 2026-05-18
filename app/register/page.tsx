'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Consultor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmEmail, setConfirmEmail] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Se a sessão veio imediatamente, vai direto pro dashboard
    if (data.session) {
      router.push('/')
      router.refresh()
      return
    }

    // Supabase exige confirmação de e-mail
    setConfirmEmail(true)
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--surface)' }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-2xl grid place-items-center text-white font-black text-sm"
            style={{ background: 'linear-gradient(135deg, var(--green), var(--gold))' }}
          >
            4R
          </div>
          <div>
            <p className="font-bold">Repens4R Pro</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Criar nova conta</p>
          </div>
        </div>

        {confirmEmail && (
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center flex flex-col gap-4" style={{ border: '1px solid var(--border)' }}>
            <div className="text-4xl">📧</div>
            <h2 className="text-xl font-black" style={{ color: 'var(--ink)' }}>Confirme seu e-mail</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              Enviamos um link de confirmação para <strong>{email}</strong>. Clique no link e depois faça login.
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Ou desative a confirmação de e-mail em: Supabase → Authentication → Providers → Email → desligar "Confirm email"
            </p>
            <Link
              href="/login"
              className="h-12 rounded-xl font-bold text-white flex items-center justify-center"
              style={{ background: 'var(--green)' }}
            >
              Ir para o login
            </Link>
          </div>
        )}

        {!confirmEmail && <form
          onSubmit={handleRegister}
          className="bg-white rounded-3xl p-8 flex flex-col gap-5 shadow-lg"
          style={{ border: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="text-2xl font-black" style={{ color: 'var(--ink)' }}>Criar conta</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Comece gratuitamente. Sem cartão.</p>
          </div>

          {error && (
            <div className="text-sm px-4 py-3 rounded-xl font-semibold" style={{ background: '#fff0ee', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
              Seu nome
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full border rounded-xl px-4 h-12 text-sm focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
              E-mail
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border rounded-xl px-4 h-12 text-sm focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
              Tipo de conta
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full border rounded-xl px-4 h-12 text-sm focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              >
                <option>Consultor</option>
                <option>Contador</option>
                <option>Instituição</option>
                <option>Empresa</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
              Senha
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border rounded-xl px-4 h-12 text-sm focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-xl font-bold text-white cursor-pointer disabled:opacity-60"
            style={{ background: 'var(--green)' }}
          >
            {loading ? 'Criando conta...' : 'Criar conta grátis'}
          </button>

          <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
            Já tem conta?{' '}
            <Link href="/login" className="font-bold" style={{ color: 'var(--green)' }}>
              Entrar
            </Link>
          </p>
        </form>}
      </div>
    </div>
  )
}
